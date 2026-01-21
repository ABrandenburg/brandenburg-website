// Gross Margin API Route
// GET /api/scorecard/gross-margin?days=7|30|90|365

import { NextRequest, NextResponse } from 'next/server';
import { fetchGrossMargin, VALID_PERIODS, ValidPeriod } from '@/lib/servicetitan';

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

        const grossMargin = await fetchGrossMargin(days);

        return NextResponse.json({
            success: true,
            days,
            data: grossMargin,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Gross margin API error:', error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Unknown error',
                success: false,
            },
            { status: 500 }
        );
    }
}
