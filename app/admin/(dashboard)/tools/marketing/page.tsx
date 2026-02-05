import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, DollarSign, Briefcase } from 'lucide-react';

export const revalidate = 0;

const ALLOWED_EMAILS = [
    'adam@brandenburgplumbing.com',
    'lucas@brandenburgplumbing.com',
    'michael@brandenburgplumbing.com',
];

export default async function MarketingDashboardPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email || !ALLOWED_EMAILS.includes(user.email.toLowerCase())) {
        redirect('/admin/login');
    }

    // Fetch ad spend data (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const { data: adSpend, error: adSpendError } = await supabase
        .from('raw_ad_spend')
        .select('*')
        .gte('date', thirtyDaysAgo)
        .order('date', { ascending: false });

    // Fetch jobs data (last 30 days)
    const thirtyDaysAgoTimestamp = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data: jobs, error: jobsError } = await supabase
        .from('raw_servicetitan_jobs')
        .select('*')
        .eq('status', 'Completed')
        .gte('completed_date', thirtyDaysAgoTimestamp)
        .order('completed_date', { ascending: false });

    // Calculate summary metrics
    const totalSpend = adSpend?.reduce((sum, row) => sum + parseFloat(row.spend || 0), 0) || 0;
    const totalRevenue = jobs?.reduce((sum, row) => sum + parseFloat(row.total_amount || 0), 0) || 0;
    const totalJobs = jobs?.length || 0;
    const roas = totalSpend > 0 ? (totalRevenue / totalSpend) : 0;
    const avgJobValue = totalJobs > 0 ? (totalRevenue / totalJobs) : 0;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                    Marketing Dashboard
                </h1>
                <p className="text-slate-500 mt-1">
                    Track ad spend, job performance, and marketing ROI (Last 30 Days)
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Ad Spend</CardTitle>
                        <DollarSign className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${totalSpend.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <p className="text-xs text-slate-500">Last 30 days</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <TrendingUp className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <p className="text-xs text-slate-500">{totalJobs} completed jobs</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">ROAS</CardTitle>
                        <Briefcase className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{roas.toFixed(2)}x</div>
                        <p className="text-xs text-slate-500">Return on Ad Spend</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Job Value</CardTitle>
                        <DollarSign className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${avgJobValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <p className="text-xs text-slate-500">Per completed job</p>
                    </CardContent>
                </Card>
            </div>

            {/* Ad Spend Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Ad Spend by Platform</CardTitle>
                    <CardDescription>Recent advertising expenses</CardDescription>
                </CardHeader>
                <CardContent>
                    {adSpendError ? (
                        <p className="text-red-600">Error loading ad spend data: {adSpendError.message}</p>
                    ) : adSpend && adSpend.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200">
                                        <th className="text-left py-2 px-3">Date</th>
                                        <th className="text-left py-2 px-3">Platform</th>
                                        <th className="text-right py-2 px-3">Spend</th>
                                        <th className="text-right py-2 px-3">Impressions</th>
                                        <th className="text-right py-2 px-3">Clicks</th>
                                        <th className="text-right py-2 px-3">Conversions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {adSpend.map((row) => (
                                        <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50">
                                            <td className="py-2 px-3">{row.date}</td>
                                            <td className="py-2 px-3 capitalize">{row.platform}</td>
                                            <td className="py-2 px-3 text-right font-medium">
                                                ${parseFloat(row.spend).toFixed(2)}
                                            </td>
                                            <td className="py-2 px-3 text-right">
                                                {row.impressions?.toLocaleString() || '-'}
                                            </td>
                                            <td className="py-2 px-3 text-right">
                                                {row.clicks?.toLocaleString() || '-'}
                                            </td>
                                            <td className="py-2 px-3 text-right">
                                                {row.conversions?.toLocaleString() || '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-slate-500">
                            No ad spend data available. Ad spend data will be synced via third-party tools like
                            Portable or Airbyte.
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Jobs Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Completed Jobs</CardTitle>
                    <CardDescription>ServiceTitan job data (last 30 days)</CardDescription>
                </CardHeader>
                <CardContent>
                    {jobsError ? (
                        <p className="text-red-600">Error loading jobs data: {jobsError.message}</p>
                    ) : jobs && jobs.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200">
                                        <th className="text-left py-2 px-3">Job #</th>
                                        <th className="text-left py-2 px-3">Customer</th>
                                        <th className="text-left py-2 px-3">Technician</th>
                                        <th className="text-left py-2 px-3">Job Type</th>
                                        <th className="text-right py-2 px-3">Amount</th>
                                        <th className="text-left py-2 px-3">Completed</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {jobs.slice(0, 50).map((job) => (
                                        <tr key={job.id} className="border-b border-slate-100 hover:bg-slate-50">
                                            <td className="py-2 px-3 font-mono text-xs">{job.job_number}</td>
                                            <td className="py-2 px-3">{job.customer_name}</td>
                                            <td className="py-2 px-3">{job.technician_name}</td>
                                            <td className="py-2 px-3 text-xs">{job.job_type}</td>
                                            <td className="py-2 px-3 text-right font-medium">
                                                ${parseFloat(job.total_amount || 0).toLocaleString('en-US', {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })}
                                            </td>
                                            <td className="py-2 px-3 text-xs text-slate-500">
                                                {job.completed_date
                                                    ? new Date(job.completed_date).toLocaleDateString()
                                                    : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-slate-500">
                            No jobs data available. Jobs will be synced hourly via the review requests cron job.
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
