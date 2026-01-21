'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Phone, CalendarCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LeadsSummary as LeadsSummaryType } from '@/lib/servicetitan/types';

interface LeadsSummaryProps {
    data: LeadsSummaryType;
    className?: string;
}

export function LeadsSummary({ data, className }: LeadsSummaryProps) {
    const bookingRateTrend = data.previousBookingRate
        ? Math.round(data.bookingRate - data.previousBookingRate)
        : 0;

    const totalLeadsTrend = data.previousTotalLeads
        ? Math.round(((data.totalLeads - data.previousTotalLeads) / data.previousTotalLeads) * 100)
        : 0;

    return (
        <Card className={cn('bg-white border-slate-200', className)}>
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <Phone className="w-5 h-5 text-brand-blue" />
                    Leads Summary
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                    {/* Total Leads */}
                    <div className="text-center p-4 bg-slate-50 rounded-xl">
                        <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                            Total Leads
                        </div>
                        <div className="text-2xl font-bold text-slate-900">
                            {data.totalLeads.toLocaleString()}
                        </div>
                        {totalLeadsTrend !== 0 && (
                            <TrendIndicator value={totalLeadsTrend} suffix="%" />
                        )}
                    </div>

                    {/* Booked */}
                    <div className="text-center p-4 bg-green-50 rounded-xl">
                        <div className="text-xs font-medium text-green-600 uppercase tracking-wide mb-1">
                            Booked
                        </div>
                        <div className="text-2xl font-bold text-green-700">
                            {data.bookedLeads.toLocaleString()}
                        </div>
                        <div className="flex items-center justify-center gap-1 text-green-600 mt-1">
                            <CalendarCheck className="w-3 h-3" />
                            <span className="text-xs">Converted</span>
                        </div>
                    </div>

                    {/* Booking Rate */}
                    <div className="text-center p-4 bg-brand-blue/5 rounded-xl">
                        <div className="text-xs font-medium text-brand-blue uppercase tracking-wide mb-1">
                            Booking Rate
                        </div>
                        <div className="text-2xl font-bold text-brand-blue">
                            {data.bookingRate.toFixed(1)}%
                        </div>
                        {bookingRateTrend !== 0 && (
                            <TrendIndicator value={bookingRateTrend} suffix=" pts" />
                        )}
                    </div>
                </div>

                {/* Visual Progress Bar */}
                <div className="pt-2">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                        <span>Lead Conversion</span>
                        <span>{data.bookedLeads} of {data.totalLeads} booked</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-500"
                            style={{ width: `${data.bookingRate}%` }}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function TrendIndicator({ value, suffix }: { value: number; suffix: string }) {
    const isPositive = value > 0;

    return (
        <div className={cn(
            'flex items-center justify-center gap-0.5 text-xs font-medium mt-1',
            isPositive ? 'text-green-600' : 'text-red-600'
        )}>
            {isPositive ? (
                <TrendingUp className="w-3 h-3" />
            ) : (
                <TrendingDown className="w-3 h-3" />
            )}
            {isPositive ? '+' : ''}{value}{suffix}
        </div>
    );
}
