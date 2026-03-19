import { NextRequest, NextResponse } from 'next/server';
import { after } from 'next/server';
import { logWebhookEvent, markWebhookProcessed, markWebhookFailed } from '@/lib/webhooks/log';
import { verifyAngiWebhook } from '@/lib/webhooks/verify';
import { normalizePhone } from '@/lib/webhooks/phone';
import { isWebhookDuplicate, isSuppressed, findOrCreateCustomer, createConversation } from '@/lib/webhooks/dedup';
import { triggerSpeedToLead } from '@/lib/ai/engine';

export async function POST(request: NextRequest) {
    let eventId: string | undefined;

    try {
        const rawBody = await request.text();
        const payload = JSON.parse(rawBody);

        // 1. ALWAYS log raw payload first
        eventId = await logWebhookEvent({
            source: 'angi',
            idempotencyKey: payload.leadOid || payload.srOid || payload.leadId || payload.id,
            rawPayload: payload,
        });

        // 2. Verify auth — Angi sends crmKey in payload or x-api-key header
        const apiKey = request.headers.get('x-api-key') || payload.crmKey || null;
        if (!verifyAngiWebhook(apiKey)) {
            await markWebhookFailed(eventId, 'Authentication failed');
            return NextResponse.json({ received: true }, { status: 200 });
        }

        // 3. Check idempotency — Angi uses srOid or leadOid as lead identifiers
        const leadId = payload.leadOid || payload.srOid || payload.leadId || payload.id || '';
        if (leadId && await isWebhookDuplicate('angi', leadId)) {
            await markWebhookProcessed(eventId);
            return NextResponse.json({ received: true, duplicate: true }, { status: 200 });
        }

        // 4. Parse + normalize phone
        const phone = normalizePhone(
            payload.customerPhone || payload.phone || payload.consumer?.phone
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

        // 6. Parse lead data — Angi payload field names
        const firstName = payload.firstName || payload.customerFirstName || payload.consumer?.firstName || '';
        const lastName = payload.lastName || payload.customerLastName || payload.consumer?.lastName || '';
        const email = payload.email || payload.customerEmail || payload.consumer?.email || '';
        const serviceType = payload.description || payload.serviceType || payload.category || payload.task?.name || '';
        const address = payload.address || payload.consumer?.address || '';
        const city = payload.city || payload.consumer?.city || '';
        const state = payload.state || payload.consumer?.state || 'TX';
        const zip = payload.zip || payload.consumer?.zip || '';

        // 7. Find or create customer
        const { id: customerId } = await findOrCreateCustomer({
            phoneE164: phone,
            firstName,
            lastName,
            email,
            address,
            city,
            state,
            zip,
            source: 'angi',
        });

        // 8. Create conversation
        const conversationId = await createConversation({
            customerId,
            source: 'angi',
            sourceLeadId: leadId,
            serviceType,
            metadata: {
                angiLeadId: leadId,
                rawCategory: payload.category,
            },
        });

        // 9. Mark webhook processed
        await markWebhookProcessed(eventId);

        // 10. Speed-to-lead AI response — use after() so it runs after response is sent
        after(async () => {
            try {
                await triggerSpeedToLead({
                    conversationId,
                    customerId,
                    customerPhone: phone,
                    customerName: [firstName, lastName].filter(Boolean).join(' ') || undefined,
                    source: 'angi',
                    serviceType,
                });
            } catch (err) {
                console.error('Speed-to-lead error (Angi):', err);
            }
        });

        return NextResponse.json({ received: true, conversationId }, { status: 200 });
    } catch (error: any) {
        console.error('Angi webhook error:', error);
        if (eventId) await markWebhookFailed(eventId, error.message);
        // Always return 200 to prevent upstream retries
        return NextResponse.json({ received: true, error: 'processing_failed' }, { status: 200 });
    }
}
