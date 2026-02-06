// Rankings API Route
// GET /api/scorecard/rankings?days=7|30|90|365
// Reads processed scorecard data from the scorecard_data table

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { VALID_PERIODS, type ValidPeriod, type RankedKPIs } from '@/lib/scorecard';

export const dynamic = 'force-dynamic';

function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceRoleKey) {
        return null;
    }

    return createClient(url, serviceRoleKey, {
        auth: { persistSession: false },
    });
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const daysParam = searchParams.get('days') || '7';
        const days = parseInt(daysParam, 10) as ValidPeriod;

        // Validate days parameter
        if (!VALID_PERIODS.includes(days)) {
            return NextResponse.json(
                {
                    error: 'Invalid days parameter',
                    validValues: VALID_PERIODS,
                },
                { status: 400 }
            );
        }

        const supabase = getSupabaseAdmin();
        if (!supabase) {
            return NextResponse.json(
                {
                    error: 'Database not configured',
                    success: false,
                },
                { status: 500 }
            );
        }

        // Fetch the most recent scorecard data for this period
        const { data: scorecardRow, error } = await supabase
            .from('scorecard_data')
            .select('data, report_date, source_filename, updated_at')
            .eq('period', days)
            .order('report_date', { ascending: false })
            .limit(1)
            .single();

        if (error || !scorecardRow) {
            return NextResponse.json({
                success: true,
                days,
                data: null,
                meta: {
                    dataSource: 'email-reports',
                    technicianCount: 0,
                    warnings: ['No scorecard data found for this period. Reports may not have been processed yet.'],
                },
                timestamp: new Date().toISOString(),
            });
        }

        const rankings: RankedKPIs = scorecardRow.data?.rankings;
        const technicianCount = rankings?.totalRevenueCompleted?.length || 0;

        // Build warnings
        const warnings: string[] = [];
        if (technicianCount === 0) {
            warnings.push('No technician data found for the selected period');
        }

        return NextResponse.json({
            success: true,
            days,
            data: rankings,
            meta: {
                dataSource: 'email-reports',
                technicianCount,
                reportDate: scorecardRow.report_date,
                sourceFilename: scorecardRow.source_filename,
                lastUpdated: scorecardRow.updated_at,
                warnings,
            },
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Rankings API error:', error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Unknown error',
                success: false,
            },
            { status: 500 }
        );
    }
}
