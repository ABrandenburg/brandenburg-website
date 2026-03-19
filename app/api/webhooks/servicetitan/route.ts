import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logWebhookEvent, markWebhookProcessed, markWebhookFailed } from '@/lib/webhooks/log';
import { verifyServiceTitanWebhook } from '@/lib/webhooks/verify';

function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('Supabase credentials not configured');
    return createClient(url, key);
}

export async function POST(request: NextRequest) {
    let eventId: string | undefined;

    try {
        const rawBody = await request.text();
        const payload = JSON.parse(rawBody);

        // 1. Log raw payload
        eventId = await logWebhookEvent({
            source: 'servicetitan',
            idempotencyKey: `${payload.eventType}-${payload.entityId || payload.jobId || ''}`,
            rawPayload: payload,
        });

        // 2. Verify HMAC signature
        const signature = request.headers.get('x-st-signature');
        if (!verifyServiceTitanWebhook(rawBody, signature)) {
            await markWebhookFailed(eventId, 'Signature verification failed');
            return NextResponse.json({ received: true }, { status: 200 });
        }

        const supabase = getSupabaseAdmin();
        const eventType = payload.eventType || payload.event_type || '';
        const jobId = String(payload.entityId || payload.jobId || payload.data?.jobId || '');

        // 3. Route event to appropriate handler
        switch (eventType) {
            case 'Job.Completed':
            case 'job.completed': {
                // Start review request drip (2h delay)
                await startReviewDrip(supabase, jobId, payload);
                break;
            }

            case 'Job.Updated':
            case 'job.updated': {
                const status = payload.data?.status || payload.status || '';
                const hasEstimate = payload.data?.hasEstimate || payload.hasEstimate;

                if (hasEstimate) {
                    // Estimate created → start estimate follow-up drip
                    await startEstimateDrip(supabase, jobId, payload);
                }

                if (status === 'Scheduled' || status === 'scheduled') {
                    // Job scheduled → cancel estimate drip
                    await cancelDripByJobId(supabase, jobId, 'job_scheduled');
                }
                break;
            }

            case 'Job.Canceled':
            case 'job.canceled': {
                // Cancel all drips for this job
                await cancelDripByJobId(supabase, jobId, 'job_canceled');
                break;
            }

            default:
                console.log(`Unhandled ServiceTitan event: ${eventType}`);
        }

        await markWebhookProcessed(eventId);
        return NextResponse.json({ received: true }, { status: 200 });
    } catch (error: any) {
        console.error('ServiceTitan webhook error:', error);
        if (eventId) await markWebhookFailed(eventId, error.message);
        return NextResponse.json({ received: true, error: 'processing_failed' }, { status: 200 });
    }
}

/**
 * Start a review request drip for a completed job
 */
async function startReviewDrip(
    supabase: ReturnType<typeof getSupabaseAdmin>,
    jobId: string,
    payload: any
) {
    // Find customer by job
    const { data: conversation } = await supabase
        .from('conversations')
        .select('customer_id, id')
        .eq('servicetitan_job_id', jobId)
        .limit(1)
        .maybeSingle();

    if (!conversation) {
        console.log(`No conversation found for ST job ${jobId} — skipping review drip`);
        return;
    }

    // Find the review_request sequence
    const { data: sequence } = await supabase
        .from('drip_sequences')
        .select('id, priority')
        .eq('slug', 'review_request')
        .eq('active', true)
        .single();

    if (!sequence) return;

    // Check for existing active enrollment with higher/equal priority
    const { data: existingEnrollment } = await supabase
        .from('drip_enrollments')
        .select('id, sequence_id')
        .eq('customer_id', conversation.customer_id)
        .eq('status', 'active')
        .limit(1)
        .maybeSingle();

    if (existingEnrollment) {
        // Check priority of existing sequence
        const { data: existingSeq } = await supabase
            .from('drip_sequences')
            .select('priority')
            .eq('id', existingEnrollment.sequence_id)
            .single();

        if (existingSeq && existingSeq.priority <= sequence.priority) {
            console.log(`Customer already in higher priority sequence — skipping review drip`);
            return;
        }

        // Cancel lower priority enrollment
        await supabase
            .from('drip_enrollments')
            .update({
                status: 'cancelled',
                cancelled_at: new Date().toISOString(),
                cancel_reason: 'superseded_by_review_request',
            })
            .eq('id', existingEnrollment.id);
    }

    // Enroll in review drip
    const techName = payload.data?.technicianName || payload.technicianName || 'your technician';
    const serviceType = payload.data?.jobType || payload.jobType || 'service';

    await supabase
        .from('drip_enrollments')
        .insert({
            customer_id: conversation.customer_id,
            sequence_id: sequence.id,
            conversation_id: conversation.id,
            status: 'active',
            merge_data: {
                technician_name: techName,
                service_type: serviceType,
                review_link: `https://search.google.com/local/writereview?placeid=${process.env.GOOGLE_PLACE_ID}`,
            },
        });

    console.log(`Review drip enrolled for customer ${conversation.customer_id}, job ${jobId}`);
}

/**
 * Start an estimate follow-up drip
 */
async function startEstimateDrip(
    supabase: ReturnType<typeof getSupabaseAdmin>,
    jobId: string,
    payload: any
) {
    const { data: conversation } = await supabase
        .from('conversations')
        .select('customer_id, id')
        .eq('servicetitan_job_id', jobId)
        .limit(1)
        .maybeSingle();

    if (!conversation) return;

    const { data: sequence } = await supabase
        .from('drip_sequences')
        .select('id')
        .eq('slug', 'estimate_followup')
        .eq('active', true)
        .single();

    if (!sequence) return;

    const serviceType = payload.data?.jobType || payload.jobType || 'service';

    await supabase
        .from('drip_enrollments')
        .insert({
            customer_id: conversation.customer_id,
            sequence_id: sequence.id,
            conversation_id: conversation.id,
            status: 'active',
            merge_data: {
                service_type: serviceType,
            },
        });

    console.log(`Estimate drip enrolled for customer ${conversation.customer_id}, job ${jobId}`);
}

/**
 * Cancel all drip enrollments associated with a ServiceTitan job
 */
async function cancelDripByJobId(
    supabase: ReturnType<typeof getSupabaseAdmin>,
    jobId: string,
    reason: string
) {
    const { data: conversation } = await supabase
        .from('conversations')
        .select('customer_id')
        .eq('servicetitan_job_id', jobId)
        .limit(1)
        .maybeSingle();

    if (!conversation) return;

    await supabase
        .from('drip_enrollments')
        .update({
            status: 'cancelled',
            cancelled_at: new Date().toISOString(),
            cancel_reason: reason,
        })
        .eq('customer_id', conversation.customer_id)
        .eq('status', 'active');

    // Also cancel pending drip messages
    const { data: enrollments } = await supabase
        .from('drip_enrollments')
        .select('id')
        .eq('customer_id', conversation.customer_id)
        .eq('cancel_reason', reason);

    if (enrollments && enrollments.length > 0) {
        const enrollmentIds = enrollments.map(e => e.id);
        await supabase
            .from('pending_drip_messages')
            .update({ status: 'cancelled' })
            .in('enrollment_id', enrollmentIds)
            .eq('status', 'pending');
    }

    console.log(`Drips cancelled for job ${jobId}: ${reason}`);
}
