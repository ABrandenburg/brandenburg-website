/**
 * Lead deduplication — prevent duplicate processing
 */

import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('Supabase credentials not configured');
    return createClient(url, key);
}

/**
 * Check if a webhook with this source + idempotency key has already been processed
 */
export async function isWebhookDuplicate(
    source: string,
    idempotencyKey: string
): Promise<boolean> {
    const supabase = getSupabaseAdmin();

    const { data } = await supabase
        .from('webhook_events')
        .select('id')
        .eq('source', source)
        .eq('idempotency_key', idempotencyKey)
        .eq('processing_status', 'processed')
        .limit(1)
        .maybeSingle();

    return !!data;
}

/**
 * Check if a lead from the same phone number was received in the last N hours
 * Used to prevent duplicate leads from different webhook retries
 */
export async function isRecentLeadFromPhone(
    phoneE164: string,
    windowHours: number = 24
): Promise<{ isDuplicate: boolean; existingConversationId?: string }> {
    const supabase = getSupabaseAdmin();

    const windowStart = new Date(Date.now() - windowHours * 60 * 60 * 1000).toISOString();

    const { data } = await supabase
        .from('conversations')
        .select('id, customer_id')
        .eq('customer_id',
            // Subquery: find customer by phone
            (await supabase
                .from('customers')
                .select('id')
                .eq('phone_e164', phoneE164)
                .limit(1)
                .maybeSingle()
            ).data?.id || 'no-match'
        )
        .gte('created_at', windowStart)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    return {
        isDuplicate: !!data,
        existingConversationId: data?.id,
    };
}

/**
 * Check if a phone number is on the suppression list
 */
export async function isSuppressed(phoneE164: string): Promise<boolean> {
    const supabase = getSupabaseAdmin();

    const { data } = await supabase
        .from('suppression_list')
        .select('id')
        .eq('phone_e164', phoneE164)
        .limit(1)
        .maybeSingle();

    return !!data;
}

/**
 * Find or create a customer record by phone number
 */
export async function findOrCreateCustomer(params: {
    phoneE164: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    source?: string;
}): Promise<{ id: string; isNew: boolean }> {
    const supabase = getSupabaseAdmin();

    // Try to find existing customer
    const { data: existing } = await supabase
        .from('customers')
        .select('id')
        .eq('phone_e164', params.phoneE164)
        .limit(1)
        .maybeSingle();

    if (existing) {
        // Update with any new info (don't overwrite existing data with null)
        const updates: Record<string, string> = {};
        if (params.firstName) updates.first_name = params.firstName;
        if (params.lastName) updates.last_name = params.lastName;
        if (params.email) updates.email = params.email;
        if (params.address) updates.address = params.address;
        if (params.city) updates.city = params.city;
        if (params.state) updates.state = params.state;
        if (params.zip) updates.zip = params.zip;

        if (Object.keys(updates).length > 0) {
            await supabase
                .from('customers')
                .update(updates)
                .eq('id', existing.id);
        }

        return { id: existing.id, isNew: false };
    }

    // Create new customer
    const { data: newCustomer, error } = await supabase
        .from('customers')
        .insert({
            phone_e164: params.phoneE164,
            first_name: params.firstName || null,
            last_name: params.lastName || null,
            email: params.email || null,
            address: params.address || null,
            city: params.city || null,
            state: params.state || null,
            zip: params.zip || null,
            source: params.source || null,
        })
        .select('id')
        .single();

    if (error || !newCustomer) {
        throw new Error(`Failed to create customer: ${error?.message}`);
    }

    return { id: newCustomer.id, isNew: true };
}

/**
 * Create a new conversation for a lead
 */
export async function createConversation(params: {
    customerId: string;
    source: string;
    sourceLeadId?: string;
    serviceType?: string;
    metadata?: Record<string, unknown>;
}): Promise<string> {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
        .from('conversations')
        .insert({
            customer_id: params.customerId,
            source: params.source,
            source_lead_id: params.sourceLeadId || null,
            service_type: params.serviceType || null,
            status: 'new',
            ai_enabled: true,
            metadata: params.metadata || {},
        })
        .select('id')
        .single();

    if (error || !data) {
        throw new Error(`Failed to create conversation: ${error?.message}`);
    }

    return data.id;
}
