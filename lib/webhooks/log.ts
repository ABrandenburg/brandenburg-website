/**
 * Webhook event logging — write/update webhook_events table
 * Every inbound webhook is logged BEFORE any processing
 */

import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('Supabase credentials not configured');
    return createClient(url, key);
}

export interface WebhookLogEntry {
    source: string;
    idempotencyKey?: string;
    rawPayload: Record<string, unknown>;
}

/**
 * Log a raw webhook payload. ALWAYS call this before processing.
 * Returns the webhook event ID for later status updates.
 */
export async function logWebhookEvent(entry: WebhookLogEntry): Promise<string> {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
        .from('webhook_events')
        .insert({
            source: entry.source,
            idempotency_key: entry.idempotencyKey || null,
            raw_payload: entry.rawPayload,
            processing_status: 'pending',
            attempts: 1,
        })
        .select('id')
        .single();

    if (error || !data) {
        console.error('Failed to log webhook event:', error);
        throw new Error(`Failed to log webhook: ${error?.message}`);
    }

    return data.id;
}

/**
 * Mark a webhook event as successfully processed
 */
export async function markWebhookProcessed(eventId: string): Promise<void> {
    const supabase = getSupabaseAdmin();

    await supabase
        .from('webhook_events')
        .update({
            processing_status: 'processed',
            processed_at: new Date().toISOString(),
        })
        .eq('id', eventId);
}

/**
 * Mark a webhook event as failed with error detail
 */
export async function markWebhookFailed(eventId: string, error: string): Promise<void> {
    const supabase = getSupabaseAdmin();

    await supabase
        .from('webhook_events')
        .update({
            processing_status: 'failed',
            processing_error: error,
        })
        .eq('id', eventId);
}

/**
 * Mark a webhook event as dead letter (no more retries)
 */
export async function markWebhookDeadLetter(eventId: string, error: string): Promise<void> {
    const supabase = getSupabaseAdmin();

    await supabase
        .from('webhook_events')
        .update({
            processing_status: 'dead_letter',
            processing_error: error,
        })
        .eq('id', eventId);
}
