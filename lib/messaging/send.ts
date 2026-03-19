/**
 * Single choke-point for all outbound SMS
 * Enforces: suppression check, business hours, rate limiting, Twilio send, message logging
 */

import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('Supabase credentials not configured');
    return createClient(url, key);
}

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
const TIMEZONE = process.env.TIMEZONE || 'America/Chicago';

export interface SendMessageParams {
    to: string; // E.164 phone number
    body: string;
    conversationId: string;
    customerId: string;
    sender: 'ai_chris' | 'staff' | 'drip_system' | 'system';
    channel?: string;
    /** If true, bypasses business hours and rate limit checks (for speed-to-lead + active AI convos) */
    isUrgent?: boolean;
    metadata?: Record<string, unknown>;
}

export interface SendResult {
    success: boolean;
    messageId?: string; // DB message ID
    twilioSid?: string;
    error?: string;
    blocked?: 'suppressed' | 'outside_hours' | 'rate_limited' | 'twilio_not_configured';
}

/**
 * Check if current time is within business hours (8am-7pm CT)
 */
function isWithinBusinessHours(): boolean {
    const now = new Date();
    const ct = new Date(now.toLocaleString('en-US', { timeZone: TIMEZONE }));
    const hour = ct.getHours();
    return hour >= 8 && hour < 19;
}

/**
 * Check if a customer has received a message in the last N hours
 */
async function wasMessagedRecently(
    customerId: string,
    hoursAgo: number = 4
): Promise<boolean> {
    const supabase = getSupabaseAdmin();
    const cutoff = new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString();

    const { data } = await supabase
        .from('messages')
        .select('id')
        .eq('customer_id', customerId)
        .eq('direction', 'outbound')
        .eq('sender', 'drip_system')
        .gte('created_at', cutoff)
        .limit(1)
        .maybeSingle();

    return !!data;
}

/**
 * Check suppression list
 */
async function isPhoneSuppressed(phoneE164: string): Promise<boolean> {
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
 * Send an outbound SMS message — the single entry point for all outbound messaging
 */
export async function sendMessage(params: SendMessageParams): Promise<SendResult> {
    const supabase = getSupabaseAdmin();

    // 1. Check suppression list (ALWAYS — no bypass)
    if (await isPhoneSuppressed(params.to)) {
        console.log(`Message blocked: ${params.to} is on suppression list`);
        return { success: false, blocked: 'suppressed' };
    }

    // 2. Check business hours (bypass for urgent/speed-to-lead)
    if (!params.isUrgent && params.sender === 'drip_system' && !isWithinBusinessHours()) {
        console.log(`Message blocked: outside business hours for drip to ${params.to}`);
        return { success: false, blocked: 'outside_hours' };
    }

    // 3. Check rate limit (1 drip per 4 hours, bypass for urgent/AI/staff)
    if (!params.isUrgent && params.sender === 'drip_system') {
        if (await wasMessagedRecently(params.customerId)) {
            console.log(`Message blocked: rate limited for ${params.to}`);
            return { success: false, blocked: 'rate_limited' };
        }
    }

    // 4. Check Twilio config
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
        console.warn('Twilio not configured — logging message without sending');

        // Still log the message in DB (for dev/testing)
        const { data: msg } = await supabase
            .from('messages')
            .insert({
                conversation_id: params.conversationId,
                customer_id: params.customerId,
                direction: 'outbound',
                sender: params.sender,
                channel: params.channel || 'sms',
                body: params.body,
                delivery_status: 'failed',
                metadata: { ...params.metadata, error: 'Twilio not configured' },
            })
            .select('id')
            .single();

        return {
            success: false,
            messageId: msg?.id,
            blocked: 'twilio_not_configured',
        };
    }

    // 5. Send via Twilio
    try {
        const twilio = (await import('twilio')).default;
        const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

        const twilioResult = await client.messages.create({
            body: params.body,
            from: TWILIO_PHONE_NUMBER,
            to: params.to,
            statusCallback: `${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/webhooks/twilio/status`,
        });

        // 6. Log message in DB
        const { data: msg } = await supabase
            .from('messages')
            .insert({
                conversation_id: params.conversationId,
                customer_id: params.customerId,
                direction: 'outbound',
                sender: params.sender,
                channel: params.channel || 'sms',
                body: params.body,
                twilio_sid: twilioResult.sid,
                delivery_status: 'sent',
                metadata: params.metadata || {},
            })
            .select('id')
            .single();

        console.log(`SMS sent to ${params.to} — SID: ${twilioResult.sid}`);

        return {
            success: true,
            messageId: msg?.id,
            twilioSid: twilioResult.sid,
        };
    } catch (error: any) {
        console.error(`Twilio send failed for ${params.to}:`, error.message);

        // Log the failed message
        const { data: msg } = await supabase
            .from('messages')
            .insert({
                conversation_id: params.conversationId,
                customer_id: params.customerId,
                direction: 'outbound',
                sender: params.sender,
                channel: params.channel || 'sms',
                body: params.body,
                delivery_status: 'failed',
                metadata: { ...params.metadata, error: error.message },
            })
            .select('id')
            .single();

        return {
            success: false,
            messageId: msg?.id,
            error: error.message,
        };
    }
}
