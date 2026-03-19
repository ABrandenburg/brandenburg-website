import { NextRequest, NextResponse, after } from 'next/server';
import { logWebhookEvent, markWebhookProcessed, markWebhookFailed } from '@/lib/webhooks/log';
import { verifyGoogleLsaWebhook } from '@/lib/webhooks/verify';
import { normalizePhone } from '@/lib/webhooks/phone';
import { isWebhookDuplicate, isSuppressed, findOrCreateCustomer, createConversation } from '@/lib/webhooks/dedup';
import { triggerSpeedToLead } from '@/lib/ai/engine';

export async function POST(request: NextRequest) {
    let eventId: string | undefined;

    try {
        const rawBody = await request.text();
        const payload = JSON.parse(rawBody);

        // 1. Log raw payload
        eventId = await logWebhookEvent({
            source: 'lsa',
            idempotencyKey: payload.lead_id || payload.leadId || payload.id,
            rawPayload: payload,
        });

        // 2. Verify auth
        const googleKey = payload.google_key || request.nextUrl.searchParams.get('google_key');
        if (!verifyGoogleLsaWebhook(googleKey)) {
            await markWebhookFailed(eventId, 'Authentication failed');
            return NextResponse.json({ received: true }, { status: 200 });
        }

        // 3. Check idempotency
        const leadId = payload.lead_id || payload.leadId || payload.id || '';
        if (leadId && await isWebhookDuplicate('lsa', leadId)) {
            await markWebhookProcessed(eventId);
            return NextResponse.json({ received: true, duplicate: true }, { status: 200 });
        }

        // 4. Normalize phone
        const phone = normalizePhone(
            payload.customer_phone_number || payload.phone || payload.consumer?.phone
        );
        if (!phone) {
            await markWebhookFailed(eventId, 'No valid phone number');
            return NextResponse.json({ received: true }, { status: 200 });
        }

        // 5. Check suppression
        if (await isSuppressed(phone)) {
            await markWebhookProcessed(eventId);
            return NextResponse.json({ received: true, suppressed: true }, { status: 200 });
        }

        // 6. Parse lead data
        const firstName = payload.customer_first_name || payload.firstName || '';
        const lastName = payload.customer_last_name || payload.lastName || '';
        const email = payload.customer_email || payload.email || '';
        const serviceType = payload.service_category || payload.category || payload.vertical || '';
        const zip = payload.zip_code || payload.zip || '';

        // 7. Find or create customer
        const { id: customerId } = await findOrCreateCustomer({
            phoneE164: phone,
            firstName,
            lastName,
            email,
            zip,
            source: 'lsa',
        });

        // 8. Create conversation
        const conversationId = await createConversation({
            customerId,
            source: 'lsa',
            sourceLeadId: leadId,
            serviceType,
            metadata: {
                lsaLeadId: leadId,
                leadType: payload.lead_type,
                chargeStatus: payload.charge_status,
            },
        });

        await markWebhookProcessed(eventId);

        // 9. Speed-to-lead
        after(async () => {
            try {
                await triggerSpeedToLead({
                    conversationId,
                    customerId,
                    customerPhone: phone,
                    customerName: [firstName, lastName].filter(Boolean).join(' ') || undefined,
                    source: 'lsa',
                    serviceType,
                });
            } catch (err) {
                console.error('Speed-to-lead error (LSA):', err);
            }
        });

        return NextResponse.json({ received: true, conversationId }, { status: 200 });
    } catch (error: any) {
        console.error('Google LSA webhook error:', error);
        if (eventId) await markWebhookFailed(eventId, error.message);
        return NextResponse.json({ received: true, error: 'processing_failed' }, { status: 200 });
    }
}
