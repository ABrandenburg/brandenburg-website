// Scorecard Sync Cron Job
// GET /api/cron/sync-scorecard
// Protected by CRON_SECRET header

import { NextRequest, NextResponse } from 'next/server';
import {
    calculateRankings,
    fetchGrossMargin,
    fetchCancelledJobsSummary,
    clearExpiredCache,
    VALID_PERIODS,
    ValidPeriod,
    delay,
    isServiceTitanConfigured,
} from '@/lib/servicetitan';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes max for cron job

const DELAY_BETWEEN_PERIODS_MS = 15000; // 15 seconds between period syncs

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

        // Sync rankings for all periods
        for (let i = 0; i < VALID_PERIODS.length; i++) {
            const period = VALID_PERIODS[i];

            // Add delay between syncs (except first)
            if (i > 0) {
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
        }

        // Sync gross margin for commonly used periods
        const gmPeriods: ValidPeriod[] = [7, 30, 90];
        for (const period of gmPeriods) {
            await delay(DELAY_BETWEEN_PERIODS_MS);
            try {
                await fetchGrossMargin(period);
                results.push({ period, type: 'gross-margin', success: true });
            } catch (error) {
                results.push({
                    period,
                    type: 'gross-margin',
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        }

        // Sync cancelled jobs for commonly used periods
        for (const period of gmPeriods) {
            await delay(DELAY_BETWEEN_PERIODS_MS);
            try {
                await fetchCancelledJobsSummary(period);
                results.push({ period, type: 'cancelled-jobs', success: true });
            } catch (error) {
                results.push({
                    period,
                    type: 'cancelled-jobs',
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
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
