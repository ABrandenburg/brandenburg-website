'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle, Calendar, User, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CancelledJobsSummary, CancelledJob } from '@/lib/servicetitan/types';

interface CancelledJobsListProps {
    data: CancelledJobsSummary;
    className?: string;
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function CancelledJobsList({ data, className }: CancelledJobsListProps) {
    const sortedReasons = Object.entries(data.byReason).sort(([, a], [, b]) => b - a).slice(0, 5);

    return (
        <Card className={cn('bg-white', className)}>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                        <XCircle className="w-5 h-5 text-red-500" />
                        Cancelled Jobs
                    </CardTitle>
                    <span className={cn('px-3 py-1 text-lg font-bold rounded-lg', data.total === 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
                        {data.total}
                    </span>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {data.total === 0 ? (
                    <div className="text-center py-8">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                            <XCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <p className="text-sm text-slate-600">No cancelled jobs this period</p>
                    </div>
                ) : (
                    <>
                        {sortedReasons.length > 0 && (
                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-slate-700">Top Cancellation Reasons</h4>
                                {sortedReasons.map(([reason, count]) => (
                                    <div key={reason} className="flex items-center justify-between">
                                        <span className="text-sm text-slate-600 truncate max-w-[200px]">{reason}</span>
                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-medium rounded">{count}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        {data.jobs.length > 0 && (
                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-slate-700">Recent Cancellations</h4>
                                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                    {data.jobs.slice(0, 5).map((job) => (
                                        <JobCard key={job.id} job={job} />
                                    ))}
                                </div>
                                {data.jobs.length > 5 && <p className="text-xs text-slate-500 text-center pt-2">+{data.jobs.length - 5} more</p>}
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}

function JobCard({ job }: { job: CancelledJob }) {
    return (
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-900">{job.number || `Job #${job.id}`}</span>
                </div>
                {job.jobType && <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-xs rounded">{job.jobType}</span>}
            </div>
            <div className="space-y-1 text-xs text-slate-500">
                <div className="flex items-center gap-2"><User className="w-3 h-3" /><span>{job.customerName}</span></div>
                {job.scheduledDate && <div className="flex items-center gap-2"><Calendar className="w-3 h-3" /><span>Scheduled: {formatDate(job.scheduledDate)}</span></div>}
            </div>
            {job.cancelReason && <div className="mt-2 pt-2 border-t border-slate-200"><p className="text-xs text-red-600">Reason: {job.cancelReason}</p></div>}
        </div>
    );
}
