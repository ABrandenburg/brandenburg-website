// Distributed rate limiting and queue system for ServiceTitan API
// Uses Supabase for locks to coordinate across serverless instances

import { createClient } from '@supabase/supabase-js';
import { delay } from './client';

const DELAY_BETWEEN_REQUESTS_MS = 12000; // 12 seconds between requests
const LOCK_TTL_MS = 120000; // 2 minute lock TTL

function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceRoleKey) {
        throw new Error('Supabase credentials not configured');
    }

    return createClient(url, serviceRoleKey, {
        auth: { persistSession: false },
    });
}

interface LockResult {
    acquired: boolean;
    lockId: string | null;
}

/**
 * Try to acquire a distributed lock
 */
export async function acquireLock(
    resourceKey: string,
    maxWaitMs: number = 60000
): Promise<LockResult> {
    const supabase = getSupabaseAdmin();
    const lockKey = `api-lock:${resourceKey}`;
    const lockId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const expiresAt = new Date(Date.now() + LOCK_TTL_MS);

    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitMs) {
        try {
            // First, clean up expired locks
            await supabase
                .from('api_locks')
                .delete()
                .lt('expires_at', new Date().toISOString());

            // Try to insert a new lock
            const { error } = await supabase
                .from('api_locks')
                .insert({
                    lock_key: lockKey,
                    lock_id: lockId,
                    expires_at: expiresAt.toISOString(),
                });

            if (!error) {
                return { acquired: true, lockId };
            }

            // Lock exists, wait and retry
            await delay(1000);
        } catch (error) {
            console.error('Lock acquisition error:', error);
            await delay(1000);
        }
    }

    return { acquired: false, lockId: null };
}

/**
 * Release a distributed lock
 */
export async function releaseLock(
    resourceKey: string,
    lockId: string
): Promise<void> {
    try {
        const supabase = getSupabaseAdmin();
        const lockKey = `api-lock:${resourceKey}`;

        await supabase
            .from('api_locks')
            .delete()
            .eq('lock_key', lockKey)
            .eq('lock_id', lockId);
    } catch (error) {
        console.error('Lock release error:', error);
    }
}

/**
 * Track API request for rate limiting
 */
export async function trackApiRequest(reportId: string): Promise<void> {
    try {
        const supabase = getSupabaseAdmin();
        const windowStart = new Date();
        windowStart.setSeconds(0, 0); // Round to minute
        const expiresAt = new Date(Date.now() + 120000); // 2 minutes

        // Upsert request tracking
        await supabase
            .from('api_request_tracking')
            .upsert({
                report_id: reportId,
                window_start: windowStart.toISOString(),
                request_count: 1,
                expires_at: expiresAt.toISOString(),
            }, {
                onConflict: 'report_id,window_start',
            });
    } catch (error) {
        console.error('Request tracking error:', error);
    }
}

/**
 * Get request count for a report in the current window
 */
export async function getRequestCount(reportId: string): Promise<number> {
    try {
        const supabase = getSupabaseAdmin();
        const windowStart = new Date();
        windowStart.setSeconds(0, 0);

        const { data, error } = await supabase
            .from('api_request_tracking')
            .select('request_count')
            .eq('report_id', reportId)
            .eq('window_start', windowStart.toISOString())
            .single();

        if (error || !data) return 0;
        return data.request_count;
    } catch (error) {
        return 0;
    }
}

interface ExecuteWithLockOptions {
    skipDelay?: boolean;
    maxWaitMs?: number;
}

/**
 * Execute a function with distributed locking and rate limiting
 */
export async function executeWithLock<T>(
    resourceKey: string,
    reportId: string,
    fn: () => Promise<T>,
    options: ExecuteWithLockOptions = {}
): Promise<T> {
    const { skipDelay = false, maxWaitMs = 60000 } = options;

    const lock = await acquireLock(resourceKey, maxWaitMs);

    if (!lock.acquired || !lock.lockId) {
        throw new Error(`Failed to acquire lock for ${resourceKey}`);
    }

    try {
        // Track the request
        await trackApiRequest(reportId);

        // Execute the function
        const result = await fn();

        // Add delay after request (unless skipped)
        if (!skipDelay) {
            await delay(DELAY_BETWEEN_REQUESTS_MS);
        }

        return result;
    } finally {
        await releaseLock(resourceKey, lock.lockId);
    }
}

/**
 * Execute multiple requests sequentially with rate limiting
 */
export async function executeSequentially<T>(
    requests: Array<{
        resourceKey: string;
        reportId: string;
        fn: () => Promise<T>;
    }>
): Promise<T[]> {
    const results: T[] = [];

    for (let i = 0; i < requests.length; i++) {
        const { resourceKey, reportId, fn } = requests[i];

        // Add delay between requests (except first)
        if (i > 0) {
            await delay(DELAY_BETWEEN_REQUESTS_MS);
        }

        const result = await executeWithLock(resourceKey, reportId, fn, {
            skipDelay: true, // We handle delay ourselves
        });

        results.push(result);
    }

    return results;
}
