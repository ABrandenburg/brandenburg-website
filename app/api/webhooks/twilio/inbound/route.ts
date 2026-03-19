import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logWebhookEvent, markWebhookProcessed, markWebhookFailed } from '@/lib/webhooks/log';
import { normalizePhone } from '@/lib/webhooks/phone';
import { isSuppressed } from '@/lib/webhooks/dedup';
import { sendMessage } from '@/lib/messaging/send';
import { TCPA_MESSAGES } from '@/lib/messaging/templates';
import { processWithAI } from '@/lib/ai/engine';
import { classifyDripReply } from '@/lib/ai/intent-classifier';

function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('Supabase credentials not configured');
    return createClient(url, key);
}

// TCPA keywords that must be handled at the inbound layer
const STOP_KEYWORDS = ['STOP', 'UNSUBSCRIBE', 'CANCEL', 'QUIT', 'END'];
const START_KEYWORDS = ['START', 'SUBSCRIBE', 'YES'];
const HELP_KEYWORDS = ['HELP', 'INFO'];

export async function POST(request: NextRequest) {
    let eventId: string | undefined;

    try {
        // Twilio sends form-encoded data
        const formData = await request.formData();
        const payload: Record<string, string> = {};
        formData.forEach((value, key) => {
            payload[key] = String(value);
        });

        // 1. Log raw payload
        eventId = await logWebhookEvent({
            source: 'twilio_inbound',
            idempotencyKey: payload.MessageSid || payload.SmsSid,
            rawPayload: payload,
        });

        const supabase = getSupabaseAdmin();
        const fromPhone = normalizePhone(payload.From);
        const body = (payload.Body || '').trim();

        if (!fromPhone) {
            await markWebhookFailed(eventId, 'No valid From phone');
            return new NextResponse('<Response></Response>', {
                headers: { 'Content-Type': 'text/xml' },
            });
        }

        // 2. Handle TCPA keywords FIRST
        const upperBody = body.toUpperCase().trim();

        if (STOP_KEYWORDS.includes(upperBody)) {
            // Add to suppression list
            await supabase
                .from('suppression_list')
                .upsert({
                    phone_e164: fromPhone,
                    reason: 'opt_out',
                    source: 'twilio_stop',
                }, { onConflict: 'phone_e164' });

            // Cancel all active drip enrollments
            const { data: customer } = await supabase
                .from('customers')
                .select('id')
                .eq('phone_e164', fromPhone)
                .maybeSingle();

            if (customer) {
                await supabase
                    .from('drip_enrollments')
                    .update({
                        status: 'cancelled',
                        cancelled_at: new Date().toISOString(),
                        cancel_reason: 'customer_stop',
                    })
                    .eq('customer_id', customer.id)
                    .eq('status', 'active');
            }

            await markWebhookProcessed(eventId);

            // Return TwiML response for STOP confirmation
            return new NextResponse(
                `<Response><Message>${TCPA_MESSAGES.STOP_CONFIRMED}</Message></Response>`,
                { headers: { 'Content-Type': 'text/xml' } }
            );
        }

        if (START_KEYWORDS.includes(upperBody)) {
            // Remove from suppression list
            await supabase
                .from('suppression_list')
                .delete()
                .eq('phone_e164', fromPhone);

            await markWebhookProcessed(eventId);

            return new NextResponse(
                `<Response><Message>${TCPA_MESSAGES.START_CONFIRMED}</Message></Response>`,
                { headers: { 'Content-Type': 'text/xml' } }
            );
        }

        if (HELP_KEYWORDS.includes(upperBody)) {
            await markWebhookProcessed(eventId);

            return new NextResponse(
                `<Response><Message>${TCPA_MESSAGES.HELP}</Message></Response>`,
                { headers: { 'Content-Type': 'text/xml' } }
            );
        }

        // 3. Check suppression (shouldn't happen but safety check)
        if (await isSuppressed(fromPhone)) {
            await markWebhookProcessed(eventId);
            return new NextResponse('<Response></Response>', {
                headers: { 'Content-Type': 'text/xml' },
            });
        }

        // 4. Find customer and their active conversation
        let { data: customer } = await supabase
            .from('customers')
            .select('id, first_name, last_name')
            .eq('phone_e164', fromPhone)
            .maybeSingle();

        if (!customer) {
            // Create customer from inbound SMS
            const { data: newCustomer } = await supabase
                .from('customers')
                .insert({
                    phone_e164: fromPhone,
                    source: 'inbound_sms',
                })
                .select('id, first_name, last_name')
                .single();
            customer = newCustomer;
        }

        if (!customer) {
            await markWebhookFailed(eventId, 'Failed to find/create customer');
            return new NextResponse('<Response></Response>', {
                headers: { 'Content-Type': 'text/xml' },
            });
        }

        // Find most recent active conversation or create new one
        let { data: conversation } = await supabase
            .from('conversations')
            .select('id, ai_enabled, status')
            .eq('customer_id', customer.id)
            .in('status', ['new', 'ai_active', 'qualifying', 'booking'])
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (!conversation) {
            const { data: newConvo } = await supabase
                .from('conversations')
                .insert({
                    customer_id: customer.id,
                    source: 'inbound_sms',
                    status: 'new',
                    ai_enabled: true,
                })
                .select('id, ai_enabled, status')
                .single();
            conversation = newConvo;
        }

        if (!conversation) {
            await markWebhookFailed(eventId, 'Failed to find/create conversation');
            return new NextResponse('<Response></Response>', {
                headers: { 'Content-Type': 'text/xml' },
            });
        }

        // 5. Log inbound message
        await supabase
            .from('messages')
            .insert({
                conversation_id: conversation.id,
                customer_id: customer.id,
                direction: 'inbound',
                sender: 'customer',
                channel: 'sms',
                body,
                twilio_sid: payload.MessageSid || payload.SmsSid,
                delivery_status: 'delivered',
                metadata: {
                    numMedia: payload.NumMedia,
                    fromCity: payload.FromCity,
                    fromState: payload.FromState,
                },
            });

        // 6. Check if this is a reply to a drip message
        const { data: activeDrip } = await supabase
            .from('drip_enrollments')
            .select('id, sequence_id')
            .eq('customer_id', customer.id)
            .eq('status', 'active')
            .limit(1)
            .maybeSingle();

        if (activeDrip) {
            // Get the last drip message sent
            const { data: lastDripMsg } = await supabase
                .from('messages')
                .select('body')
                .eq('customer_id', customer.id)
                .eq('sender', 'drip_system')
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            const dripContext = lastDripMsg?.body || '';

            // Classify intent
            const intent = await classifyDripReply(body, dripContext);
            console.log(`Drip reply intent: ${intent} for customer ${customer.id}`);

            // Cancel the drip regardless of intent (customer engaged)
            await supabase
                .from('drip_enrollments')
                .update({
                    status: 'cancelled',
                    cancelled_at: new Date().toISOString(),
                    cancel_reason: `customer_replied_${intent.toLowerCase()}`,
                })
                .eq('id', activeDrip.id);

            // Cancel pending drip messages
            await supabase
                .from('pending_drip_messages')
                .update({ status: 'cancelled' })
                .eq('enrollment_id', activeDrip.id)
                .eq('status', 'pending');

            // Route based on intent
            switch (intent) {
                case 'NEGATIVE':
                    await supabase
                        .from('conversations')
                        .update({ status: 'closed_lost', ai_enabled: false })
                        .eq('id', conversation.id);

                    await markWebhookProcessed(eventId);
                    return new NextResponse('<Response></Response>', {
                        headers: { 'Content-Type': 'text/xml' },
                    });

                case 'WRONG_NUMBER':
                case 'IRRELEVANT':
                    await supabase
                        .from('conversations')
                        .update({ status: 'closed_lost', ai_enabled: false })
                        .eq('id', conversation.id);

                    await markWebhookProcessed(eventId);
                    return new NextResponse('<Response></Response>', {
                        headers: { 'Content-Type': 'text/xml' },
                    });

                case 'POSITIVE':
                case 'QUESTION':
                case 'BOOKING':
                    // Fall through to AI processing below
                    break;
            }
        }

        // 7. Route to AI engine or notify staff
        if (conversation.ai_enabled) {
            const customerName = [customer.first_name, customer.last_name]
                .filter(Boolean)
                .join(' ') || undefined;

            // Process with AI (fire-and-forget — don't block TwiML response)
            processWithAI({
                conversationId: conversation.id,
                customerId: customer.id,
                customerPhone: fromPhone,
                customerName,
                source: 'inbound_sms',
            }).then(async (aiResponse) => {
                if (aiResponse) {
                    await sendMessage({
                        to: fromPhone,
                        body: aiResponse,
                        conversationId: conversation!.id,
                        customerId: customer!.id,
                        sender: 'ai_chris',
                        isUrgent: true,
                    });
                }
            }).catch(err => console.error('AI processing error:', err));
        }

        await markWebhookProcessed(eventId);

        // Return empty TwiML — we send responses via REST API, not TwiML
        return new NextResponse('<Response></Response>', {
            headers: { 'Content-Type': 'text/xml' },
        });
    } catch (error: any) {
        console.error('Twilio inbound webhook error:', error);
        if (eventId) await markWebhookFailed(eventId, error.message);
        return new NextResponse('<Response></Response>', {
            headers: { 'Content-Type': 'text/xml' },
        });
    }
}
