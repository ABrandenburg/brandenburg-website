/**
 * Cron: Poll Google Ads API for new LSA leads
 * Runs every 5 minutes via Vercel cron
 *
 * Flow: Poll API → Deduplicate → Create customer/conversation → Speed-to-lead
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchRecentLsaLeads, isLsaPollingConfigured } from '@/lib/ads/google-lsa';
import { normalizePhone } from '@/lib/webhooks/phone';

/**
 * Map Google LSA category IDs to human-readable service types
 */
function parseServiceType(categoryId: string): string {
    const map: Record<string, string> = {
        'xcat:service_area_business_plumber': 'plumbing',
        'xcat:service_area_business_hvac': 'HVAC',
        'xcat:service_area_business_bathroom_remodeling': 'bathroom remodeling',
        'xcat:service_area_business_water_heater': 'water heater',
        'xcat:service_area_business_drain_cleaning': 'drain cleaning',
    };
    return map[categoryId] || categoryId.replace('xcat:service_area_business_', '').replace(/_/g, ' ');
}
import { isWebhookDuplicate, isSuppressed, findOrCreateCustomer, createConversation } from '@/lib/webhooks/dedup';
import { logWebhookEvent, markWebhookProcessed, markWebhookFailed } from '@/lib/webhooks/log';
import { triggerSpeedToLead } from '@/lib/ai/engine';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: NextRequest) {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isLsaPollingConfigured()) {
        return NextResponse.json({ message: 'LSA polling not configured', skipped: true });
    }

    let processed = 0;
    let skipped = 0;
    let failed = 0;
    const errors: string[] = [];

    try {
        // Poll for leads from the last 10 minutes (overlap with 5-min cron for safety)
        const leads = await fetchRecentLsaLeads(10);

        if (leads.length === 0) {
            return NextResponse.json({ message: 'No new LSA leads', processed: 0 });
        }

        for (const lead of leads) {
            let eventId: string | undefined;

            try {
                // 1. Log the lead as a webhook event for audit trail
                eventId = await logWebhookEvent({
                    source: 'lsa',
                    idempotencyKey: lead.leadId,
                    rawPayload: lead as unknown as Record<string, unknown>,
                });

                // 2. Check idempotency — skip if already processed
                if (await isWebhookDuplicate('lsa', lead.leadId)) {
                    await markWebhookProcessed(eventId);
                    skipped++;
                    continue;
                }

                // 3. Only process MESSAGE and PHONE_CALL leads with contact info
                if (!lead.contactPhone) {
                    await markWebhookFailed(eventId, 'No phone number in lead');
                    skipped++;
                    continue;
                }

                // 4. Normalize phone
                const phone = normalizePhone(lead.contactPhone);
                if (!phone) {
                    await markWebhookFailed(eventId, 'Invalid phone number');
                    skipped++;
                    continue;
                }

                // 5. Check suppression
                if (await isSuppressed(phone)) {
                    await markWebhookProcessed(eventId);
                    skipped++;
                    continue;
                }

                // 6. Parse name
                const nameParts = (lead.consumerName || '').split(' ');
                const firstName = nameParts[0] || '';
                const lastName = nameParts.slice(1).join(' ') || '';

                // 7. Find or create customer
                const { id: customerId } = await findOrCreateCustomer({
                    phoneE164: phone,
                    firstName,
                    lastName,
                    email: lead.contactEmail || undefined,
                    source: 'lsa',
                });

                // 8. Create conversation
                const serviceType = lead.categoryId ? parseServiceType(lead.categoryId) : '';
                const conversationId = await createConversation({
                    customerId,
                    source: 'lsa',
                    sourceLeadId: lead.leadId,
                    serviceType,
                    metadata: {
                        lsaLeadId: lead.leadId,
                        leadType: lead.leadType,
                        leadStatus: lead.leadStatus,
                        categoryId: lead.categoryId,
                        serviceId: lead.serviceId,
                        leadCharged: lead.leadCharged,
                        polledAt: new Date().toISOString(),
                    },
                });

                // 9. Mark processed
                await markWebhookProcessed(eventId);

                // 10. Trigger speed-to-lead
                try {
                    await triggerSpeedToLead({
                        conversationId,
                        customerId,
                        customerPhone: phone,
                        customerName: lead.consumerName || undefined,
                        source: 'lsa',
                        serviceType,
                    });
                } catch (err) {
                    console.error(`Speed-to-lead failed for LSA lead ${lead.leadId}:`, err);
                }

                processed++;
            } catch (err: any) {
                console.error(`Failed to process LSA lead ${lead.leadId}:`, err);
                if (eventId) await markWebhookFailed(eventId, err.message);
                errors.push(`${lead.leadId}: ${err.message}`);
                failed++;
            }
        }

        return NextResponse.json({
            polled: leads.length,
            processed,
            skipped,
            failed,
            errors: errors.length > 0 ? errors : undefined,
        });
    } catch (error: any) {
        console.error('LSA polling cron error:', error);
        return NextResponse.json({
            error: error.message,
            processed,
            skipped,
            failed,
        }, { status: 500 });
    }
}
