'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, Trophy, Medal } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RankedTechnician, GoalConfig } from '@/lib/servicetitan/types';

interface RankingCardProps {
    title: string;
    technicians: RankedTechnician[];
    trendSuffix?: string;
    showTrends?: boolean;
    goal?: GoalConfig;
    showTotal?: boolean;
    basePath?: string;
}

export function RankingCard({
    title,
    technicians,
    trendSuffix = '%',
    showTrends = true,
    goal,
    showTotal = false,
    basePath = '/admin/tools/scorecard/technician',
}: RankingCardProps) {
    // Guard against undefined technicians (e.g., from stale cache)
    const safeTechnicians = technicians ?? [];
    
    // Calculate team total and average
    const teamTotal = safeTechnicians.reduce((sum, t) => sum + t.value, 0);
    const teamAverage = safeTechnicians.length > 0 ? teamTotal / safeTechnicians.length : 0;

    const goalProgress = goal ? Math.min((teamAverage / goal.value) * 100, 150) : 0;

    return (
        <Card className="h-full flex flex-col bg-white border-slate-200">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold uppercase tracking-wide text-slate-600">
                        {title}
                    </CardTitle>
                    {goal && (
                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
                            Goal: {goal.formatValue(goal.value)}
                        </span>
                    )}
                </div>

                {showTotal && (
                    <div className="mt-3 p-3 bg-gradient-to-r from-brand-blue/5 to-brand-blue/10 rounded-lg border border-brand-blue/10">
                        <div className="text-xs text-slate-500 mb-1">
                            Total Team Revenue
                        </div>
                        <div className="text-2xl font-bold text-brand-blue">
                            {goal?.formatValue(teamTotal) || teamTotal.toLocaleString()}
                        </div>
                    </div>
                )}

                {goal && (
                    <div className="mt-3">
                        <div className="flex items-center justify-between text-xs mb-2">
                            <span className="text-slate-500">
                                Team Avg: <span className="font-semibold text-slate-700">{goal.formatValue(teamAverage)}</span>
                            </span>
                            <span className={cn(
                                'font-semibold',
                                goalProgress >= 100 ? 'text-green-600' : 'text-slate-600'
                            )}>
                                {Math.round((teamAverage / goal.value) * 100)}%
                            </span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                                className={cn(
                                    'h-full rounded-full transition-all duration-500',
                                    goalProgress >= 100 ? 'bg-green-500' : 'bg-brand-blue'
                                )}
                                style={{ width: `${Math.min(goalProgress, 100)}%` }}
                            />
                        </div>
                    </div>
                )}
            </CardHeader>

            <CardContent className="flex-1 overflow-auto pt-0">
                <div className="space-y-1">
                    {safeTechnicians.map((tech) => (
                        <Link
                            key={tech.id}
                            href={`${basePath}/${tech.id}`}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors group"
                        >
                            {/* Rank Badge */}
                            <div className={cn(
                                'w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold shrink-0',
                                tech.rank === 1
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : tech.rank === 2
                                        ? 'bg-slate-200 text-slate-600'
                                        : tech.rank === 3
                                            ? 'bg-amber-100 text-amber-700'
                                            : 'bg-slate-100 text-slate-500'
                            )}>
                                {tech.rank === 1 ? (
                                    <Trophy className="w-4 h-4" />
                                ) : tech.rank <= 3 ? (
                                    <Medal className="w-4 h-4" />
                                ) : (
                                    tech.rank
                                )}
                            </div>

                            {/* Name */}
                            <span className="flex-1 font-medium text-slate-700 truncate group-hover:text-brand-blue transition-colors">
                                {tech.name}
                            </span>

                            {/* Value */}
                            <span className="font-bold text-slate-900 tabular-nums">
                                {tech.formattedValue}
                            </span>

                            {/* Trend */}
                            {showTrends && tech.trend !== 0 && (
                                <TrendBadge trend={tech.trend} suffix={trendSuffix} />
                            )}
                        </Link>
                    ))}

                    {safeTechnicians.length === 0 && (
                        <div className="py-8 text-center text-slate-400 text-sm">
                            No data available
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function TrendBadge({ trend, suffix }: { trend: number; suffix: string }) {
    const isPositive = trend > 0;
    const isNeutral = trend === 0;

    return (
        <span className={cn(
            'flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full tabular-nums shrink-0',
            isNeutral
                ? 'bg-slate-100 text-slate-500'
                : isPositive
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
        )}>
            {isNeutral ? (
                <Minus className="w-3 h-3" />
            ) : isPositive ? (
                <TrendingUp className="w-3 h-3" />
            ) : (
                <TrendingDown className="w-3 h-3" />
            )}
            {isPositive ? '+' : ''}{trend}{suffix}
        </span>
    );
}
