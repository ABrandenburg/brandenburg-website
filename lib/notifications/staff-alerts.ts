/**
 * Staff notification system — dashboard + SMS alerts
 */

import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('Supabase credentials not configured');
    return createClient(url, key);
}

export interface StaffAlertParams {
    type: 'ai_booking' | 'ai_handoff' | 'speed_to_lead_failure' | 'high_failure_rate' | 'daily_digest';
    title: string;
    body: string;
    conversationId?: string;
    customerId?: string;
    metadata?: Record<string, unknown>;
}

/**
 * Send a staff alert — creates DB notification + sends SMS to admin phone
 */
export async function sendStaffAlert(params: StaffAlertParams): Promise<void> {
    const supabase = getSupabaseAdmin();

    // 1. Create notification record
    await supabase
        .from('staff_notifications')
        .insert({
            type: params.type,
            title: params.title,
            body: params.body,
            conversation_id: params.conversationId || null,
            customer_id: params.customerId || null,
            metadata: params.metadata || {},
            sms_sent: false,
        });

    // 2. Send SMS to admin phone (fire-and-forget)
    const adminPhone = process.env.AI_ADMIN_PHONE || process.env.ADMIN_PHONE;
    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioFrom = process.env.TWILIO_PHONE_NUMBER;

    if (!adminPhone || !twilioSid || !twilioToken || !twilioFrom) {
        console.log(`Staff alert (no SMS): ${params.title} — ${params.body}`);
        return;
    }

    try {
        const twilio = (await import('twilio')).default;
        const client = twilio(twilioSid, twilioToken);

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://brandenburgplumbing.com';
        const viewLink = params.conversationId
            ? `\nView: ${baseUrl}/admin/inbox?c=${params.conversationId}`
            : '';

        await client.messages.create({
            body: `${params.title}\n${params.body}${viewLink}`,
            from: twilioFrom,
            to: adminPhone,
        });

        // Update notification record
        await supabase
            .from('staff_notifications')
            .update({ sms_sent: true })
            .eq('type', params.type)
            .eq('conversation_id', params.conversationId)
            .order('created_at', { ascending: false })
            .limit(1);

        console.log(`Staff SMS alert sent: ${params.title}`);
    } catch (error: any) {
        console.error('Staff SMS alert failed:', error.message);
    }
}

/**
 * Get unread notification count for the dashboard header badge
 */
export async function getUnreadNotificationCount(): Promise<number> {
    const supabase = getSupabaseAdmin();

    const { count } = await supabase
        .from('staff_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('read', false);

    return count || 0;
}
