/**
 * Google Ads API — Local Services Lead Polling
 *
 * Polls the local_services_lead resource for new leads.
 * Uses a separate customer ID from the main Google Ads account
 * since LSA runs on its own account.
 */

import { GoogleAdsApi } from 'google-ads-api';

// Google Ads API lead_type enum values
const LEAD_TYPE = {
    MESSAGE: 2,
    PHONE_CALL: 3,
    BOOKING: 4,
} as const;

export interface LsaLead {
    resourceName: string;
    leadId: string;
    categoryId: string;
    serviceId: string;
    contactPhone: string | null;
    contactEmail: string | null;
    consumerName: string | null;
    leadType: number;
    leadTypeLabel: string;
    leadStatus: number;
    creationDateTime: string;
    locale: string;
    leadCharged: boolean;
}

/**
 * Check if LSA polling is configured
 */
export function isLsaPollingConfigured(): boolean {
    return !!(
        process.env.GOOGLE_ADS_CLIENT_ID &&
        process.env.GOOGLE_ADS_CLIENT_SECRET &&
        process.env.GOOGLE_ADS_DEVELOPER_TOKEN &&
        process.env.GOOGLE_ADS_REFRESH_TOKEN &&
        process.env.GOOGLE_ADS_LSA_CUSTOMER_ID
    );
}

function getLeadTypeLabel(type: number): string {
    switch (type) {
        case LEAD_TYPE.MESSAGE: return 'MESSAGE';
        case LEAD_TYPE.PHONE_CALL: return 'PHONE_CALL';
        case LEAD_TYPE.BOOKING: return 'BOOKING';
        default: return `UNKNOWN_${type}`;
    }
}

/**
 * Fetch recent LSA leads from the Google Ads API
 *
 * @param sinceMinutes — how far back to look (default: 10 minutes, overlaps with 5-min cron for safety)
 */
export async function fetchRecentLsaLeads(sinceMinutes: number = 10): Promise<LsaLead[]> {
    if (!isLsaPollingConfigured()) {
        console.log('LSA polling not configured, skipping...');
        return [];
    }

    const client = new GoogleAdsApi({
        client_id: process.env.GOOGLE_ADS_CLIENT_ID!,
        client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
        developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
    });

    // Use the LSA-specific customer ID
    const customer = client.Customer({
        customer_id: process.env.GOOGLE_ADS_LSA_CUSTOMER_ID!,
        refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN!,
    });

    // Calculate the cutoff time in the format Google Ads API expects
    const since = new Date(Date.now() - sinceMinutes * 60 * 1000);
    const sinceStr = since.toISOString().replace('T', ' ').replace('Z', '').slice(0, 23) + '+00:00';

    // Only poll MESSAGE leads (type 2) — these are form submissions with contact info.
    // PHONE_CALL (type 3) are calls that already happened, BOOKING (type 4) are handled by Google.
    const query = `
        SELECT
            local_services_lead.resource_name,
            local_services_lead.lead_type,
            local_services_lead.category_id,
            local_services_lead.service_id,
            local_services_lead.contact_details,
            local_services_lead.lead_status,
            local_services_lead.creation_date_time,
            local_services_lead.locale,
            local_services_lead.lead_charged
        FROM local_services_lead
        WHERE local_services_lead.creation_date_time >= '${sinceStr}'
            AND local_services_lead.lead_type = 'MESSAGE'
        ORDER BY local_services_lead.creation_date_time DESC
    `;

    console.log(`Polling LSA leads since ${sinceStr}...`);

    try {
        const rows = await customer.query(query);
        console.log(`Found ${rows.length} LSA leads`);

        return rows.map((row: any) => {
            const lead = row.local_services_lead || {};
            const contact = lead.contact_details || {};

            // Extract lead ID from resource name: customers/123/localServicesLeads/456
            const parts = (lead.resource_name || '').split('/');
            const leadId = parts[parts.length - 1] || lead.resource_name;

            return {
                resourceName: lead.resource_name || '',
                leadId,
                categoryId: lead.category_id || '',
                serviceId: lead.service_id || '',
                contactPhone: contact.phone_number || null,
                contactEmail: contact.email || null,
                consumerName: contact.consumer_name || null,
                leadType: lead.lead_type || 0,
                leadTypeLabel: getLeadTypeLabel(lead.lead_type),
                leadStatus: lead.lead_status || 0,
                creationDateTime: lead.creation_date_time || '',
                locale: lead.locale || '',
                leadCharged: lead.lead_charged || false,
            };
        });
    } catch (error: any) {
        console.error('LSA lead polling error:', {
            message: error.message,
            code: error.code,
            errors: error.errors,
        });
        throw error;
    }
}
