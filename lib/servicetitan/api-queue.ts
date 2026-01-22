// Distributed rate limiting and queue system for ServiceTitan API
// Uses Supabase for locks to coordinate across serverless instances

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { delay } from './client';

const DELAY_BETWEEN_REQUESTS_MS = 12000; // 12 seconds between requests
const LOCK_TTL_MS = 120000; // 2 minute lock TTL
const SUPABASE_TIMEOUT_MS = 5000; // 5 second timeout for Supabase ops

// Supabase client singleton
let supabaseAdmin: SupabaseClient | null = null;
let supabaseAvailable: boolean | null = null;

function getSupabaseAdmin(): SupabaseClient | null {
    if (supabaseAdmin) return supabaseAdmin;
    
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceRoleKey) {
        console.warn('Supabase not configured - distributed locking disabled');
        supabaseAvailable = false;
        return null;
    }

    supabaseAdmin = createClient(url, serviceRoleKey, {
        auth: { persistSession: false },
    });
    return supabaseAdmin;
}

/**
 * Utility to race a promise against a timeout
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
        promise,
        new Promise<T>((_, reject) =>
            setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
        ),
    ]);
}

interface LockResult {
    acquired: boolean;
    lockId: string | null;
}

/**
 * Try to acquire a distributed lock
 * Returns immediately if Supabase is unavailable (no distributed locking)
 */
export async function acquireLock(
    resourceKey: string,
    maxWaitMs: number = 60000
): Promise<LockResult> {
    const supabase = getSupabaseAdmin();
    
    // If Supabase is not available, skip distributed locking
    if (!supabase || supabaseAvailable === false) {
        const localLockId = `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        return { acquired: true, lockId: localLockId };
    }
    
    const lockKey = `api-lock:${resourceKey}`;
    const lockId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const expiresAt = new Date(Date.now() + LOCK_TTL_MS);

    const startTime = Date.now();
    let attempts = 0;
    const maxAttempts = 3; // Limit retries to avoid infinite loops

    while (Date.now() - startTime < maxWaitMs && attempts < maxAttempts) {
        attempts++;
        try {
            // First, clean up expired locks (with timeout)
            await withTimeout(
                supabase
                    .from('api_locks')
                    .delete()
                    .lt('expires_at', new Date().toISOString())
                    .then(),
                SUPABASE_TIMEOUT_MS
            );

            // Try to insert a new lock (with timeout)
            const { error } = await withTimeout(
                supabase
                    .from('api_locks')
                    .insert({
                        lock_key: lockKey,
                        lock_id: lockId,
                        expires_at: expiresAt.toISOString(),
                    })
                    .then(),
                SUPABASE_TIMEOUT_MS
            );

            if (!error) {
                supabaseAvailable = true;
                return { acquired: true, lockId };
            }

            // Lock exists or other error, wait and retry
            await delay(1000);
        } catch (error) {
            // If Supabase times out or errors, mark as unavailable and use local locking
            console.warn('Distributed locking unavailable, using local mode:', error);
            supabaseAvailable = false;
            return { acquired: true, lockId: `local-${lockId}` };
        }
    }

    // If we couldn't get the lock, fall back to local mode
    return { acquired: true, lockId: `local-fallback-${lockId}` };
}

/**
 * Release a distributed lock
 */
export async function releaseLock(
    resourceKey: string,
    lockId: string
): Promise<void> {
    // Skip if using local locking
    if (lockId.startsWith('local-')) {
        return;
    }
    
    try {
        const supabase = getSupabaseAdmin();
        if (!supabase || supabaseAvailable === false) return;
        
        const lockKey = `api-lock:${resourceKey}`;

        await withTimeout(
            supabase
                .from('api_locks')
                .delete()
                .eq('lock_key', lockKey)
                .eq('lock_id', lockId)
                .then(),
            SUPABASE_TIMEOUT_MS
        );
    } catch (error) {
        // Silently ignore release errors - lock will expire
    }
}

/**
 * Track API request for rate limiting
 */
export async function trackApiRequest(reportId: string): Promise<void> {
    try {
        const supabase = getSupabaseAdmin();
        if (!supabase || supabaseAvailable === false) return;
        
        const windowStart = new Date();
        windowStart.setSeconds(0, 0); // Round to minute
        const expiresAt = new Date(Date.now() + 120000); // 2 minutes

        // Upsert request tracking (with timeout)
        await withTimeout(
            supabase
                .from('api_request_tracking')
                .upsert({
                    report_id: reportId,
                    window_start: windowStart.toISOString(),
                    request_count: 1,
                    expires_at: expiresAt.toISOString(),
                }, {
                    onConflict: 'report_id,window_start',
                })
                .then(),
            SUPABASE_TIMEOUT_MS
        );
    } catch (error) {
        // Silently ignore tracking errors
    }
}

/**
 * Get request count for a report in the current window
 */
export async function getRequestCount(reportId: string): Promise<number> {
    try {
        const supabase = getSupabaseAdmin();
        if (!supabase || supabaseAvailable === false) return 0;
        
        const windowStart = new Date();
        windowStart.setSeconds(0, 0);

        const { data, error } = await withTimeout(
            supabase
                .from('api_request_tracking')
                .select('request_count')
                .eq('report_id', reportId)
                .eq('window_start', windowStart.toISOString())
                .single()
                .then(),
            SUPABASE_TIMEOUT_MS
        );

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
