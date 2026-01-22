'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import Link from 'next/link';
import { Header, KPICard, KPICardSkeleton } from '@/components/scorecard';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, AlertTriangle, ArrowLeft, Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ValidPeriod } from '@/lib/servicetitan/types';

interface TechnicianMetric {
    label: string;
    value: number;
    formattedValue: string;
    trend: number;
    rank: number;
    totalTechnicians: number;
}

interface TechnicianData {
    id: string;
    name: string;
    metrics: TechnicianMetric[];
}

function TechnicianDetailContent() {
    const params = useParams();
    const searchParams = useSearchParams();
    const technicianId = params.id as string;
    const days = (parseInt(searchParams.get('days') || '7', 10) as ValidPeriod) || 7;

    const [data, setData] = useState<TechnicianData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch(`/api/scorecard/technician/${technicianId}?days=${days}`);
                const result = await response.json();

                if (!result.success) {
                    throw new Error(result.error || 'Failed to fetch technician data');
                }

                setData(result.data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [technicianId, days]);

    if (error) {
        return (
            <div className="space-y-6">
                <Header
                    title="Technician Details"
                    description="Individual performance metrics"
                />
                <Card className="bg-red-50 border-red-200">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                            <AlertCircle className="w-6 h-6 text-red-600 shrink-0" />
                            <div>
                                <h3 className="font-semibold text-red-800">Error Loading Data</h3>
                                <p className="text-red-700 mt-1">{error}</p>
                                <Link
                                    href={`/admin/tools/scorecard?days=${days}`}
                                    className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Back to Scorecard
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Header
                title={loading ? 'Loading...' : data?.name || 'Technician Details'}
                description={`Performance metrics for the last ${days} days`}
                actions={
                    <Link
                        href={`/admin/tools/scorecard?days=${days}`}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Scorecard
                    </Link>
                }
            />

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(9)].map((_, i) => (
                        <KPICardSkeleton key={i} />
                    ))}
                </div>
            ) : data ? (
                data.metrics.length === 0 ? (
                    <Card className="bg-amber-50 border-amber-200">
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                                <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
                                <div>
                                    <h3 className="font-semibold text-amber-800">No Metrics Available</h3>
                                    <p className="text-amber-700 mt-1">
                                        No performance data found for this technician in the selected period.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {data.metrics.map((metric) => (
                            <MetricCard key={metric.label} metric={metric} />
                        ))}
                    </div>
                )
            ) : null}
        </div>
    );
}

function MetricCard({ metric }: { metric: TechnicianMetric }) {
    const isTop3 = metric.rank <= 3;
    const isFirst = metric.rank === 1;

    return (
        <Card className={cn(
            'bg-white border transition-all',
            isFirst && 'border-yellow-200 ring-1 ring-yellow-100'
        )}>
            <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <span className="text-sm font-medium text-slate-500">{metric.label}</span>
                    <RankBadge rank={metric.rank} total={metric.totalTechnicians} />
                </div>

                <div className="flex items-end gap-3">
                    <span className="text-3xl font-bold text-slate-900">
                        {metric.formattedValue}
                    </span>
                    {metric.trend !== 0 && (
                        <TrendIndicator trend={metric.trend} />
                    )}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Team Rank</span>
                        <span className={cn(
                            'font-bold',
                            isTop3 ? 'text-brand-blue' : 'text-slate-700'
                        )}>
                            #{metric.rank} of {metric.totalTechnicians}
                        </span>
                    </div>
                    {/* Rank visualization */}
                    <div className="mt-2 w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className={cn(
                                'h-full rounded-full transition-all',
                                isFirst ? 'bg-yellow-400' : isTop3 ? 'bg-brand-blue' : 'bg-slate-400'
                            )}
                            style={{
                                width: `${100 - ((metric.rank - 1) / metric.totalTechnicians) * 100}%`,
                            }}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function RankBadge({ rank, total }: { rank: number; total: number }) {
    const isFirst = rank === 1;
    const isTop3 = rank <= 3;

    return (
        <div className={cn(
            'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold',
            isFirst
                ? 'bg-yellow-100 text-yellow-700'
                : isTop3
                    ? 'bg-brand-blue/10 text-brand-blue'
                    : 'bg-slate-100 text-slate-600'
        )}>
            {isFirst && <Trophy className="w-3 h-3" />}
            #{rank}
        </div>
    );
}

function TrendIndicator({ trend }: { trend: number }) {
    const isPositive = trend > 0;
    const isNeutral = trend === 0;

    return (
        <span className={cn(
            'flex items-center gap-1 text-sm font-medium mb-1',
            isNeutral
                ? 'text-slate-500'
                : isPositive
                    ? 'text-green-600'
                    : 'text-red-600'
        )}>
            {isNeutral ? (
                <Minus className="w-4 h-4" />
            ) : isPositive ? (
                <TrendingUp className="w-4 h-4" />
            ) : (
                <TrendingDown className="w-4 h-4" />
            )}
            {isPositive ? '+' : ''}{trend}%
        </span>
    );
}

function TechnicianDetailSkeleton() {
    return (
        <div className="space-y-6">
            <Header
                title="Loading..."
                description="Performance metrics"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(9)].map((_, i) => (
                    <KPICardSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}

export default function TechnicianDetailPage() {
    return (
        <Suspense fallback={<TechnicianDetailSkeleton />}>
            <TechnicianDetailContent />
        </Suspense>
    );
}
