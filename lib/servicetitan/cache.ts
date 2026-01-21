// Supabase-based caching layer for ServiceTitan data

import { createClient } from '@supabase/supabase-js';
import { CACHE_TTL, ValidPeriod } from './types';

// Create Supabase client with service role for server-side operations
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

type CacheTable =
    | 'technician_period_cache'
    | 'rankings_cache'
    | 'leads_cache'
    | 'gross_margin_cache'
    | 'cancelled_jobs_cache';

/**
 * Get cached data from Supabase
 */
export async function getCached<T>(
    table: CacheTable,
    cacheKey: string
): Promise<T | null> {
    try {
        const supabase = getSupabaseAdmin();

        const { data, error } = await supabase
            .from(table)
            .select('data')
            .eq('cache_key', cacheKey)
            .gt('expires_at', new Date().toISOString())
            .single();

        if (error || !data) {
            return null;
        }

        return data.data as T;
    } catch (error) {
        console.error(`Cache read error for ${cacheKey}:`, error);
        return null;
    }
}

/**
 * Set cached data in Supabase
 */
export async function setCached<T>(
    table: CacheTable,
    cacheKey: string,
    data: T,
    ttlSeconds: number,
    metadata: Record<string, any> = {}
): Promise<void> {
    try {
        const supabase = getSupabaseAdmin();
        const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

        await supabase
            .from(table)
            .upsert({
                cache_key: cacheKey,
                data: data,
                expires_at: expiresAt.toISOString(),
                ...metadata,
            }, {
                onConflict: 'cache_key',
            });
    } catch (error) {
        console.error(`Cache write error for ${cacheKey}:`, error);
    }
}

/**
 * Delete cached data
 */
export async function deleteCached(
    table: CacheTable,
    cacheKey: string
): Promise<void> {
    try {
        const supabase = getSupabaseAdmin();

        await supabase
            .from(table)
            .delete()
            .eq('cache_key', cacheKey);
    } catch (error) {
        console.error(`Cache delete error for ${cacheKey}:`, error);
    }
}

/**
 * Clear all expired cache entries
 */
export async function clearExpiredCache(): Promise<void> {
    try {
        const supabase = getSupabaseAdmin();
        const now = new Date().toISOString();

        const tables: CacheTable[] = [
            'technician_period_cache',
            'rankings_cache',
            'leads_cache',
            'gross_margin_cache',
            'cancelled_jobs_cache',
        ];

        await Promise.all(
            tables.map(table =>
                supabase.from(table).delete().lt('expires_at', now)
            )
        );
    } catch (error) {
        console.error('Error clearing expired cache:', error);
    }
}

// Specialized cache functions for each data type

/**
 * Get cached technician period data
 */
export async function getCachedTechnicianPeriod(
    days: ValidPeriod,
    isPrevious: boolean = false
): Promise<any | null> {
    const cacheKey = `${isPrevious ? 'previous' : 'current'}-period:v2:${days}`;
    return getCached('technician_period_cache', cacheKey);
}

/**
 * Set cached technician period data
 */
export async function setCachedTechnicianPeriod(
    days: ValidPeriod,
    data: any,
    isPrevious: boolean = false
): Promise<void> {
    const cacheKey = `${isPrevious ? 'previous' : 'current'}-period:v2:${days}`;
    const ttl = isPrevious ? CACHE_TTL.PREVIOUS_PERIOD : CACHE_TTL.CURRENT_PERIOD;

    await setCached('technician_period_cache', cacheKey, data, ttl, {
        days,
        is_previous: isPrevious,
    });
}

/**
 * Get cached rankings
 */
export async function getCachedRankings(days: ValidPeriod): Promise<any | null> {
    const cacheKey = `rankings:v2:${days}`;
    return getCached('rankings_cache', cacheKey);
}

/**
 * Set cached rankings
 */
export async function setCachedRankings(days: ValidPeriod, data: any): Promise<void> {
    const cacheKey = `rankings:v2:${days}`;
    await setCached('rankings_cache', cacheKey, data, CACHE_TTL.RANKINGS, { days });
}

/**
 * Get cached leads data
 */
export async function getCachedLeads(
    days: ValidPeriod,
    isPrevious: boolean = false
): Promise<any | null> {
    const cacheKey = `leads:${days}-${isPrevious ? 'previous' : 'current'}`;
    return getCached('leads_cache', cacheKey);
}

/**
 * Set cached leads data
 */
export async function setCachedLeads(
    days: ValidPeriod,
    data: any,
    isPrevious: boolean = false
): Promise<void> {
    const cacheKey = `leads:${days}-${isPrevious ? 'previous' : 'current'}`;
    const ttl = isPrevious ? CACHE_TTL.PREVIOUS_PERIOD : CACHE_TTL.CURRENT_PERIOD;

    await setCached('leads_cache', cacheKey, data, ttl, {
        days,
        is_previous: isPrevious,
    });
}

/**
 * Get cached gross margin data
 */
export async function getCachedGrossMargin(days: ValidPeriod): Promise<any | null> {
    const cacheKey = `gross-margin:${days}`;
    return getCached('gross_margin_cache', cacheKey);
}

/**
 * Set cached gross margin data
 */
export async function setCachedGrossMargin(days: ValidPeriod, data: any): Promise<void> {
    const cacheKey = `gross-margin:${days}`;
    await setCached('gross_margin_cache', cacheKey, data, CACHE_TTL.CURRENT_PERIOD, { days });
}

/**
 * Get cached cancelled jobs
 */
export async function getCachedCancelledJobs(
    days: ValidPeriod,
    offsetDays: number = 0
): Promise<any | null> {
    const cacheKey = `cancelled-jobs:${days}-offset${offsetDays}`;
    return getCached('cancelled_jobs_cache', cacheKey);
}

/**
 * Set cached cancelled jobs
 */
export async function setCachedCancelledJobs(
    days: ValidPeriod,
    data: any,
    offsetDays: number = 0
): Promise<void> {
    const cacheKey = `cancelled-jobs:${days}-offset${offsetDays}`;
    await setCached('cancelled_jobs_cache', cacheKey, data, CACHE_TTL.CURRENT_PERIOD, {
        days,
        offset_days: offsetDays,
    });
}
