'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle, Calendar, User, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CancelledJobsSummary } from '@/lib/servicetitan/types';

interface CancelledJobsListProps {
    data: CancelledJobsSummary;
    className?: string;
}

export function CancelledJobsList({ data, className }: CancelledJobsListProps) {
    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
            });
        } catch {
            return 'N/A';
        }
    };

    return (
        <Card className={cn('bg-white border-slate-200', className)}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                        <XCircle className="w-5 h-5 text-red-500" />
                        Cancelled Jobs
                    </CardTitle>
                    <span className="text-2xl font-bold text-red-600">
                        {data.total}
                    </span>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Reasons Summary */}
                {Object.keys(data.byReason).length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                            By Reason
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                            {Object.entries(data.byReason)
                                .sort(([, a], [, b]) => b - a)
                                .slice(0, 6)
                                .map(([reason, count]) => (
                                    <div
                                        key={reason}
                                        className="flex items-center justify-between p-2 bg-slate-50 rounded-lg"
                                    >
                                        <span className="text-sm text-slate-600 truncate flex-1">
                                            {reason}
                                        </span>
                                        <span className="text-sm font-bold text-slate-800 ml-2">
                                            {count}
                                        </span>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}

                {/* Jobs List */}
                {data.jobs.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                            Recent Cancellations
                        </h4>
                        <div className="space-y-2 max-h-64 overflow-auto">
                            {data.jobs.slice(0, 10).map((job) => (
                                <div
                                    key={job.id}
                                    className="p-3 bg-slate-50 rounded-lg border border-slate-100 hover:bg-slate-100 transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-slate-800">
                                                    #{job.number}
                                                </span>
                                                {job.jobType && (
                                                    <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded">
                                                        {job.jobType}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1 mt-1 text-sm text-slate-600">
                                                <User className="w-3 h-3" />
                                                <span className="truncate">{job.customerName}</span>
                                            </div>
                                        </div>
                                        {job.scheduledDate && (
                                            <div className="flex items-center gap-1 text-xs text-slate-500">
                                                <Calendar className="w-3 h-3" />
                                                {formatDate(job.scheduledDate)}
                                            </div>
                                        )}
                                    </div>
                                    {job.cancelReason && (
                                        <div className="flex items-start gap-1 mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                                            <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                                            <span>{job.cancelReason}</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {data.jobs.length === 0 && (
                    <div className="py-8 text-center text-slate-400 text-sm">
                        No cancelled jobs in this period
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
