// Rankings API Route
// GET /api/scorecard/rankings?days=7|30|90|365

import { NextRequest, NextResponse } from 'next/server';
import { calculateRankings, VALID_PERIODS, ValidPeriod } from '@/lib/servicetitan';

export const dynamic = 'force-dynamic';

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

        const rankings = await calculateRankings(days);

        return NextResponse.json({
            success: true,
            days,
            data: rankings,
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
