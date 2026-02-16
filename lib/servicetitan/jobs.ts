// ServiceTitan Jobs API Integration
// Handles fetching, syncing, and filtering jobs for review requests

import { serviceTitanFetch } from './client';
import { createClient } from '@supabase/supabase-js';

// Create admin client for server-side operations (bypasses RLS)
function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
        throw new Error('Supabase credentials not configured');
    }
    return createClient(url, key);
}

export interface ServiceTitanJob {
    id: string;
    jobNumber: string;
    customer: {
        id: string;
        name: string;
        phoneNumbers?: Array<{
            number: string;
            type: string;
        }>;
    };
    technician?: {
        id: string;
        name: string;
    };
    jobType: string;
    businessUnit?: {
        id: string;
        name: string;
    };
    jobStatus: string;
    total: number;
    completedOn?: string;
    createdOn: string;
    bookingDate?: string;
}

/**
 * Fetch jobs from ServiceTitan Jobs API with date range
 */
export async function fetchServiceTitanJobs(
    startDate: string,
    endDate: string,
    modifiedOnOrAfter?: string
): Promise<ServiceTitanJob[]> {
    const tenantId = process.env.SERVICETITAN_TENANT_ID;

    // Build query parameters
    const params = new URLSearchParams({
        createdOnOrAfter: startDate,
        createdBefore: endDate,
    });

    if (modifiedOnOrAfter) {
        params.append('modifiedOnOrAfter', modifiedOnOrAfter);
    }

    console.log('Fetching ServiceTitan jobs:', { startDate, endDate, modifiedOnOrAfter });

    const response = await serviceTitanFetch<{ data: ServiceTitanJob[]; hasMore: boolean }>(
        `/jpm/v2/tenant/${tenantId}/jobs?${params.toString()}`
    );

    console.log(`Fetched ${response.data?.length || 0} jobs from ServiceTitan`);

    return response.data || [];
}

/**
 * Fetch recently completed jobs (last hour)
 */
export async function fetchRecentlyCompletedJobs(): Promise<ServiceTitanJob[]> {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    console.log('Fetching recently completed jobs (last hour)...');

    const jobs = await fetchServiceTitanJobs(
        oneHourAgo.toISOString(),
        now.toISOString()
    );

    // Filter for completed status
    const completedJobs = jobs.filter(job => job.jobStatus === 'Completed');

    console.log(`Found ${completedJobs.length} completed jobs out of ${jobs.length} total`);

    return completedJobs;
}

/**
 * Sync jobs to database
 */
export async function syncJobsToDatabase(jobs: ServiceTitanJob[]): Promise<number> {
    if (jobs.length === 0) {
        console.log('No jobs to sync');
        return 0;
    }

    console.log(`Syncing ${jobs.length} jobs to database...`);

    const jobRecords = jobs.map(job => ({
        job_id: job.id,
        job_number: job.jobNumber,
        customer_id: job.customer?.id,
        customer_name: job.customer?.name,
        technician_id: job.technician?.id,
        technician_name: job.technician?.name,
        job_type: job.jobType,
        business_unit: job.businessUnit?.name,
        status: job.jobStatus,
        total_amount: job.total,
        completed_date: job.completedOn,
        created_date: job.createdOn,
        booking_date: job.bookingDate,
        metadata: job,
        synced_at: new Date().toISOString(),
    }));

    const { data, error } = await getSupabaseAdmin()
        .from('raw_servicetitan_jobs')
        .upsert(jobRecords, {
            onConflict: 'job_id',
            ignoreDuplicates: false,
        });

    if (error) {
        console.error('Failed to sync jobs to database:', error);
        throw error;
    }

    console.log(`Successfully synced ${jobRecords.length} jobs`);

    return jobRecords.length;
}

/**
 * Get jobs eligible for review requests
 * - Completed in last hour
 * - Not warranty/recall/refund
 * - No existing review request
 */
export async function getJobsEligibleForReviews(): Promise<any[]> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    console.log('Finding jobs eligible for review requests...');

    // Step 1: Get completed jobs from the last hour
    const { data: jobs, error: jobsError } = await getSupabaseAdmin()
        .from('raw_servicetitan_jobs')
        .select('*')
        .eq('status', 'Completed')
        .gte('completed_date', oneHourAgo);

    if (jobsError) {
        console.error('Failed to fetch eligible jobs:', jobsError);
        throw jobsError;
    }

    if (!jobs || jobs.length === 0) {
        console.log('No completed jobs found in the last hour');
        return [];
    }

    // Step 2: Get all review requests for these job_ids
    const jobIds = jobs.map(j => j.job_id);
    const { data: existingRequests, error: requestsError } = await getSupabaseAdmin()
        .from('review_requests')
        .select('job_id')
        .in('job_id', jobIds);

    if (requestsError) {
        console.error('Failed to fetch existing review requests:', requestsError);
        throw requestsError;
    }

    // Step 3: Filter out jobs that already have review requests
    const existingJobIds = new Set((existingRequests || []).map(r => r.job_id));
    const jobsWithoutRequests = jobs.filter(job => !existingJobIds.has(job.job_id));

    console.log(`Found ${jobsWithoutRequests.length} jobs without review requests out of ${jobs.length} total completed jobs`);

    // Step 4: Filter out warranty/recall/refund jobs
    const excludedKeywords = ['warranty', 'recall', 'refund'];
    const eligibleJobs = jobsWithoutRequests.filter(job => {
        const jobType = (job.job_type || '').toLowerCase();
        const isExcluded = excludedKeywords.some(keyword => jobType.includes(keyword));

        if (isExcluded) {
            console.log(`Excluding job ${job.job_number} (type: ${job.job_type})`);
            return false;
        }

        return true;
    });

    console.log(`Found ${eligibleJobs.length} eligible jobs after filtering`);

    return eligibleJobs;
}

/**
 * Extract customer phone number from job
 */
export function getCustomerPhone(job: any): string | null {
    // Try metadata first (full ServiceTitan job object)
    if (job.metadata?.customer?.phoneNumbers && Array.isArray(job.metadata.customer.phoneNumbers)) {
        const mobilePhone = job.metadata.customer.phoneNumbers.find((p: any) => p.type === 'Mobile');
        if (mobilePhone?.number) return mobilePhone.number;

        // Fallback to first phone number
        const firstPhone = job.metadata.customer.phoneNumbers[0];
        if (firstPhone?.number) return firstPhone.number;
    }

    return null;
}
