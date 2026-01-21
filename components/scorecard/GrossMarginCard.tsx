'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, Wrench, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GrossMarginData } from '@/lib/servicetitan/types';

interface GrossMarginCardProps {
    data: GrossMarginData;
    className?: string;
}

export function GrossMarginCard({ data, className }: GrossMarginCardProps) {
    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);

    const costBreakdown = [
        { label: 'Labor', value: data.laborCost, percent: data.laborPercent, icon: Users, color: 'bg-blue-500' },
        { label: 'Materials', value: data.materialCost, percent: data.materialPercent, icon: Package, color: 'bg-amber-500' },
        { label: 'Equipment', value: data.equipmentCost, percent: data.equipmentPercent, icon: Wrench, color: 'bg-slate-500' },
    ];

    return (
        <Card className={cn('bg-white border-slate-200', className)}>
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-brand-blue" />
                    Gross Margin Analysis
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Revenue & Margin Summary */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-100">
                        <div className="text-xs font-medium text-green-600 uppercase tracking-wide mb-1">
                            Total Revenue
                        </div>
                        <div className="text-2xl font-bold text-green-700">
                            {formatCurrency(data.totalRevenue)}
                        </div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border border-red-100">
                        <div className="text-xs font-medium text-red-600 uppercase tracking-wide mb-1">
                            Total Costs
                        </div>
                        <div className="text-2xl font-bold text-red-700">
                            {formatCurrency(data.totalCost)}
                        </div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-brand-blue/5 to-brand-blue/15 rounded-xl border border-brand-blue/20">
                        <div className="text-xs font-medium text-brand-blue uppercase tracking-wide mb-1">
                            Gross Margin
                        </div>
                        <div className="text-2xl font-bold text-brand-blue">
                            {data.grossMarginPercent.toFixed(1)}%
                        </div>
                    </div>
                </div>

                {/* Cost Breakdown */}
                <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                        Cost Breakdown
                    </h4>
                    {costBreakdown.map(({ label, value, percent, icon: Icon, color }) => (
                        <div key={label} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={cn('p-1.5 rounded-lg', color.replace('bg-', 'bg-opacity-15 bg-'))}>
                                        <Icon className="w-4 h-4 text-slate-600" />
                                    </div>
                                    <span className="text-sm font-medium text-slate-700">{label}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm font-bold text-slate-900">
                                        {formatCurrency(value)}
                                    </span>
                                    <span className="text-xs text-slate-500 ml-2">
                                        ({percent.toFixed(1)}%)
                                    </span>
                                </div>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className={cn('h-full rounded-full transition-all duration-500', color)}
                                    style={{ width: `${Math.min(percent, 100)}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Gross Margin Bar */}
                <div className="pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-slate-600">Net Margin</span>
                        <span className="text-lg font-bold text-green-600">
                            {formatCurrency(data.grossMargin)}
                        </span>
                    </div>
                    <div className="relative w-full h-4 bg-slate-100 rounded-full overflow-hidden">
                        {/* Costs portion */}
                        <div
                            className="absolute left-0 top-0 h-full bg-red-400 rounded-l-full"
                            style={{ width: `${100 - data.grossMarginPercent}%` }}
                        />
                        {/* Margin portion */}
                        <div
                            className="absolute right-0 top-0 h-full bg-green-500 rounded-r-full"
                            style={{ width: `${data.grossMarginPercent}%` }}
                        />
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-slate-500">
                        <span>Costs: {(100 - data.grossMarginPercent).toFixed(1)}%</span>
                        <span>Margin: {data.grossMarginPercent.toFixed(1)}%</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
