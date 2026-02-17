import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MessageSquare, Send, TrendingUp } from 'lucide-react';

export const revalidate = 0;

const ALLOWED_EMAILS = [
    'adam@brandenburgplumbing.com',
    'lucas@brandenburgplumbing.com',
    'michael@brandenburgplumbing.com',
];

export default async function ReviewsDashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email || !ALLOWED_EMAILS.includes(user.email.toLowerCase())) {
        redirect('/admin/login');
    }

    // Fetch technician performance data from materialized view
    const { data: techPerformance, error: perfError } = await supabase
        .from('tech_performance_card')
        .select('*')
        .order('avg_rating', { ascending: false, nullsFirst: false });

    // Calculate summary metrics
    const totalJobs = techPerformance?.reduce((sum, tech) => sum + (tech.total_jobs || 0), 0) || 0;
    const totalRevenue = techPerformance?.reduce((sum, tech) => sum + parseFloat(tech.total_revenue || 0), 0) || 0;
    const totalRequests = techPerformance?.reduce((sum, tech) => sum + (tech.review_requests_sent || 0), 0) || 0;
    const totalReviews = techPerformance?.reduce((sum, tech) => sum + (tech.reviews_received || 0), 0) || 0;
    const avgRequestRate = totalJobs > 0 ? (totalRequests / totalJobs * 100) : 0;
    const reviewConversionRate = totalRequests > 0 ? (totalReviews / totalRequests * 100) : 0;

    // Sort by revenue for bar chart
    const techByRevenue = [...(techPerformance || [])].sort(
        (a, b) => parseFloat(b.total_revenue || 0) - parseFloat(a.total_revenue || 0)
    );
    const maxRevenue = techByRevenue[0] ? parseFloat(techByRevenue[0].total_revenue || 1) : 1;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                    Reviews & Reputation
                </h1>
                <p className="text-slate-500 mt-1">
                    Technician performance and review request tracking (Last 30 Days)
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Review Requests</CardTitle>
                        <Send className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalRequests}</div>
                        <p className="text-xs text-slate-500">{avgRequestRate.toFixed(1)}% request rate</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Reviews Received</CardTitle>
                        <Star className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalReviews}</div>
                        <p className="text-xs text-slate-500">{reviewConversionRate.toFixed(1)}% conversion</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
                        <TrendingUp className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalJobs}</div>
                        <p className="text-xs text-slate-500">Completed jobs</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <MessageSquare className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${totalRevenue.toLocaleString('en-US', {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                            })}
                        </div>
                        <p className="text-xs text-slate-500">Last 30 days</p>
                    </CardContent>
                </Card>
            </div>

            {/* Technician Leaderboard */}
            <Card>
                <CardHeader>
                    <CardTitle>Technician Leaderboard</CardTitle>
                    <CardDescription>Sorted by average rating (descending)</CardDescription>
                </CardHeader>
                <CardContent>
                    {perfError ? (
                        <p className="text-red-600">Error loading performance data: {perfError.message}</p>
                    ) : techPerformance && techPerformance.length > 0 ? (
                        <div className="space-y-6">
                            {/* Revenue Bar Chart */}
                            <div>
                                <h3 className="text-sm font-semibold mb-4">Revenue by Technician</h3>
                                <div className="space-y-3">
                                    {techByRevenue.map((tech) => {
                                        const revenue = parseFloat(tech.total_revenue || 0);
                                        const percentage = (revenue / maxRevenue) * 100;

                                        return (
                                            <div key={tech.technician_id} className="flex items-center gap-3">
                                                <div className="w-32 text-sm font-medium truncate">
                                                    {tech.technician_name}
                                                </div>
                                                <div className="flex-1 bg-slate-100 rounded-full h-6 relative overflow-hidden">
                                                    <div
                                                        className="bg-blue-500 h-full rounded-full transition-all duration-500"
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                    <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                                                        ${revenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Performance Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-200">
                                            <th className="text-left py-3 px-3">Rank</th>
                                            <th className="text-left py-3 px-3">Technician</th>
                                            <th className="text-right py-3 px-3">Jobs</th>
                                            <th className="text-right py-3 px-3">Revenue</th>
                                            <th className="text-right py-3 px-3">Requests</th>
                                            <th className="text-right py-3 px-3">Request Rate</th>
                                            <th className="text-right py-3 px-3">Avg Rating</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {techPerformance.map((tech, index) => {
                                            const rating = parseFloat(tech.avg_rating || 0);
                                            const isLowRating = rating > 0 && rating < 4.0;

                                            return (
                                                <tr
                                                    key={tech.technician_id}
                                                    className="border-b border-slate-100 hover:bg-slate-50"
                                                >
                                                    <td className="py-3 px-3 text-slate-500">{index + 1}</td>
                                                    <td className="py-3 px-3 font-medium">{tech.technician_name}</td>
                                                    <td className="py-3 px-3 text-right">{tech.total_jobs || 0}</td>
                                                    <td className="py-3 px-3 text-right font-medium">
                                                        ${parseFloat(tech.total_revenue || 0).toLocaleString('en-US', {
                                                            maximumFractionDigits: 0,
                                                        })}
                                                    </td>
                                                    <td className="py-3 px-3 text-right">
                                                        {tech.review_requests_sent || 0}
                                                    </td>
                                                    <td className="py-3 px-3 text-right">
                                                        {tech.request_rate_percent
                                                            ? `${parseFloat(tech.request_rate_percent).toFixed(1)}%`
                                                            : '-'}
                                                    </td>
                                                    <td className="py-3 px-3 text-right">
                                                        {rating > 0 ? (
                                                            <Badge
                                                                variant={isLowRating ? 'destructive' : 'default'}
                                                                className="font-mono"
                                                            >
                                                                <Star className="w-3 h-3 mr-1 inline" />
                                                                {rating.toFixed(2)}
                                                            </Badge>
                                                        ) : (
                                                            <span className="text-slate-400">-</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <p className="text-slate-500">
                            No performance data available. Refresh analytics or wait for jobs to sync.
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
