// Review Requests Cron Job
// GET /api/cron/review-requests
// Protected by CRON_SECRET header
// Runs hourly to send review requests for recently completed jobs

import { NextRequest, NextResponse } from 'next/server';
import {
    getJobsEligibleForReviews,
    syncJobsToDatabase,
    fetchRecentlyCompletedJobs,
    getCustomerPhone
} from '@/lib/servicetitan/jobs';
import { processReviewRequests } from '@/lib/reviews/request-handler';
import { isServiceTitanConfigured } from '@/lib/servicetitan/client';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes max for cron job

export async function GET(request: NextRequest) {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
        return NextResponse.json(
            { error: 'CRON_SECRET not configured' },
            { status: 500 }
        );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    // Check if ServiceTitan is configured
    if (!isServiceTitanConfigured()) {
        return NextResponse.json({
            success: true,
            message: 'ServiceTitan not configured, skipping review requests',
            timestamp: new Date().toISOString(),
        });
    }

    try {
        const startTime = Date.now();

        console.log('=== Review Requests Cron Job Started ===');
        console.log('Timestamp:', new Date().toISOString());

        // Step 1: Fetch recently completed jobs from ServiceTitan (last hour)
        console.log('Step 1: Fetching recently completed jobs from ServiceTitan...');
        const recentJobs = await fetchRecentlyCompletedJobs();
        console.log(`Found ${recentJobs.length} recently completed jobs`);

        // Step 2: Sync jobs to database
        console.log('Step 2: Syncing jobs to database...');
        const syncedCount = await syncJobsToDatabase(recentJobs);
        console.log(`Synced ${syncedCount} jobs to database`);

        // Step 3: Get eligible jobs for review requests
        console.log('Step 3: Finding jobs eligible for review requests...');
        const eligibleJobs = await getJobsEligibleForReviews();
        console.log(`Found ${eligibleJobs.length} eligible jobs`);

        // Step 4: Extract customer phone numbers and prepare review request data
        const jobsWithPhone = eligibleJobs
            .map(job => ({
                job_id: job.job_id,
                job_number: job.job_number,
                customer_name: job.customer_name || 'Customer',
                customer_phone: getCustomerPhone(job) ?? undefined,
                technician_id: job.technician_id,
                technician_name: job.technician_name,
            }))
            .filter(job => job.customer_phone); // Only include jobs with phone numbers

        console.log(`${jobsWithPhone.length} jobs have customer phone numbers`);

        // Step 5: Process review requests
        console.log('Step 4: Processing review requests...');
        const result = await processReviewRequests(jobsWithPhone);

        const duration = Date.now() - startTime;

        console.log('=== Review Requests Cron Job Completed ===');
        console.log(`Duration: ${Math.round(duration / 1000)}s`);
        console.log(`Summary: ${result.sent} sent, ${result.failed} failed, ${result.skipped} skipped`);

        return NextResponse.json({
            success: true,
            summary: {
                jobsFetched: recentJobs.length,
                jobsSynced: syncedCount,
                jobsEligible: eligibleJobs.length,
                jobsWithPhone: jobsWithPhone.length,
                reviewsSent: result.sent,
                reviewsFailed: result.failed,
                reviewsSkipped: result.skipped,
            },
            errors: result.errors,
            duration: `${Math.round(duration / 1000)}s`,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Review request cron error:', error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Unknown error',
                success: false,
                timestamp: new Date().toISOString(),
            },
            { status: 500 }
        );
    }
}
