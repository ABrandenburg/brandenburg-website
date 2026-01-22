'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    Header,
    RankingCard,
    ScorecardSkeleton,
} from '@/components/scorecard';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, AlertTriangle, Maximize, Minimize } from 'lucide-react';
import type { RankedKPIs, ValidPeriod } from '@/lib/servicetitan/types';
import { formatCurrency, formatPercentage, formatDecimal } from '@/lib/servicetitan/rankings';

// Auto-refresh interval in milliseconds (5 minutes)
const REFRESH_INTERVAL = 5 * 60 * 1000;

interface ApiMeta {
    dataSource: string;
    technicianCount: number;
    warnings: string[];
}

function ScorecardContent() {
    const searchParams = useSearchParams();
    const days = (parseInt(searchParams.get('days') || '7', 10) as ValidPeriod) || 7;

    const [data, setData] = useState<RankedKPIs | null>(null);
    const [meta, setMeta] = useState<ApiMeta | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const fetchData = useCallback(async (showLoading = true) => {
        if (showLoading) {
            setLoading(true);
        }
        setError(null);

        try {
            const response = await fetch(`/api/scorecard/rankings?days=${days}`);
            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch data');
            }

            setData(result.data);
            setMeta(result.meta || null);
            setLastUpdated(new Date());
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    }, [days]);

    // Initial fetch and auto-refresh
    useEffect(() => {
        fetchData();

        // Set up auto-refresh interval
        const intervalId = setInterval(() => {
            fetchData(false); // Don't show loading state on auto-refresh
        }, REFRESH_INTERVAL);

        return () => clearInterval(intervalId);
    }, [fetchData]);

    // Fullscreen toggle
    const toggleFullscreen = useCallback(() => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => {
                setIsFullscreen(true);
            }).catch(console.error);
        } else {
            document.exitFullscreen().then(() => {
                setIsFullscreen(false);
            }).catch(console.error);
        }
    }, []);

    // Listen for fullscreen changes
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    if (loading) {
        return <ScorecardSkeleton />;
    }

    if (error) {
        return (
            <div className="space-y-6">
                <Header
                    title="Technician Scorecard"
                    description="Performance rankings and KPIs"
                    showTimeFilter={false}
                />
                <Card className="bg-red-50 border-red-200">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                            <AlertCircle className="w-6 h-6 text-red-600 shrink-0" />
                            <div>
                                <h3 className="font-semibold text-red-800">Error Loading Data</h3>
                                <p className="text-red-700 mt-1">{error}</p>
                                <button
                                    onClick={() => fetchData()}
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

    // Check for empty data
    const technicianCount = data.totalRevenueCompleted?.length || 0;
    if (technicianCount === 0) {
        return (
            <div className="space-y-6">
                <Header
                    title="Technician Scorecard"
                    description="Performance rankings and KPIs"
                    showTimeFilter={false}
                />
                <Card className="bg-amber-50 border-amber-200">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                            <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
                            <div>
                                <h3 className="font-semibold text-amber-800">No Technician Data</h3>
                                <p className="text-amber-700 mt-1">
                                    The scorecard loaded successfully but contains no technician data for the last {days} days.
                                </p>
                                {meta?.warnings && meta.warnings.length > 0 && (
                                    <ul className="text-amber-600 text-sm mt-2 list-disc list-inside">
                                        {meta.warnings.map((warning, i) => (
                                            <li key={i}>{warning}</li>
                                        ))}
                                    </ul>
                                )}
                                <p className="text-amber-600 text-sm mt-3">
                                    Possible causes: No completed jobs in date range, ServiceTitan API issue, or data sync pending.
                                </p>
                                <button
                                    onClick={() => fetchData()}
                                    className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm"
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

    return (
        <div className={`space-y-4 ${isFullscreen ? 'p-6 bg-slate-50 min-h-screen' : ''}`}>
            <Header
                title="Technician Scorecard"
                description={`Last ${days} days${lastUpdated ? ` • Updated ${lastUpdated.toLocaleTimeString()}` : ''}`}
                showTimeFilter={!isFullscreen}
                actions={
                    <button
                        onClick={toggleFullscreen}
                        className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-blue/90 transition-colors text-sm font-medium"
                        title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen for iPad display'}
                    >
                        {isFullscreen ? (
                            <>
                                <Minimize className="w-4 h-4" />
                                Exit Fullscreen
                            </>
                        ) : (
                            <>
                                <Maximize className="w-4 h-4" />
                                Fullscreen
                            </>
                        )}
                    </button>
                }
            />

            {/* Ranking Cards Grid - Optimized for portrait iPad */}
            <div className={`grid gap-4 ${isFullscreen ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'}`}>
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
                    title="Sales"
                    technicians={data.sales}
                    showTotal={true}
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
            </div>

            {/* Date Range Info - Only show when not fullscreen */}
            {!isFullscreen && (
                <div className="text-center text-sm text-slate-500 pt-4 border-t border-slate-100">
                    Showing data from {data.dateRange.startDate} to {data.dateRange.endDate}
                    {data.hasPreviousPeriodData && (
                        <span className="block mt-1">
                            Compared to {data.dateRange.previousStartDate} to {data.dateRange.previousEndDate}
                        </span>
                    )}
                </div>
            )}

            {/* Auto-refresh indicator in fullscreen */}
            {isFullscreen && (
                <div className="fixed bottom-4 right-4 text-xs text-slate-400 bg-white/80 px-3 py-1.5 rounded-full shadow">
                    Auto-refreshes every 5 minutes
                </div>
            )}
        </div>
    );
}

export default function ScorecardPage() {
    return (
        <Suspense fallback={<ScorecardSkeleton />}>
            <ScorecardContent />
        </Suspense>
    );
}
