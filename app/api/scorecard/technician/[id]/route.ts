// Individual Technician API Route
// GET /api/scorecard/technician/:id?days=7|30|90|365

import { NextRequest, NextResponse } from 'next/server';
import { calculateRankings, VALID_PERIODS, ValidPeriod, RankedTechnician } from '@/lib/servicetitan';

export const dynamic = 'force-dynamic';

interface TechnicianDetail {
    id: string;
    name: string;
    metrics: {
        label: string;
        value: number;
        formattedValue: string;
        trend: number;
        rank: number;
        totalTechnicians: number;
    }[];
}

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const technicianId = params.id;
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

        // Find the technician in each ranking
        const findTechnician = (list: RankedTechnician[]): RankedTechnician | undefined =>
            list.find(t => t.id === technicianId);

        const revenueData = findTechnician(rankings.totalRevenueCompleted);

        if (!revenueData) {
            return NextResponse.json(
                { error: 'Technician not found' },
                { status: 404 }
            );
        }

        const technician: TechnicianDetail = {
            id: technicianId,
            name: revenueData.name,
            metrics: [
                {
                    label: 'Total Revenue',
                    ...extractMetric(rankings.totalRevenueCompleted, technicianId),
                },
                {
                    label: 'Total Sales',
                    ...extractMetric(rankings.totalSales, technicianId),
                },
                {
                    label: 'Opportunity Job Average',
                    ...extractMetric(rankings.opportunityJobAverage, technicianId),
                },
                {
                    label: 'Close Rate',
                    ...extractMetric(rankings.closeRate, technicianId),
                },
                {
                    label: 'Options per Opportunity',
                    ...extractMetric(rankings.optionsPerOpportunity, technicianId),
                },
                {
                    label: 'Memberships Sold',
                    ...extractMetric(rankings.membershipsSold, technicianId),
                },
                {
                    label: 'Billable Hours',
                    ...extractMetric(rankings.hoursSold, technicianId),
                },
            ],
        };

        return NextResponse.json({
            success: true,
            days,
            data: technician,
            dateRange: rankings.dateRange,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Technician API error:', error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Unknown error',
                success: false,
            },
            { status: 500 }
        );
    }
}

function extractMetric(list: RankedTechnician[], id: string) {
    const tech = list.find(t => t.id === id);
    return {
        value: tech?.value ?? 0,
        formattedValue: tech?.formattedValue ?? '0',
        trend: tech?.trend ?? 0,
        rank: tech?.rank ?? 0,
        totalTechnicians: list.length,
    };
}
