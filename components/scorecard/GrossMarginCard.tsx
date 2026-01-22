'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, Users, Wrench, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GrossMarginData } from '@/lib/servicetitan/types';

interface GrossMarginCardProps {
    data: GrossMarginData;
    className?: string;
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

function formatPercent(value: number): string {
    return `${value.toFixed(1)}%`;
}

export function GrossMarginCard({ data, className }: GrossMarginCardProps) {
    const isHealthy = data.grossMarginPercent >= 40;
    const isWarning = data.grossMarginPercent >= 30 && data.grossMarginPercent < 40;

    return (
        <Card className={cn('bg-white', className)}>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-brand-blue" />
                    Gross Margin Analysis
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl text-center">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Revenue</p>
                        <p className="text-xl font-bold text-slate-900 mt-1">{formatCurrency(data.totalRevenue)}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl text-center">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Cost</p>
                        <p className="text-xl font-bold text-slate-900 mt-1">{formatCurrency(data.totalCost)}</p>
                    </div>
                    <div className={cn('p-4 rounded-xl text-center', isHealthy ? 'bg-green-50' : isWarning ? 'bg-yellow-50' : 'bg-red-50')}>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Gross Margin</p>
                        <p className={cn('text-xl font-bold mt-1', isHealthy ? 'text-green-700' : isWarning ? 'text-yellow-700' : 'text-red-700')}>
                            {formatPercent(data.grossMarginPercent)}
                        </p>
                    </div>
                </div>
                <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-slate-700">Cost Breakdown</h4>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2 text-slate-600"><Users className="w-4 h-4" />Labor</span>
                            <span className="font-medium text-slate-900">{formatCurrency(data.laborCost)} ({formatPercent(data.laborPercent)})</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(data.laborPercent, 100)}%` }} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2 text-slate-600"><Package className="w-4 h-4" />Materials</span>
                            <span className="font-medium text-slate-900">{formatCurrency(data.materialCost)} ({formatPercent(data.materialPercent)})</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(data.materialPercent, 100)}%` }} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2 text-slate-600"><Wrench className="w-4 h-4" />Equipment</span>
                            <span className="font-medium text-slate-900">{formatCurrency(data.equipmentCost)} ({formatPercent(data.equipmentPercent)})</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500 rounded-full" style={{ width: `${Math.min(data.equipmentPercent, 100)}%` }} />
                        </div>
                    </div>
                </div>
                <div className={cn('p-4 rounded-lg flex items-center gap-3', isHealthy ? 'bg-green-50' : isWarning ? 'bg-yellow-50' : 'bg-red-50')}>
                    <TrendingUp className={cn('w-5 h-5', isHealthy ? 'text-green-600' : isWarning ? 'text-yellow-600' : 'text-red-600')} />
                    <div>
                        <p className={cn('text-sm font-medium', isHealthy ? 'text-green-700' : isWarning ? 'text-yellow-700' : 'text-red-700')}>
                            {isHealthy ? 'Healthy Margins' : isWarning ? 'Margins Need Attention' : 'Low Margins'}
                        </p>
                        <p className="text-xs text-slate-600 mt-0.5">Net profit: {formatCurrency(data.grossMargin)}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
