// Manual Report Import Endpoint
// POST /api/admin/import-reports
// Imports scorecard reports from the local scorecard-reports/ directory
// or processes uploaded xlsx files.
// Protected by CRON_SECRET header (same auth as cron jobs).

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { parseReportAttachment } from '@/lib/email-reports';
import { calculateRankingsFromData, type ValidPeriod } from '@/lib/scorecard';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const maxDuration = 60;

function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceRoleKey) {
        throw new Error('Supabase credentials not configured');
    }

    return createClient(url, serviceRoleKey, {
        auth: { persistSession: false },
        global: {
            fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }),
        },
    });
}

export async function POST(request: NextRequest) {
    // Verify auth
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
        return NextResponse.json(
            { error: 'CRON_SECRET not configured' },
            { status: 500 }
        );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    try {
        const supabase = getSupabaseAdmin();
        const reportsDir = join(process.cwd(), 'scorecard-reports');

        if (!existsSync(reportsDir)) {
            return NextResponse.json(
                { error: 'scorecard-reports/ directory not found' },
                { status: 404 }
            );
        }

        const files = readdirSync(reportsDir).filter(f => f.endsWith('.xlsx'));
        if (files.length === 0) {
            return NextResponse.json(
                { error: 'No .xlsx files found in scorecard-reports/' },
                { status: 404 }
            );
        }

        console.log(`Found ${files.length} xlsx files to import:`, files);

        const results: { filename: string; period: number | null; rows: number; success: boolean; error?: string }[] = [];
        const reportsByPeriod = new Map<ValidPeriod, any[]>();

        // Parse each file
        for (const file of files) {
            try {
                const filePath = join(reportsDir, file);
                const buffer = readFileSync(filePath);

                const report = parseReportAttachment(buffer, file);
                if (!report) {
                    results.push({ filename: file, period: null, rows: 0, success: false, error: 'Failed to parse or detect period' });
                    continue;
                }

                reportsByPeriod.set(report.period, report.rows);
                results.push({ filename: file, period: report.period, rows: report.rows.length, success: true });
            } catch (err) {
                results.push({
                    filename: file,
                    period: null,
                    rows: 0,
                    success: false,
                    error: err instanceof Error ? err.message : 'Unknown error',
                });
            }
        }

        // Store rankings for each period
        const today = new Date().toISOString().split('T')[0];

        for (const [period, rows] of Array.from(reportsByPeriod.entries())) {
            try {
                // Look up previous report data for trend comparison
                const { data: previousReport } = await supabase
                    .from('scorecard_data')
                    .select('data')
                    .eq('period', period)
                    .lt('report_date', today)
                    .order('report_date', { ascending: false })
                    .limit(1)
                    .single();

                const previousRows = previousReport?.data?.rawRows || null;

                const rankings = calculateRankingsFromData(rows, previousRows, period);

                const { error: upsertError } = await supabase
                    .from('scorecard_data')
                    .upsert(
                        {
                            period,
                            report_date: today,
                            data: {
                                rankings,
                                rawRows: rows,
                            },
                            source_filename: results.find(r => r.period === period && r.success)?.filename || null,
                        },
                        { onConflict: 'period,report_date' }
                    );

                if (upsertError) {
                    console.error(`Failed to store ${period}-day rankings:`, upsertError);
                    const result = results.find(r => r.period === period);
                    if (result) result.error = upsertError.message;
                } else {
                    console.log(`Stored ${period}-day rankings for ${today}`);
                }
            } catch (err) {
                console.error(`Failed to process ${period}-day rankings:`, err);
            }
        }

        return NextResponse.json({
            success: true,
            results,
            summary: {
                filesFound: files.length,
                periodsProcessed: reportsByPeriod.size,
                successful: results.filter(r => r.success).length,
                failed: results.filter(r => !r.success).length,
            },
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Import error:', error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Unknown error',
                success: false,
            },
            { status: 500 }
        );
    }
}
