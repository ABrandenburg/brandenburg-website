// Analytics Refresh Cron Job
// GET /api/cron/refresh-analytics
// Protected by CRON_SECRET header
// Runs every 30 minutes to refresh tech_performance_card materialized view

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
        throw new Error('Supabase credentials not configured');
    }
    return createClient(url, key);
}

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 1 minute

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

    try {
        const startTime = Date.now();

        console.log('=== Analytics Refresh Cron Job Started ===');
        console.log('Timestamp:', new Date().toISOString());

        // Refresh materialized view
        console.log('Refreshing tech_performance_card materialized view...');
        const { error } = await getSupabaseAdmin().rpc('refresh_tech_performance_card');

        if (error) {
            throw error;
        }

        const duration = Date.now() - startTime;

        console.log('=== Analytics Refresh Completed ===');
        console.log(`Duration: ${duration}ms`);

        return NextResponse.json({
            success: true,
            message: 'Analytics refreshed successfully',
            duration: `${duration}ms`,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Analytics refresh error:', error);
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
