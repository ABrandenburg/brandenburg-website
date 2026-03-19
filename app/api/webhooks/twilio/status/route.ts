import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logWebhookEvent, markWebhookProcessed } from '@/lib/webhooks/log';

function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('Supabase credentials not configured');
    return createClient(url, key);
}

/**
 * Twilio delivery status callback
 * Updates message delivery status in the messages table
 */
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const payload: Record<string, string> = {};
        formData.forEach((value, key) => {
            payload[key] = String(value);
        });

        // Log the status callback
        await logWebhookEvent({
            source: 'twilio_status',
            idempotencyKey: `${payload.MessageSid}-${payload.MessageStatus}`,
            rawPayload: payload,
        });

        const messageSid = payload.MessageSid || payload.SmsSid;
        const messageStatus = payload.MessageStatus; // queued, sent, delivered, undelivered, failed

        if (!messageSid || !messageStatus) {
            return NextResponse.json({ received: true }, { status: 200 });
        }

        const supabase = getSupabaseAdmin();

        // Map Twilio status to our status
        const statusMap: Record<string, string> = {
            queued: 'queued',
            sent: 'sent',
            delivered: 'delivered',
            undelivered: 'failed',
            failed: 'failed',
        };

        const deliveryStatus = statusMap[messageStatus] || messageStatus;

        // Update message record
        const { error } = await supabase
            .from('messages')
            .update({
                delivery_status: deliveryStatus,
                metadata: {
                    twilio_status: messageStatus,
                    error_code: payload.ErrorCode || null,
                    error_message: payload.ErrorMessage || null,
                    updated_at: new Date().toISOString(),
                },
            })
            .eq('twilio_sid', messageSid);

        if (error) {
            console.warn(`Failed to update message status for SID ${messageSid}:`, error.message);
        }

        return NextResponse.json({ received: true }, { status: 200 });
    } catch (error: any) {
        console.error('Twilio status callback error:', error);
        return NextResponse.json({ received: true }, { status: 200 });
    }
}
