// Review Request Handler
// Handles generating review URLs and sending SMS via Twilio

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
        throw new Error('Supabase credentials not configured');
    }
    return createClient(url, key);
}

// Environment configuration
const GOOGLE_PLACE_ID = process.env.GOOGLE_PLACE_ID;
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://brandenburgplumbing.com';

export interface ReviewRequestJob {
    job_id: string;
    job_number: string;
    customer_name: string;
    customer_phone?: string;
    technician_id: string;
    technician_name: string;
}

/**
 * Generate unique review tracking URL
 * Creates a Google Places review deep link with tracking parameters
 */
export function generateReviewUrl(jobId: string, platform: string = 'google'): string {
    const trackingId = crypto.randomBytes(8).toString('hex');

    if (platform === 'google' && GOOGLE_PLACE_ID) {
        // Google review deep link
        const baseUrl = `https://search.google.com/local/writereview?placeid=${GOOGLE_PLACE_ID}`;
        return `${baseUrl}&utm_source=review_request&utm_medium=sms&utm_campaign=reviews&track_id=${trackingId}`;
    }

    // Fallback to custom review page
    return `${BASE_URL}/reviews/submit?job=${jobId}&track=${trackingId}`;
}

/**
 * Send SMS via Twilio
 */
async function sendReviewRequestSMS(
    phone: string,
    customerName: string,
    technicianName: string,
    reviewUrl: string
): Promise<{ success: boolean; sid?: string; error?: string }> {
    const message = `Hi ${customerName}! Thank you for choosing Brandenburg Plumbing. ${technicianName} hopes you're satisfied with your service. Would you share your experience? ${reviewUrl}`;

    console.log(`Sending review request SMS to ${phone}`);
    console.log(`Message: ${message}`);

    // Check if Twilio is configured
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
        console.warn('Twilio not configured. Skipping SMS send.');
        return {
            success: false,
            error: 'Twilio not configured',
        };
    }

    try {
        // Import Twilio SDK dynamically
        const twilio = (await import('twilio')).default;
        const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

        const result = await client.messages.create({
            body: message,
            from: TWILIO_PHONE_NUMBER,
            to: phone,
        });

        console.log(`SMS sent successfully. SID: ${result.sid}`);

        return { success: true, sid: result.sid };
    } catch (error: any) {
        console.error('Twilio SMS failed:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Process review requests for eligible jobs
 */
export async function processReviewRequests(jobs: ReviewRequestJob[]): Promise<{
    sent: number;
    failed: number;
    skipped: number;
    errors: string[];
}> {
    let sent = 0;
    let failed = 0;
    let skipped = 0;
    const errors: string[] = [];

    console.log(`Processing ${jobs.length} review requests...`);

    for (const job of jobs) {
        try {
            // Skip if no customer phone
            if (!job.customer_phone) {
                console.log(`Skipping job ${job.job_number}: No customer phone`);
                skipped++;
                continue;
            }

            // Skip if no technician
            if (!job.technician_id || !job.technician_name) {
                console.log(`Skipping job ${job.job_number}: No technician assigned`);
                skipped++;
                continue;
            }

            // Ensure technician exists in database
            const { data: techData, error: techError } = await getSupabaseAdmin()
                .from('technicians')
                .upsert({
                    servicetitan_id: job.technician_id,
                    name: job.technician_name,
                    active: true,
                    updated_at: new Date().toISOString(),
                }, {
                    onConflict: 'servicetitan_id',
                    ignoreDuplicates: false,
                })
                .select('id')
                .single();

            if (techError || !techData) {
                throw new Error(`Failed to create/update technician: ${techError?.message || 'No data returned'}`);
            }

            // Generate review URL
            const reviewUrl = generateReviewUrl(job.job_id);
            console.log(`Generated review URL for job ${job.job_number}: ${reviewUrl}`);

            // Send SMS
            const smsResult = await sendReviewRequestSMS(
                job.customer_phone,
                job.customer_name,
                job.technician_name,
                reviewUrl
            );

            // Insert review request record
            const { error: requestError } = await getSupabaseAdmin()
                .from('review_requests')
                .insert({
                    job_id: job.job_id,
                    job_number: job.job_number,
                    customer_name: job.customer_name,
                    customer_phone: job.customer_phone,
                    technician_id: techData.id,
                    technician_name: job.technician_name,
                    review_url: reviewUrl,
                    status: smsResult.success ? 'sent' : 'failed',
                    sms_payload: {
                        sid: smsResult.sid,
                        to: job.customer_phone,
                        sent_at: new Date().toISOString(),
                    },
                    sent_at: smsResult.success ? new Date().toISOString() : null,
                    failed_reason: smsResult.error,
                });

            if (requestError) {
                throw new Error(`Failed to insert review request: ${requestError.message}`);
            }

            if (smsResult.success) {
                sent++;
                console.log(`✓ Review request sent for job ${job.job_number}`);
            } else {
                failed++;
                errors.push(`Job ${job.job_number}: ${smsResult.error}`);
                console.error(`✗ Review request failed for job ${job.job_number}: ${smsResult.error}`);
            }
        } catch (error: any) {
            failed++;
            errors.push(`Job ${job.job_number}: ${error.message}`);
            console.error(`Failed to process review request for job ${job.job_number}:`, error);
        }
    }

    console.log(`Review requests processed: ${sent} sent, ${failed} failed, ${skipped} skipped`);

    return { sent, failed, skipped, errors };
}
