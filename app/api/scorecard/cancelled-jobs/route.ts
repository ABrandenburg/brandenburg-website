// Cancelled Jobs API Route
// GET /api/scorecard/cancelled-jobs?days=7|30|90|365

import { NextRequest, NextResponse } from 'next/server';
import { fetchCancelledJobsSummary, VALID_PERIODS, ValidPeriod } from '@/lib/servicetitan';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const daysParam = searchParams.get('days') || '7';
        const days = parseInt(daysParam, 10) as ValidPeriod;
        const offsetDays = parseInt(searchParams.get('offset') || '0', 10);

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

        const cancelledJobs = await fetchCancelledJobsSummary(days, offsetDays);

        return NextResponse.json({
            success: true,
            days,
            offset: offsetDays,
            data: cancelledJobs,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Cancelled jobs API error:', error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Unknown error',
                success: false,
            },
            { status: 500 }
        );
    }
}
