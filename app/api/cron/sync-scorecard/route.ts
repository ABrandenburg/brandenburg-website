// Scorecard Sync Cron Job
// GET /api/cron/sync-scorecard
// Protected by CRON_SECRET header

import { NextRequest, NextResponse } from 'next/server';
import {
    calculateRankings,
    clearExpiredCache,
    VALID_PERIODS,
    ValidPeriod,
    delay,
    isServiceTitanConfigured,
    getCachedRankingsWithStale,
    getCacheTTL,
} from '@/lib/servicetitan';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes max for cron job

// Increased delay between periods to avoid rate limiting
const DELAY_BETWEEN_PERIODS_MS = 30000; // 30 seconds between period syncs

// Refresh cache when it's within this percentage of expiration
const REFRESH_THRESHOLD = 0.3; // Refresh when 70% of TTL has passed

interface SyncResult {
    period: ValidPeriod;
    type: string;
    success: boolean;
    error?: string;
}

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
            message: 'ServiceTitan not configured, skipping sync',
            timestamp: new Date().toISOString(),
        });
    }

    const results: SyncResult[] = [];
    const startTime = Date.now();

    try {
        // Clear expired cache entries first
        await clearExpiredCache();

        // Determine which periods need syncing based on their TTL
        const periodsToSync: ValidPeriod[] = [];

        for (const period of VALID_PERIODS) {
            const { data, isStale } = await getCachedRankingsWithStale(period);
            const ttl = getCacheTTL(period);

            // Sync if: no data, stale, or approaching expiration
            if (!data || isStale) {
                periodsToSync.push(period);
            }
        }

        // Prioritize shorter periods (7-day most frequently viewed)
        periodsToSync.sort((a, b) => a - b);

        console.log(`Cron sync: ${periodsToSync.length} periods need refresh:`, periodsToSync);

        // Sync rankings for periods that need it
        let syncCount = 0;
        for (const period of periodsToSync) {
            // Add delay between syncs (except first)
            if (syncCount > 0) {
                await delay(DELAY_BETWEEN_PERIODS_MS);
            }

            try {
                await calculateRankings(period);
                results.push({ period, type: 'rankings', success: true });
            } catch (error) {
                results.push({
                    period,
                    type: 'rankings',
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
            syncCount++;
        }

        // Record skipped periods
        for (const period of VALID_PERIODS) {
            if (!periodsToSync.includes(period)) {
                results.push({ period, type: 'rankings-skipped', success: true });
            }
        }

        const successCount = results.filter(r => r.success).length;
        const failedCount = results.filter(r => !r.success).length;
        const duration = Date.now() - startTime;

        return NextResponse.json({
            success: true,
            results,
            summary: {
                total: results.length,
                successful: successCount,
                failed: failedCount,
            },
            duration: `${Math.round(duration / 1000)}s`,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Cron sync error:', error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Unknown error',
                results,
                success: false,
            },
            { status: 500 }
        );
    }
}
