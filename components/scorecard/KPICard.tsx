'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    trend?: number;
    trendSuffix?: string;
    icon?: React.ReactNode;
    className?: string;
    valueClassName?: string;
}

export function KPICard({
    title,
    value,
    subtitle,
    trend,
    trendSuffix = '%',
    icon,
    className,
    valueClassName,
}: KPICardProps) {
    const hasTrend = trend !== undefined && trend !== 0;
    const isPositive = trend && trend > 0;

    return (
        <Card className={cn('bg-white border-slate-200', className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">
                    {title}
                </CardTitle>
                {icon && (
                    <div className="text-brand-blue opacity-60">
                        {icon}
                    </div>
                )}
            </CardHeader>
            <CardContent>
                <div className="flex items-end gap-3">
                    <div className={cn('text-2xl font-bold text-slate-900', valueClassName)}>
                        {value}
                    </div>
                    {hasTrend && (
                        <span className={cn(
                            'flex items-center gap-1 text-sm font-medium mb-0.5',
                            isPositive ? 'text-green-600' : 'text-red-600'
                        )}>
                            {isPositive ? (
                                <TrendingUp className="w-4 h-4" />
                            ) : (
                                <TrendingDown className="w-4 h-4" />
                            )}
                            {isPositive ? '+' : ''}{trend}{trendSuffix}
                        </span>
                    )}
                </div>
                {subtitle && (
                    <p className="text-xs text-slate-500 mt-1">
                        {subtitle}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

interface KPIGridProps {
    children: React.ReactNode;
    columns?: 2 | 3 | 4;
}

export function KPIGrid({ children, columns = 4 }: KPIGridProps) {
    return (
        <div className={cn(
            'grid gap-4',
            columns === 2 && 'grid-cols-1 md:grid-cols-2',
            columns === 3 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
            columns === 4 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
        )}>
            {children}
        </div>
    );
}
