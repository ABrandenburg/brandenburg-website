// Supabase-based caching layer for ServiceTitan data

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CACHE_TTL, ValidPeriod, getCacheTTL } from './types';

// Cache timeout in milliseconds
const CACHE_TIMEOUT_MS = 5000;

// Supabase client singleton
let supabaseAdmin: SupabaseClient | null = null;

// Create Supabase client with service role for server-side operations
function getSupabaseAdmin(): SupabaseClient | null {
    if (supabaseAdmin) return supabaseAdmin;
    
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceRoleKey) {
        console.warn('Supabase credentials not configured - caching disabled');
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
function withTimeout<T>(promise: PromiseLike<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
        Promise.resolve(promise),
        new Promise<T>((_, reject) =>
            setTimeout(() => reject(new Error('Cache operation timed out')), timeoutMs)
        ),
    ]);
}

type CacheTable =
    | 'technician_period_cache'
    | 'rankings_cache'
    | 'leads_cache';

/**
 * Get cached data from Supabase
 */
export async function getCached<T>(
    table: CacheTable,
    cacheKey: string
): Promise<T | null> {
    try {
        const supabase = getSupabaseAdmin();
        if (!supabase) return null;

        const { data, error } = await withTimeout(
            supabase
                .from(table)
                .select('data')
                .eq('cache_key', cacheKey)
                .gt('expires_at', new Date().toISOString())
                .single()
                .then(),
            CACHE_TIMEOUT_MS
        );

        if (error || !data) {
            return null;
        }

        return data.data as T;
    } catch (error) {
        // Only log if it's not a timeout or missing table
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (!errorMessage.includes('timed out') && !errorMessage.includes('does not exist')) {
            console.error(`Cache read error for ${cacheKey}:`, error);
        }
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
        if (!supabase) return;
        
        const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

        await withTimeout(
            supabase
                .from(table)
                .upsert({
                    cache_key: cacheKey,
                    data: data,
                    expires_at: expiresAt.toISOString(),
                    ...metadata,
                }, {
                    onConflict: 'cache_key',
                })
                .then(),
            CACHE_TIMEOUT_MS
        );
    } catch (error) {
        // Silently ignore cache write errors - data will be fetched fresh
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (!errorMessage.includes('timed out') && !errorMessage.includes('does not exist')) {
            console.error(`Cache write error for ${cacheKey}:`, error);
        }
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
        if (!supabase) return;

        await withTimeout(
            supabase
                .from(table)
                .delete()
                .eq('cache_key', cacheKey)
                .then(),
            CACHE_TIMEOUT_MS
        );
    } catch (error) {
        // Silently ignore delete errors
    }
}

/**
 * Clear all expired cache entries
 */
export async function clearExpiredCache(): Promise<void> {
    try {
        const supabase = getSupabaseAdmin();
        if (!supabase) return;
        
        const now = new Date().toISOString();

        const tables: CacheTable[] = [
            'technician_period_cache',
            'rankings_cache',
            'leads_cache',
        ];

        await Promise.all(
            tables.map(table =>
                withTimeout(
                    supabase.from(table).delete().lt('expires_at', now).then(),
                    CACHE_TIMEOUT_MS
                ).catch(() => {}) // Ignore individual table errors
            )
        );
    } catch (error) {
        // Silently ignore errors
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
    const periodTTL = getCacheTTL(days);
    const ttl = isPrevious ? periodTTL.previous : periodTTL.current;

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
 * Get cached rankings including stale data (for stale-while-revalidate pattern)
 * Returns { data, isStale } where isStale indicates if the cache has expired
 */
export async function getCachedRankingsWithStale(
    days: ValidPeriod
): Promise<{ data: any | null; isStale: boolean }> {
    try {
        const supabase = getSupabaseAdmin();
        if (!supabase) return { data: null, isStale: false };

        const cacheKey = `rankings:v2:${days}`;
        const now = new Date().toISOString();

        // First try to get non-expired data
        const { data: fresh, error: freshError } = await withTimeout(
            supabase
                .from('rankings_cache')
                .select('data, expires_at')
                .eq('cache_key', cacheKey)
                .gt('expires_at', now)
                .single()
                .then(),
            CACHE_TIMEOUT_MS
        );

        if (!freshError && fresh) {
            return { data: fresh.data, isStale: false };
        }

        // Try to get stale data (any data, even expired)
        const { data: stale, error: staleError } = await withTimeout(
            supabase
                .from('rankings_cache')
                .select('data, expires_at')
                .eq('cache_key', cacheKey)
                .single()
                .then(),
            CACHE_TIMEOUT_MS
        );

        if (!staleError && stale) {
            return { data: stale.data, isStale: true };
        }

        return { data: null, isStale: false };
    } catch (error) {
        return { data: null, isStale: false };
    }
}

/**
 * Set cached rankings
 */
export async function setCachedRankings(days: ValidPeriod, data: any): Promise<void> {
    const cacheKey = `rankings:v2:${days}`;
    const periodTTL = getCacheTTL(days);
    await setCached('rankings_cache', cacheKey, data, periodTTL.rankings, { days });
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
    const periodTTL = getCacheTTL(days);
    const ttl = isPrevious ? periodTTL.previous : periodTTL.current;

    await setCached('leads_cache', cacheKey, data, ttl, {
        days,
        is_previous: isPrevious,
    });
}

