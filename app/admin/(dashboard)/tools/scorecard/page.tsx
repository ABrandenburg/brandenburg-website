'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
    Header,
    RankingCard,
    KPICard,
    KPIGrid,
    LeadsSummary,
    ScorecardSkeleton,
} from '@/components/scorecard';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, TrendingUp, Target, Users, AlertCircle, PieChart } from 'lucide-react';
import type { RankedKPIs, ValidPeriod } from '@/lib/servicetitan/types';
import { formatCurrency, formatPercentage, formatDecimal } from '@/lib/servicetitan/rankings';

export default function ScorecardPage() {
    const searchParams = useSearchParams();
    const days = (parseInt(searchParams.get('days') || '7', 10) as ValidPeriod) || 7;

    const [data, setData] = useState<RankedKPIs | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch(`/api/scorecard/rankings?days=${days}`);
                const result = await response.json();

                if (!result.success) {
                    throw new Error(result.error || 'Failed to fetch data');
                }

                setData(result.data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [days]);

    if (loading) {
        return <ScorecardSkeleton />;
    }

    if (error) {
        return (
            <div className="space-y-6">
                <Header
                    title="Technician Scorecard"
                    description="Performance rankings and KPIs"
                />
                <Card className="bg-red-50 border-red-200">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                            <AlertCircle className="w-6 h-6 text-red-600 shrink-0" />
                            <div>
                                <h3 className="font-semibold text-red-800">Error Loading Data</h3>
                                <p className="text-red-700 mt-1">{error}</p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                                >
                                    Retry
                                </button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!data) {
        return null;
    }

    // Calculate trends for KPI cards
    const revenueTrend = data.overallStats?.previousTotalRevenue
        ? Math.round(((data.overallStats.totalRevenue - data.overallStats.previousTotalRevenue) / data.overallStats.previousTotalRevenue) * 100)
        : undefined;

    const closeRateTrend = data.overallStats?.previousOpportunityCloseRate
        ? Math.round(data.overallStats.opportunityCloseRate - data.overallStats.previousOpportunityCloseRate)
        : undefined;

    const avgJobTrend = data.overallStats?.previousOpportunityJobAverage
        ? Math.round(((data.overallStats.opportunityJobAverage - data.overallStats.previousOpportunityJobAverage) / data.overallStats.previousOpportunityJobAverage) * 100)
        : undefined;

    return (
        <div className="space-y-6">
            <Header
                title="Technician Scorecard"
                description={`Performance rankings for the last ${days} days`}
                actions={
                    <Link
                        href={`/admin/tools/scorecard/gm?days=${days}`}
                        className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-blue/90 transition-colors text-sm font-medium"
                    >
                        <PieChart className="w-4 h-4" />
                        Gross Margin
                    </Link>
                }
            />

            {/* Summary KPIs */}
            <KPIGrid>
                <KPICard
                    title="Total Revenue"
                    value={formatCurrency(data.overallStats?.totalRevenue || 0)}
                    trend={revenueTrend}
                    icon={<DollarSign className="w-5 h-5" />}
                />
                <KPICard
                    title="Close Rate"
                    value={formatPercentage(data.overallStats?.opportunityCloseRate || 0)}
                    trend={closeRateTrend}
                    trendSuffix=" pts"
                    icon={<TrendingUp className="w-5 h-5" />}
                />
                <KPICard
                    title="Avg Job Value"
                    value={formatCurrency(data.overallStats?.opportunityJobAverage || 0)}
                    trend={avgJobTrend}
                    icon={<Target className="w-5 h-5" />}
                />
                <KPICard
                    title="Technicians"
                    value={data.totalRevenueCompleted.length.toString()}
                    subtitle="Active this period"
                    icon={<Users className="w-5 h-5" />}
                />
            </KPIGrid>

            {/* Leads Summary */}
            {data.leadsSummary && (
                <LeadsSummary data={data.leadsSummary} />
            )}

            {/* Ranking Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <RankingCard
                    title="Total Revenue"
                    technicians={data.totalRevenueCompleted}
                    showTotal={true}
                    goal={{
                        value: 15000,
                        formatValue: formatCurrency,
                        label: 'Average Goal',
                    }}
                />
                <RankingCard
                    title="Close Rate"
                    technicians={data.closeRate}
                    trendSuffix=" pts"
                    goal={{
                        value: 70,
                        formatValue: (v) => `${v}%`,
                    }}
                />
                <RankingCard
                    title="Opportunity Job Avg"
                    technicians={data.opportunityJobAverage}
                    goal={{
                        value: 2000,
                        formatValue: formatCurrency,
                    }}
                />
                <RankingCard
                    title="Options per Opportunity"
                    technicians={data.optionsPerOpportunity}
                    goal={{
                        value: 3,
                        formatValue: (v) => v.toFixed(1),
                    }}
                />
                <RankingCard
                    title="Memberships Sold"
                    technicians={data.membershipsSold}
                    trendSuffix=""
                />
                <RankingCard
                    title="Membership Conversion"
                    technicians={data.membershipConversionRate}
                    trendSuffix=" pts"
                    goal={{
                        value: 40,
                        formatValue: (v) => `${v}%`,
                    }}
                />
                <RankingCard
                    title="Billable Hours"
                    technicians={data.hoursSold}
                />
                <RankingCard
                    title="Leads"
                    technicians={data.leads}
                    trendSuffix=""
                />
                <RankingCard
                    title="Leads Booked"
                    technicians={data.leadsBooked}
                    trendSuffix=""
                />
            </div>

            {/* Date Range Info */}
            <div className="text-center text-sm text-slate-500 pt-4 border-t border-slate-100">
                Showing data from {data.dateRange.startDate} to {data.dateRange.endDate}
                {data.hasPreviousPeriodData && (
                    <span className="block mt-1">
                        Compared to {data.dateRange.previousStartDate} to {data.dateRange.previousEndDate}
                    </span>
                )}
            </div>
        </div>
    );
}
