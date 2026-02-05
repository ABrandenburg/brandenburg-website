// Manual Backfill Endpoint for Ad Spend Data
// POST /api/admin/backfill-ad-spend
// Protected by CRON_SECRET header
// Allows manual backfilling of historical ad spend data

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
    fetchGoogleAdsData,
    isGoogleAdsConfigured,
} from '@/lib/ads/google-ads';
import {
    fetchMetaAdsData,
    isMetaAdsConfigured,
} from '@/lib/ads/meta-ads';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes max

interface AdSpendData {
    date: string;
    spend: number;
    impressions: number;
    clicks: number;
    conversions: number;
}

/**
 * Sync ad spend data to Supabase
 */
async function syncAdSpendToDatabase(
    platform: string,
    data: AdSpendData[]
): Promise<number> {
    if (data.length === 0) {
        return 0;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const records = data.map(record => ({
        platform,
        date: record.date,
        spend: record.spend,
        impressions: record.impressions,
        clicks: record.clicks,
        conversions: record.conversions,
        metadata: {
            synced_at: new Date().toISOString(),
            source: 'backfill',
        },
        updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase
        .from('raw_ad_spend')
        .upsert(records, {
            onConflict: 'platform,date',
            ignoreDuplicates: false,
        });

    if (error) {
        throw error;
    }

    return records.length;
}

/**
 * Backfill handler
 */
export async function POST(request: NextRequest) {
    // Verify authorization
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    const startTime = Date.now();

    try {
        // Parse request body
        const body = await request.json();
        const { startDate, endDate, platforms } = body;

        // Validate inputs
        if (!startDate || !endDate) {
            return NextResponse.json(
                { error: 'startDate and endDate are required (YYYY-MM-DD format)' },
                { status: 400 }
            );
        }

        const platformList = platforms || ['google', 'meta'];

        console.log('=== Ad Spend Backfill Started ===');
        console.log('Date range:', `${startDate} to ${endDate}`);
        console.log('Platforms:', platformList);

        const results: any[] = [];

        // Backfill Google Ads
        if (platformList.includes('google') && isGoogleAdsConfigured()) {
            console.log('\n--- Backfilling Google Ads ---');
            try {
                const data = await fetchGoogleAdsData(startDate, endDate);
                const recordsSynced = await syncAdSpendToDatabase('google', data);
                results.push({
                    platform: 'google',
                    success: true,
                    recordsSynced,
                });
                console.log(`Google Ads: Synced ${recordsSynced} records`);
            } catch (error: any) {
                results.push({
                    platform: 'google',
                    success: false,
                    error: error.message,
                });
                console.error('Google Ads backfill failed:', error.message);
            }
        }

        // Backfill Meta Ads
        if (platformList.includes('meta') && isMetaAdsConfigured()) {
            console.log('\n--- Backfilling Meta Ads ---');
            try {
                const data = await fetchMetaAdsData(startDate, endDate);
                const recordsSynced = await syncAdSpendToDatabase('meta', data);
                results.push({
                    platform: 'meta',
                    success: true,
                    recordsSynced,
                });
                console.log(`Meta Ads: Synced ${recordsSynced} records`);
            } catch (error: any) {
                results.push({
                    platform: 'meta',
                    success: false,
                    error: error.message,
                });
                console.error('Meta Ads backfill failed:', error.message);
            }
        }

        const duration = `${((Date.now() - startTime) / 1000).toFixed(1)}s`;
        const totalSynced = results.reduce((sum, r) => sum + (r.recordsSynced || 0), 0);

        console.log('=== Backfill Completed ===');
        console.log(`Total records synced: ${totalSynced}`);

        return NextResponse.json({
            success: true,
            dateRange: { startDate, endDate },
            results,
            totalRecordsSynced: totalSynced,
            duration,
            timestamp: new Date().toISOString(),
        });
    } catch (error: any) {
        const duration = `${((Date.now() - startTime) / 1000).toFixed(1)}s`;

        console.error('Backfill error:', error);

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
