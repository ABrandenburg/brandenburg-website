import { NextRequest, NextResponse } from 'next/server';
import { logWebhookEvent, markWebhookProcessed, markWebhookFailed } from '@/lib/webhooks/log';
import { verifyThumbtackWebhook } from '@/lib/webhooks/verify';
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
            source: 'thumbtack',
            idempotencyKey: payload.leadID || payload.lead_id || payload.id,
            rawPayload: payload,
        });

        // 2. Verify auth (HMAC signature or bearer token)
        const signature = request.headers.get('x-thumbtack-signature')
            || request.headers.get('x-hub-signature');
        if (signature && !verifyThumbtackWebhook(rawBody, signature)) {
            await markWebhookFailed(eventId, 'Signature verification failed');
            return NextResponse.json({ received: true }, { status: 200 });
        }

        // 3. Check idempotency
        const leadId = payload.leadID || payload.lead_id || payload.id || '';
        if (leadId && await isWebhookDuplicate('thumbtack', leadId)) {
            await markWebhookProcessed(eventId);
            return NextResponse.json({ received: true, duplicate: true }, { status: 200 });
        }

        // 4. Normalize phone
        const phone = normalizePhone(
            payload.customerPhone || payload.customer?.phone || payload.phone
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
        const customerName = payload.customerName || payload.customer?.name || '';
        const nameParts = customerName.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        const email = payload.customerEmail || payload.customer?.email || '';
        const serviceType = payload.category || payload.request?.category || payload.service || '';
        const address = payload.address || payload.location?.address || '';
        const city = payload.city || payload.location?.city || '';
        const zip = payload.zipCode || payload.location?.zipCode || '';

        // 7. Find or create customer
        const { id: customerId } = await findOrCreateCustomer({
            phoneE164: phone,
            firstName,
            lastName,
            email,
            address,
            city,
            zip,
            source: 'thumbtack',
        });

        // 8. Create conversation
        const conversationId = await createConversation({
            customerId,
            source: 'thumbtack',
            sourceLeadId: leadId,
            serviceType,
            metadata: {
                thumbtackLeadId: leadId,
                rawCategory: payload.category,
                thumbtackUrl: payload.viewURL || payload.view_url,
            },
        });

        await markWebhookProcessed(eventId);

        // 9. Speed-to-lead
        triggerSpeedToLead({
            conversationId,
            customerId,
            customerPhone: phone,
            customerName: customerName || undefined,
            source: 'thumbtack',
            serviceType,
        }).catch(err => console.error('Speed-to-lead error (Thumbtack):', err));

        return NextResponse.json({ received: true, conversationId }, { status: 200 });
    } catch (error: any) {
        console.error('Thumbtack webhook error:', error);
        if (eventId) await markWebhookFailed(eventId, error.message);
        return NextResponse.json({ received: true, error: 'processing_failed' }, { status: 200 });
    }
}
