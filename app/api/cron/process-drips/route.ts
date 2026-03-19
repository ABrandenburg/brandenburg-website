import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendMessage } from '@/lib/messaging/send';
import { advanceEnrollment } from '@/lib/sequences/engine';

function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('Supabase credentials not configured');
    return createClient(url, key);
}

/**
 * Process pending drip messages — runs every 5 minutes via Vercel cron
 */
export async function GET(request: NextRequest) {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const now = new Date().toISOString();
    let sent = 0;
    let failed = 0;
    let skipped = 0;

    try {
        // Fetch pending messages that are due
        const { data: pendingMessages, error } = await supabase
            .from('pending_drip_messages')
            .select(`
                id,
                enrollment_id,
                customer_id,
                message_body,
                attempts
            `)
            .eq('status', 'pending')
            .lte('send_at', now)
            .order('send_at', { ascending: true })
            .limit(50); // Process in batches

        if (error || !pendingMessages || pendingMessages.length === 0) {
            return NextResponse.json({
                message: 'No pending drip messages',
                error: error?.message,
            });
        }

        for (const msg of pendingMessages) {
            try {
                // Verify enrollment is still active
                const { data: enrollment } = await supabase
                    .from('drip_enrollments')
                    .select('status, conversation_id')
                    .eq('id', msg.enrollment_id)
                    .single();

                if (!enrollment || enrollment.status !== 'active') {
                    await supabase
                        .from('pending_drip_messages')
                        .update({ status: 'cancelled' })
                        .eq('id', msg.id);
                    skipped++;
                    continue;
                }

                // Get customer phone
                const { data: customer } = await supabase
                    .from('customers')
                    .select('phone_e164')
                    .eq('id', msg.customer_id)
                    .single();

                if (!customer?.phone_e164) {
                    await supabase
                        .from('pending_drip_messages')
                        .update({
                            status: 'failed',
                            last_error: 'No customer phone',
                        })
                        .eq('id', msg.id);
                    failed++;
                    continue;
                }

                // Find or use the conversation
                let conversationId = enrollment.conversation_id;
                if (!conversationId) {
                    // Find the most recent conversation for this customer
                    const { data: convo } = await supabase
                        .from('conversations')
                        .select('id')
                        .eq('customer_id', msg.customer_id)
                        .order('created_at', { ascending: false })
                        .limit(1)
                        .maybeSingle();

                    if (!convo) {
                        // Create a new conversation for drip messages
                        const { data: newConvo } = await supabase
                            .from('conversations')
                            .insert({
                                customer_id: msg.customer_id,
                                source: 'drip',
                                status: 'ai_active',
                                ai_enabled: true,
                            })
                            .select('id')
                            .single();
                        conversationId = newConvo?.id;
                    } else {
                        conversationId = convo.id;
                    }
                }

                if (!conversationId) {
                    failed++;
                    continue;
                }

                // Send the message
                const result = await sendMessage({
                    to: customer.phone_e164,
                    body: msg.message_body,
                    conversationId,
                    customerId: msg.customer_id,
                    sender: 'drip_system',
                    isUrgent: false,
                });

                if (result.success) {
                    await supabase
                        .from('pending_drip_messages')
                        .update({
                            status: 'sent',
                            sent_at: new Date().toISOString(),
                        })
                        .eq('id', msg.id);

                    // Advance enrollment to next step
                    await advanceEnrollment(msg.enrollment_id);
                    sent++;
                } else if (result.blocked === 'outside_hours' || result.blocked === 'rate_limited') {
                    // Don't mark as failed — will retry next cron run
                    skipped++;
                } else {
                    const attempts = (msg.attempts || 0) + 1;
                    await supabase
                        .from('pending_drip_messages')
                        .update({
                            status: attempts >= 3 ? 'failed' : 'pending',
                            attempts,
                            last_error: result.error || result.blocked || 'Unknown error',
                        })
                        .eq('id', msg.id);
                    failed++;
                }
            } catch (err: any) {
                console.error(`Failed to process drip message ${msg.id}:`, err);
                await supabase
                    .from('pending_drip_messages')
                    .update({
                        attempts: (msg.attempts || 0) + 1,
                        last_error: err.message,
                    })
                    .eq('id', msg.id);
                failed++;
            }
        }

        return NextResponse.json({
            processed: pendingMessages.length,
            sent,
            failed,
            skipped,
        });
    } catch (error: any) {
        console.error('Drip processor error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
