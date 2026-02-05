// Ad Spend Sync Cron Job
// GET /api/cron/sync-ad-spend
// Protected by CRON_SECRET header
// Runs daily to sync ad spend data from Google Ads and Meta Ads

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
    fetchYesterdayGoogleAdsData,
    isGoogleAdsConfigured,
} from '@/lib/ads/google-ads';
import {
    fetchYesterdayMetaAdsData,
    isMetaAdsConfigured,
} from '@/lib/ads/meta-ads';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes max for cron job

interface AdSpendData {
    date: string;
    spend: number;
    impressions: number;
    clicks: number;
    conversions: number;
}

interface SyncResult {
    platform: string;
    success: boolean;
    recordsSynced: number;
    error?: string;
}

/**
 * Retry a function with exponential backoff
 */
async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error: any) {
            lastError = error;
            console.error(`Attempt ${attempt}/${maxRetries} failed:`, error.message);

            if (attempt < maxRetries) {
                const delay = baseDelay * Math.pow(2, attempt - 1); // Exponential backoff
                console.log(`Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    throw lastError;
}

/**
 * Sync ad spend data to Supabase
 */
async function syncAdSpendToDatabase(
    platform: string,
    data: AdSpendData[]
): Promise<number> {
    if (data.length === 0) {
        console.log(`No ${platform} data to sync`);
        return 0;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Syncing ${data.length} records to database for ${platform}...`);

    // Transform data to match database schema
    const records = data.map(record => ({
        platform,
        date: record.date,
        spend: record.spend,
        impressions: record.impressions,
        clicks: record.clicks,
        conversions: record.conversions,
        metadata: {
            synced_at: new Date().toISOString(),
            source: 'cron',
        },
        updated_at: new Date().toISOString(),
    }));

    // Upsert records (insert or update based on unique constraint)
    const { data: result, error } = await supabase
        .from('raw_ad_spend')
        .upsert(records, {
            onConflict: 'platform,date',
            ignoreDuplicates: false,
        });

    if (error) {
        console.error(`Failed to sync ${platform} data to database:`, error);
        throw error;
    }

    console.log(`Successfully synced ${records.length} records for ${platform}`);

    return records.length;
}

/**
 * Sync data from a single platform with retry logic
 */
async function syncPlatform(
    platform: 'google' | 'meta',
    fetchFn: () => Promise<AdSpendData[]>,
    isConfigured: boolean
): Promise<SyncResult> {
    const result: SyncResult = {
        platform,
        success: false,
        recordsSynced: 0,
    };

    if (!isConfigured) {
        console.log(`${platform} Ads not configured, skipping...`);
        result.success = true; // Not an error, just not configured
        return result;
    }

    try {
        console.log(`\n=== Syncing ${platform} Ads ===`);

        // Fetch data with retry logic
        const data = await retryWithBackoff(fetchFn, 3, 1000);

        // Sync to database with retry logic
        const recordsSynced = await retryWithBackoff(
            () => syncAdSpendToDatabase(platform, data),
            3,
            1000
        );

        result.success = true;
        result.recordsSynced = recordsSynced;

        console.log(`${platform} Ads sync completed successfully`);
    } catch (error: any) {
        console.error(`${platform} Ads sync failed:`, error.message);
        result.success = false;
        result.error = error.message;
    }

    return result;
}

/**
 * Main cron job handler
 */
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

    const startTime = Date.now();

    console.log('=== Ad Spend Sync Cron Job Started ===');
    console.log('Timestamp:', new Date().toISOString());

    try {
        // Sync both platforms in parallel
        const [googleResult, metaResult] = await Promise.all([
            syncPlatform('google', fetchYesterdayGoogleAdsData, isGoogleAdsConfigured()),
            syncPlatform('meta', fetchYesterdayMetaAdsData, isMetaAdsConfigured()),
        ]);

        const results = [googleResult, metaResult];

        // Calculate summary
        const totalSynced = results.reduce((sum, r) => sum + r.recordsSynced, 0);
        const successCount = results.filter(r => r.success).length;
        const failureCount = results.filter(r => !r.success).length;
        const errors = results.filter(r => r.error).map(r => ({
            platform: r.platform,
            error: r.error,
        }));

        const duration = `${((Date.now() - startTime) / 1000).toFixed(1)}s`;

        const response = {
            success: failureCount === 0,
            summary: {
                platforms: {
                    google: googleResult,
                    meta: metaResult,
                },
                totalRecordsSynced: totalSynced,
                successCount,
                failureCount,
            },
            errors,
            duration,
            timestamp: new Date().toISOString(),
        };

        console.log('=== Ad Spend Sync Completed ===');
        console.log('Summary:', JSON.stringify(response.summary, null, 2));

        // Return 200 even if some platforms failed (partial success)
        // This prevents Vercel from marking the cron as failed
        return NextResponse.json(response);
    } catch (error: any) {
        const duration = `${((Date.now() - startTime) / 1000).toFixed(1)}s`;

        console.error('Ad spend sync cron error:', error);

        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Unknown error',
                duration,
                timestamp: new Date().toISOString(),
            },
            { status: 500 }
        );
    }
}
