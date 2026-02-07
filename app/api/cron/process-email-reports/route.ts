// Email Reports Cron Job
// GET /api/cron/process-email-reports
// Runs daily at 6am CT (noon UTC) to fetch emailed ServiceTitan reports,
// parse xlsx attachments, and store processed scorecard data.
// Protected by CRON_SECRET header.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { fetchReportEmails, isEmailReportConfigured } from '@/lib/email-reports';
import { parseReportAttachment } from '@/lib/email-reports';
import { calculateRankingsFromData, type ValidPeriod, VALID_PERIODS } from '@/lib/scorecard';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const maxDuration = 300; // 5 minutes max for cron job

interface ProcessResult {
    filename: string;
    period: number | null;
    rows: number;
    success: boolean;
    error?: string;
}

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

export async function GET(request: NextRequest) {
    // Verify cron secret
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

    // Check if email report ingestion is configured
    if (!isEmailReportConfigured()) {
        return NextResponse.json({
            success: true,
            message: 'Email report ingestion not configured, skipping. Set REPORT_EMAIL_HOST, REPORT_EMAIL_USER, and REPORT_EMAIL_PASSWORD.',
            timestamp: new Date().toISOString(),
        });
    }

    const results: ProcessResult[] = [];
    const startTime = Date.now();

    try {
        const supabase = getSupabaseAdmin();

        // Step 1: Fetch report emails via IMAP
        console.log('Fetching report emails...');
        const attachments = await fetchReportEmails(true);

        if (attachments.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No new report emails found',
                timestamp: new Date().toISOString(),
            });
        }

        console.log(`Processing ${attachments.length} report attachment(s)...`);

        // Step 2: Parse each attachment and determine its period
        const reportsByPeriod = new Map<ValidPeriod, any[]>();

        for (const attachment of attachments) {
            try {
                const report = parseReportAttachment(
                    attachment.content,
                    attachment.filename,
                    attachment.subject
                );

                if (!report) {
                    results.push({
                        filename: attachment.filename,
                        period: null,
                        rows: 0,
                        success: false,
                        error: 'Failed to parse report or determine period',
                    });
                    continue;
                }

                // Store the parsed rows for this period
                reportsByPeriod.set(report.period, report.rows);

                results.push({
                    filename: attachment.filename,
                    period: report.period,
                    rows: report.rows.length,
                    success: true,
                });
            } catch (parseError) {
                results.push({
                    filename: attachment.filename,
                    period: null,
                    rows: 0,
                    success: false,
                    error: parseError instanceof Error ? parseError.message : 'Unknown parse error',
                });
            }
        }

        // Step 3: For each period, calculate rankings and store in database
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

                // Calculate rankings from the parsed data
                const rankings = calculateRankingsFromData(rows, previousRows, period);

                // Store in scorecard_data table
                const { error: upsertError } = await supabase
                    .from('scorecard_data')
                    .upsert(
                        {
                            period,
                            report_date: today,
                            data: {
                                rankings,
                                rawRows: rows, // Store raw rows for future trend comparison
                            },
                            source_filename: reportsByPeriod.get(period)
                                ? results.find(r => r.period === period && r.success)?.filename
                                : null,
                        },
                        {
                            onConflict: 'period,report_date',
                        }
                    );

                if (upsertError) {
                    console.error(`Failed to store rankings for ${period}-day period:`, upsertError);
                } else {
                    console.log(`Stored ${period}-day rankings for ${today}`);
                }
            } catch (rankingsError) {
                console.error(`Failed to calculate/store rankings for ${period}-day period:`, rankingsError);
            }
        }

        const duration = Date.now() - startTime;
        const successCount = results.filter(r => r.success).length;
        const failedCount = results.filter(r => !r.success).length;

        return NextResponse.json({
            success: true,
            results,
            summary: {
                attachmentsFound: attachments.length,
                periodsProcessed: reportsByPeriod.size,
                successful: successCount,
                failed: failedCount,
            },
            duration: `${Math.round(duration / 1000)}s`,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Email report processing error:', error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Unknown error',
                results,
                success: false,
            },
            { status: 500 }
        );
    }
}
