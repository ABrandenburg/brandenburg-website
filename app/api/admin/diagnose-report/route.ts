// Diagnostic endpoint to inspect raw ServiceTitan report data
// DELETE THIS FILE after debugging is complete

import { NextResponse } from 'next/server';
import { serviceTitanFetch } from '@/lib/servicetitan/client';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET() {
    try {
        const results: Record<string, any> = {};

        // Step 1: List all report categories
        console.log('Step 1: Listing report categories...');
        try {
            const categories = await serviceTitanFetch<any[]>(
                `/reporting/v2/tenant/{tenantId}/report-categories`,
                { method: 'GET' }
            );
            results.categories = categories;
            console.log('Categories:', JSON.stringify(categories));
        } catch (e: any) {
            results.categoriesError = e.message;
            console.error('Failed to list categories:', e.message);
        }

        // Step 2: Try to find report 3594 by trying different category IDs
        // Common ServiceTitan category slugs
        const categoryAttempts = [
            'technician',
            'technician-dashboard',
            'custom',
            'operations',
            'Technician',
        ];

        results.reportSearch = {};

        for (const cat of categoryAttempts) {
            try {
                console.log(`Step 2: Trying category '${cat}' to list reports...`);
                const reports = await serviceTitanFetch<any>(
                    `/reporting/v2/tenant/{tenantId}/report-category/${cat}/reports`,
                    { method: 'GET', maxRetries: 1, retryDelayMs: 2000 }
                );
                results.reportSearch[cat] = {
                    success: true,
                    reports: reports,
                };
                console.log(`Category '${cat}' reports:`, JSON.stringify(reports));
            } catch (e: any) {
                results.reportSearch[cat] = {
                    success: false,
                    error: e.message,
                };
            }
        }

        // Step 3: Try fetching report 3594 data with the category that worked
        // First figure out which category has report 3594
        let workingCategory: string | null = null;
        for (const [cat, result] of Object.entries(results.reportSearch as Record<string, any>)) {
            if (result.success) {
                const reports = Array.isArray(result.reports) ? result.reports : result.reports?.data || [];
                const found = reports.find((r: any) => r.id === 3594 || r.id === '3594');
                if (found) {
                    workingCategory = cat;
                    results.foundReport = { category: cat, report: found };
                    break;
                }
            }
        }

        // Step 4: Fetch actual report data
        if (workingCategory) {
            console.log(`Step 4: Fetching report 3594 data from category '${workingCategory}'...`);
            try {
                const endDate = new Date().toISOString().split('T')[0];
                const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

                const reportData = await serviceTitanFetch<any>(
                    `/reporting/v2/tenant/{tenantId}/report-category/${workingCategory}/reports/3594/data`,
                    {
                        method: 'POST',
                        body: JSON.stringify({
                            parameters: [
                                { name: 'From', value: startDate },
                                { name: 'To', value: endDate },
                            ],
                        }),
                    }
                );

                // Return first 3 rows of data for inspection
                const rawData = reportData.data || reportData;
                results.reportData = {
                    category: workingCategory,
                    totalRows: Array.isArray(rawData) ? rawData.length : 'not array',
                    fields: reportData.fields || null,
                    sampleRows: Array.isArray(rawData) ? rawData.slice(0, 3) : rawData,
                    dateRange: { startDate, endDate },
                };
                console.log('Report data fields:', JSON.stringify(reportData.fields));
                console.log('Report data sample:', JSON.stringify(rawData?.slice?.(0, 2)));
            } catch (e: any) {
                results.reportDataError = e.message;
            }
        } else {
            // Try fetching anyway with 'technician' category
            console.log('Step 4: No matching category found, trying technician anyway...');
            try {
                const endDate = new Date().toISOString().split('T')[0];
                const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

                const reportData = await serviceTitanFetch<any>(
                    `/reporting/v2/tenant/{tenantId}/report-category/technician/reports/3594/data`,
                    {
                        method: 'POST',
                        body: JSON.stringify({
                            parameters: [
                                { name: 'From', value: startDate },
                                { name: 'To', value: endDate },
                            ],
                        }),
                    }
                );

                const rawData = reportData.data || reportData;
                results.reportData = {
                    category: 'technician',
                    totalRows: Array.isArray(rawData) ? rawData.length : 'not array',
                    fields: reportData.fields || null,
                    sampleRows: Array.isArray(rawData) ? rawData.slice(0, 3) : rawData,
                    dateRange: { startDate, endDate },
                };
            } catch (e: any) {
                results.reportDataError = e.message;
            }
        }

        return NextResponse.json(results, { status: 200 });
    } catch (error: any) {
        console.error('Diagnose error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
