import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { markWebhookDeadLetter } from '@/lib/webhooks/log';
import { sendStaffAlert } from '@/lib/notifications/staff-alerts';

function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('Supabase credentials not configured');
    return createClient(url, key);
}

const MAX_RETRY_ATTEMPTS = 3;

/**
 * Retry failed webhook processing — runs every 5 minutes via Vercel cron
 */
export async function GET(request: NextRequest) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    let retried = 0;
    let deadLettered = 0;

    try {
        // Get failed events that haven't exceeded max attempts
        const { data: failedEvents } = await supabase
            .from('webhook_events')
            .select('id, source, attempts, raw_payload, processing_error')
            .eq('processing_status', 'failed')
            .lt('attempts', MAX_RETRY_ATTEMPTS)
            .order('created_at', { ascending: true })
            .limit(20);

        if (!failedEvents || failedEvents.length === 0) {
            return NextResponse.json({ message: 'No failed webhooks to retry' });
        }

        for (const event of failedEvents) {
            const attempts = (event.attempts || 0) + 1;

            if (attempts >= MAX_RETRY_ATTEMPTS) {
                // Move to dead letter
                await markWebhookDeadLetter(event.id, `Max retries exceeded. Last error: ${event.processing_error}`);
                deadLettered++;

                // Alert staff
                await sendStaffAlert({
                    type: 'high_failure_rate',
                    title: 'Webhook Dead Letter',
                    body: `Source: ${event.source}\nError: ${event.processing_error}\nAttempts: ${attempts}`,
                });

                continue;
            }

            // Update attempt count and reset to pending for reprocessing
            // The actual reprocessing would need to re-invoke the webhook handler
            // For now, just increment attempts and leave for manual review
            await supabase
                .from('webhook_events')
                .update({
                    attempts,
                    processing_status: 'pending',
                })
                .eq('id', event.id);

            retried++;
        }

        return NextResponse.json({
            processed: failedEvents.length,
            retried,
            deadLettered,
        });
    } catch (error: any) {
        console.error('Webhook retry error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
