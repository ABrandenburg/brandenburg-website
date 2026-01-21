'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
    Header,
    GrossMarginCard,
    CancelledJobsList,
    GrossMarginSkeleton,
    CancelledJobsSkeleton,
} from '@/components/scorecard';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import type { GrossMarginData, CancelledJobsSummary, ValidPeriod } from '@/lib/servicetitan/types';

export default function GrossMarginPage() {
    const searchParams = useSearchParams();
    const days = (parseInt(searchParams.get('days') || '7', 10) as ValidPeriod) || 7;

    const [grossMargin, setGrossMargin] = useState<GrossMarginData | null>(null);
    const [cancelledJobs, setCancelledJobs] = useState<CancelledJobsSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            setError(null);

            try {
                const [gmResponse, cjResponse] = await Promise.all([
                    fetch(`/api/scorecard/gross-margin?days=${days}`),
                    fetch(`/api/scorecard/cancelled-jobs?days=${days}`),
                ]);

                const [gmResult, cjResult] = await Promise.all([
                    gmResponse.json(),
                    cjResponse.json(),
                ]);

                if (!gmResult.success) {
                    throw new Error(gmResult.error || 'Failed to fetch gross margin data');
                }

                if (!cjResult.success) {
                    throw new Error(cjResult.error || 'Failed to fetch cancelled jobs data');
                }

                setGrossMargin(gmResult.data);
                setCancelledJobs(cjResult.data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [days]);

    if (error) {
        return (
            <div className="space-y-6">
                <Header
                    title="Gross Margin Dashboard"
                    description="Revenue and cost analysis"
                />
                <Card className="bg-red-50 border-red-200">
                    <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                            <AlertCircle className="w-6 h-6 text-red-600 shrink-0" />
                            <div>
                                <h3 className="font-semibold text-red-800">Error Loading Data</h3>
                                <p className="text-red-700 mt-1">{error}</p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                                >
                                    Retry
                                </button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Header
                title="Gross Margin Dashboard"
                description={`Financial analysis for the last ${days} days`}
                actions={
                    <Link
                        href={`/admin/tools/scorecard?days=${days}`}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Scorecard
                    </Link>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {loading ? (
                    <>
                        <GrossMarginSkeleton />
                        <CancelledJobsSkeleton />
                    </>
                ) : (
                    <>
                        {grossMargin && <GrossMarginCard data={grossMargin} />}
                        {cancelledJobs && <CancelledJobsList data={cancelledJobs} />}
                    </>
                )}
            </div>
        </div>
    );
}
