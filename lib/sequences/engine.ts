/**
 * Drip sequence engine — enrollment, cancellation, and step advancement
 */

import { createClient } from '@supabase/supabase-js';
import { renderTemplate } from '@/lib/messaging/templates';

function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('Supabase credentials not configured');
    return createClient(url, key);
}

/**
 * Enroll a customer in a drip sequence
 * Handles priority logic — cancels lower priority enrollments
 */
export async function enrollInSequence(params: {
    customerId: string;
    sequenceSlug: string;
    conversationId?: string;
    mergeData?: Record<string, string>;
}): Promise<{ enrolled: boolean; enrollmentId?: string; reason?: string }> {
    const supabase = getSupabaseAdmin();

    // Get the sequence
    const { data: sequence } = await supabase
        .from('drip_sequences')
        .select('id, priority, slug')
        .eq('slug', params.sequenceSlug)
        .eq('active', true)
        .single();

    if (!sequence) {
        return { enrolled: false, reason: 'Sequence not found or inactive' };
    }

    // Check existing active enrollment
    const { data: existingEnrollment } = await supabase
        .from('drip_enrollments')
        .select('id, sequence_id')
        .eq('customer_id', params.customerId)
        .eq('status', 'active')
        .limit(1)
        .maybeSingle();

    if (existingEnrollment) {
        const { data: existingSeq } = await supabase
            .from('drip_sequences')
            .select('priority, slug')
            .eq('id', existingEnrollment.sequence_id)
            .single();

        if (existingSeq && existingSeq.priority <= sequence.priority) {
            return {
                enrolled: false,
                reason: `Already in higher priority sequence: ${existingSeq.slug}`,
            };
        }

        // Cancel existing lower-priority enrollment
        await cancelEnrollment(existingEnrollment.id, 'superseded');
    }

    // Get the customer's first name for merge data
    const { data: customer } = await supabase
        .from('customers')
        .select('first_name')
        .eq('id', params.customerId)
        .single();

    const mergeData = {
        first_name: customer?.first_name || 'there',
        ...params.mergeData,
    };

    // Create enrollment
    const { data: enrollment, error } = await supabase
        .from('drip_enrollments')
        .insert({
            customer_id: params.customerId,
            sequence_id: sequence.id,
            conversation_id: params.conversationId || null,
            status: 'active',
            current_step: 0,
            merge_data: mergeData,
        })
        .select('id')
        .single();

    if (error || !enrollment) {
        return { enrolled: false, reason: `Failed to create enrollment: ${error?.message}` };
    }

    // Schedule the first step
    await scheduleNextStep(enrollment.id, sequence.id, 0, mergeData);

    return { enrolled: true, enrollmentId: enrollment.id };
}

/**
 * Cancel an enrollment and its pending messages
 */
export async function cancelEnrollment(
    enrollmentId: string,
    reason: string
): Promise<void> {
    const supabase = getSupabaseAdmin();

    await supabase
        .from('drip_enrollments')
        .update({
            status: 'cancelled',
            cancelled_at: new Date().toISOString(),
            cancel_reason: reason,
        })
        .eq('id', enrollmentId);

    await supabase
        .from('pending_drip_messages')
        .update({ status: 'cancelled' })
        .eq('enrollment_id', enrollmentId)
        .eq('status', 'pending');
}

/**
 * Schedule the next step in a drip sequence
 */
async function scheduleNextStep(
    enrollmentId: string,
    sequenceId: string,
    currentStep: number,
    mergeData: Record<string, string>
): Promise<void> {
    const supabase = getSupabaseAdmin();

    const nextStepNumber = currentStep + 1;

    // Get the next step
    const { data: step } = await supabase
        .from('drip_steps')
        .select('id, delay_minutes, message_template')
        .eq('sequence_id', sequenceId)
        .eq('step_number', nextStepNumber)
        .single();

    if (!step) {
        // No more steps — mark enrollment as completed
        await supabase
            .from('drip_enrollments')
            .update({
                status: 'completed',
                completed_at: new Date().toISOString(),
            })
            .eq('id', enrollmentId);
        return;
    }

    // Get enrollment's customer
    const { data: enrollment } = await supabase
        .from('drip_enrollments')
        .select('customer_id')
        .eq('id', enrollmentId)
        .single();

    if (!enrollment) return;

    // Render the template
    const renderedBody = renderTemplate(step.message_template, mergeData);

    // Calculate send time
    const sendAt = new Date(Date.now() + step.delay_minutes * 60 * 1000);

    // Create pending drip message
    await supabase
        .from('pending_drip_messages')
        .insert({
            enrollment_id: enrollmentId,
            customer_id: enrollment.customer_id,
            step_id: step.id,
            message_body: renderedBody,
            send_at: sendAt.toISOString(),
            status: 'pending',
        });
}

/**
 * Advance an enrollment to the next step after a message is sent
 */
export async function advanceEnrollment(enrollmentId: string): Promise<void> {
    const supabase = getSupabaseAdmin();

    const { data: enrollment } = await supabase
        .from('drip_enrollments')
        .select('id, sequence_id, current_step, merge_data')
        .eq('id', enrollmentId)
        .single();

    if (!enrollment) return;

    const nextStep = (enrollment.current_step || 0) + 1;

    await supabase
        .from('drip_enrollments')
        .update({ current_step: nextStep })
        .eq('id', enrollmentId);

    // Schedule the next step
    await scheduleNextStep(
        enrollmentId,
        enrollment.sequence_id,
        nextStep,
        (enrollment.merge_data as Record<string, string>) || {}
    );
}
