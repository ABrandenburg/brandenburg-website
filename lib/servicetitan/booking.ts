/**
 * ServiceTitan Booking Flow
 * Search/create customer → create location → create job
 */

import { serviceTitanFetch, isServiceTitanConfigured } from './client';

const TENANT_ID = process.env.SERVICETITAN_TENANT_ID;

interface BookingParams {
    customerName: string;
    phone: string;
    address: string;
    serviceType: string;
    preferredDatetime: string;
    notes?: string;
    source: string;
    conversationId: string;
}

interface BookingResult {
    jobId: string;
    customerId: string;
    locationId: string;
}

/**
 * Map a service type string to ServiceTitan business unit + job type IDs
 */
function mapServiceType(serviceType: string): {
    businessUnitId: string;
    jobTypeId: string;
    campaignId: string;
} {
    const st = serviceType.toLowerCase();

    // HVAC service
    if (st.includes('ac') || st.includes('air condition') || st.includes('cooling') ||
        st.includes('heat') || st.includes('furnace') || st.includes('hvac') ||
        st.includes('duct')) {

        // HVAC installation
        if (st.includes('install') || st.includes('replace') || st.includes('new')) {
            return {
                businessUnitId: process.env.SERVICETITAN_BU_HVAC_INSTALL || '',
                jobTypeId: process.env.SERVICETITAN_JOBTYPE_HVAC_INSTALL || '',
                campaignId: '',
            };
        }

        // HVAC service/repair
        return {
            businessUnitId: process.env.SERVICETITAN_BU_HVAC_SERVICE || '',
            jobTypeId: process.env.SERVICETITAN_JOBTYPE_HVAC_SERVICE || '',
            campaignId: '',
        };
    }

    // Default: plumbing
    return {
        businessUnitId: process.env.SERVICETITAN_BU_PLUMBING || '',
        jobTypeId: process.env.SERVICETITAN_JOBTYPE_PLUMBING || '',
        campaignId: '',
    };
}

/**
 * Map lead source to ServiceTitan campaign ID
 */
function getCampaignId(source: string): string {
    const campaignMap: Record<string, string | undefined> = {
        angi: process.env.SERVICETITAN_CAMPAIGN_ANGI,
        thumbtack: process.env.SERVICETITAN_CAMPAIGN_THUMBTACK,
        lsa: process.env.SERVICETITAN_CAMPAIGN_LSA,
        website: process.env.SERVICETITAN_CAMPAIGN_WEBSITE,
    };
    return campaignMap[source] || '';
}

/**
 * Parse an address string into components
 */
function parseAddress(address: string): {
    street: string;
    city: string;
    state: string;
    zip: string;
} {
    // Simple parser — handles "123 Main St, Austin, TX 78701"
    const parts = address.split(',').map(p => p.trim());

    if (parts.length >= 3) {
        const stateZip = parts[parts.length - 1].trim().split(/\s+/);
        return {
            street: parts[0],
            city: parts[parts.length - 2],
            state: stateZip[0] || 'TX',
            zip: stateZip[1] || '',
        };
    }

    if (parts.length === 2) {
        const stateZip = parts[1].trim().split(/\s+/);
        return {
            street: parts[0],
            city: stateZip[0] || '',
            state: stateZip[1] || 'TX',
            zip: stateZip[2] || '',
        };
    }

    return { street: address, city: '', state: 'TX', zip: '' };
}

/**
 * Look up a customer in ServiceTitan by phone number
 */
export async function lookupServiceTitanCustomer(phone: string): Promise<{
    found: boolean;
    customerId?: string;
    name?: string;
    membershipStatus?: string;
}> {
    if (!isServiceTitanConfigured()) {
        return { found: false };
    }

    // Strip non-digit characters for ST API
    const digits = phone.replace(/\D/g, '');

    try {
        const response = await serviceTitanFetch<{
            data: Array<{
                id: number;
                name: string;
                memberships?: Array<{ status: string }>;
            }>;
        }>(`/crm/v2/tenant/{tenantId}/customers?phoneNumber=${digits}&pageSize=1`);

        if (response.data && response.data.length > 0) {
            const customer = response.data[0];
            return {
                found: true,
                customerId: String(customer.id),
                name: customer.name,
                membershipStatus: customer.memberships?.[0]?.status,
            };
        }

        return { found: false };
    } catch (error: any) {
        console.error('ServiceTitan customer lookup failed:', error.message);
        return { found: false };
    }
}

/**
 * Create a full booking in ServiceTitan
 * 1. Search for existing customer by phone
 * 2. Create customer if not found
 * 3. Create/match location
 * 4. Create job
 */
export async function createBooking(params: BookingParams): Promise<BookingResult> {
    if (!isServiceTitanConfigured()) {
        throw new Error('ServiceTitan not configured');
    }

    const { businessUnitId, jobTypeId } = mapServiceType(params.serviceType);
    const campaignId = getCampaignId(params.source);
    const addr = parseAddress(params.address);

    // Parse customer name
    const nameParts = params.customerName.trim().split(/\s+/);
    const firstName = nameParts[0] || 'Unknown';
    const lastName = nameParts.slice(1).join(' ') || '';

    // 1. Search for existing customer
    const lookup = await lookupServiceTitanCustomer(params.phone);
    let customerId: string;

    if (lookup.found && lookup.customerId) {
        customerId = lookup.customerId;
        console.log(`Found existing ST customer: ${customerId}`);
    } else {
        // 2. Create new customer
        const customerResponse = await serviceTitanFetch<{ id: number }>(`/crm/v2/tenant/{tenantId}/customers`, {
            method: 'POST',
            body: JSON.stringify({
                name: params.customerName,
                type: 'Residential',
                contacts: [
                    {
                        type: 'MobilePhone',
                        value: params.phone.replace(/\D/g, ''),
                    },
                ],
            }),
        });
        customerId = String(customerResponse.id);
        console.log(`Created new ST customer: ${customerId}`);
    }

    // 3. Create location
    const locationResponse = await serviceTitanFetch<{ id: number }>(`/crm/v2/tenant/{tenantId}/locations`, {
        method: 'POST',
        body: JSON.stringify({
            customerId: Number(customerId),
            name: params.customerName,
            address: {
                street: addr.street,
                city: addr.city,
                state: addr.state,
                zip: addr.zip,
                country: 'US',
            },
        }),
    });
    const locationId = String(locationResponse.id);
    console.log(`Created ST location: ${locationId}`);

    // 4. Create job
    const jobBody: Record<string, any> = {
        customerId: Number(customerId),
        locationId: Number(locationId),
        summary: `${params.serviceType}${params.notes ? ` — ${params.notes}` : ''}`,
        priority: 'Normal',
    };

    if (businessUnitId) jobBody.businessUnitId = Number(businessUnitId);
    if (jobTypeId) jobBody.jobTypeId = Number(jobTypeId);
    if (campaignId) jobBody.campaignId = Number(campaignId);

    // Parse preferred datetime
    if (params.preferredDatetime) {
        const date = new Date(params.preferredDatetime);
        if (!isNaN(date.getTime())) {
            jobBody.start = date.toISOString();
        }
    }

    const jobResponse = await serviceTitanFetch<{ id: number }>(`/jpm/v2/tenant/{tenantId}/jobs`, {
        method: 'POST',
        body: JSON.stringify(jobBody),
    });

    const jobId = String(jobResponse.id);
    console.log(`Created ST job: ${jobId}`);

    return { jobId, customerId, locationId };
}
