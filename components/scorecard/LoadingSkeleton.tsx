'use client';

import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
    className?: string;
}

export function RankingCardSkeleton({ className }: LoadingSkeletonProps) {
    return (
        <div className={cn('bg-white rounded-lg border border-slate-200 p-6 animate-pulse', className)}>
            <div className="flex items-center justify-between mb-4">
                <div className="h-4 w-32 bg-slate-200 rounded" />
                <div className="h-5 w-16 bg-slate-200 rounded" />
            </div>
            <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-200 rounded-full" />
                        <div className="flex-1 h-4 bg-slate-200 rounded" />
                        <div className="w-16 h-4 bg-slate-200 rounded" />
                        <div className="w-12 h-5 bg-slate-200 rounded-full" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function KPICardSkeleton({ className }: LoadingSkeletonProps) {
    return (
        <div className={cn('bg-white rounded-lg border border-slate-200 p-6 animate-pulse', className)}>
            <div className="flex items-center justify-between mb-4">
                <div className="h-4 w-24 bg-slate-200 rounded" />
                <div className="w-5 h-5 bg-slate-200 rounded" />
            </div>
            <div className="flex items-end gap-2">
                <div className="h-8 w-32 bg-slate-200 rounded" />
                <div className="h-4 w-12 bg-slate-200 rounded" />
            </div>
        </div>
    );
}

export function GrossMarginSkeleton({ className }: LoadingSkeletonProps) {
    return (
        <div className={cn('bg-white rounded-lg border border-slate-200 p-6 animate-pulse', className)}>
            <div className="h-5 w-48 bg-slate-200 rounded mb-6" />
            <div className="grid grid-cols-3 gap-4 mb-6">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="p-4 bg-slate-100 rounded-xl text-center">
                        <div className="h-3 w-16 bg-slate-200 rounded mx-auto mb-2" />
                        <div className="h-7 w-24 bg-slate-200 rounded mx-auto" />
                    </div>
                ))}
            </div>
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="space-y-2">
                        <div className="flex justify-between">
                            <div className="h-4 w-20 bg-slate-200 rounded" />
                            <div className="h-4 w-24 bg-slate-200 rounded" />
                        </div>
                        <div className="h-2 w-full bg-slate-200 rounded-full" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function CancelledJobsSkeleton({ className }: LoadingSkeletonProps) {
    return (
        <div className={cn('bg-white rounded-lg border border-slate-200 p-6 animate-pulse', className)}>
            <div className="flex items-center justify-between mb-6">
                <div className="h-5 w-36 bg-slate-200 rounded" />
                <div className="h-8 w-12 bg-slate-200 rounded" />
            </div>
            <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="p-3 bg-slate-100 rounded-lg">
                        <div className="flex justify-between mb-2">
                            <div className="h-4 w-24 bg-slate-200 rounded" />
                            <div className="h-4 w-16 bg-slate-200 rounded" />
                        </div>
                        <div className="h-3 w-32 bg-slate-200 rounded" />
                    </div>
                ))}
            </div>
        </div>
    );
}

interface ScorecardSkeletonProps {
    className?: string;
}

export function ScorecardSkeleton({ className }: ScorecardSkeletonProps) {
    return (
        <div className={cn('space-y-6', className)}>
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-pulse">
                <div>
                    <div className="h-8 w-64 bg-slate-200 rounded mb-2" />
                    <div className="h-4 w-48 bg-slate-200 rounded" />
                </div>
                <div className="flex gap-2">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-10 w-20 bg-slate-200 rounded-lg" />
                    ))}
                </div>
            </div>

            {/* KPI Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <KPICardSkeleton key={i} />
                ))}
            </div>

            {/* Ranking Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <RankingCardSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}
