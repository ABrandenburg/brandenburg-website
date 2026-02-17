// Individual Technician API Route
// GET /api/scorecard/technician/:id?days=7|30|90|365
// Reads from the scorecard_data table

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { VALID_PERIODS, type ValidPeriod, type RankedTechnician, type RankedKPIs } from '@/lib/scorecard';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

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

function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceRoleKey) {
        return null;
    }

    return createClient(url, serviceRoleKey, {
        auth: { persistSession: false },
        global: {
            fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }),
        },
    });
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const technicianId = id;
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
                { error: 'Database not configured', success: false },
                { status: 500 }
            );
        }

        // Fetch the most recent scorecard data for this period
        const { data: scorecardRow, error } = await supabase
            .from('scorecard_data')
            .select('data, report_date')
            .eq('period', days)
            .order('report_date', { ascending: false })
            .limit(1)
            .single();

        if (error || !scorecardRow) {
            return NextResponse.json(
                { error: 'No scorecard data available', success: false },
                { status: 404 }
            );
        }

        const rankings: RankedKPIs = scorecardRow.data?.rankings;
        if (!rankings) {
            return NextResponse.json(
                { error: 'No rankings data available', success: false },
                { status: 404 }
            );
        }

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
