// Scorecard Debug Endpoint
// GET /api/scorecard/debug?days=7
// Returns diagnostic information about the scorecard data pipeline

import { NextRequest, NextResponse } from 'next/server';
import {
    isServiceTitanConfigured,
    fetchTechnicianPerformance,
    getCachedRankings,
    getCachedTechnicianPeriod,
    getFullDateRange,
    VALID_PERIODS,
    ValidPeriod,
    EXCLUDED_TECHNICIANS,
} from '@/lib/servicetitan';

export const dynamic = 'force-dynamic';

interface DiagnosticResult {
    timestamp: string;
    configuration: {
        serviceTitanConfigured: boolean;
        credentials: {
            hasClientId: boolean;
            hasClientSecret: boolean;
            hasTenantId: boolean;
            hasAppKey: boolean;
        };
        supabaseConfigured: boolean;
    };
    dateRanges: {
        days: number;
        current: { start: string; end: string };
        previous: { start: string; end: string };
    };
    cache: {
        rankingsExists: boolean;
        currentPeriodExists: boolean;
        previousPeriodExists: boolean;
    };
    rawData: {
        fetchAttempted: boolean;
        fetchSuccess: boolean;
        fetchError?: string;
        rowCount: number;
        fieldNames: string[];
        sampleRow: Record<string, any> | null;
        hasTechnicianField: boolean;
        technicianFieldVariants: string[];
    };
    processing: {
        rowsWithTechnicianField: number;
        rowsAfterExclusion: number;
        excludedTechnicians: string[];
        foundTechnicianNames: string[];
    };
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const daysParam = searchParams.get('days') || '7';
    const days = parseInt(daysParam, 10) as ValidPeriod;

    // Validate days parameter
    if (!VALID_PERIODS.includes(days)) {
        return NextResponse.json(
            { error: 'Invalid days parameter', validValues: VALID_PERIODS },
            { status: 400 }
        );
    }

    const result: DiagnosticResult = {
        timestamp: new Date().toISOString(),
        configuration: {
            serviceTitanConfigured: isServiceTitanConfigured(),
            credentials: {
                hasClientId: !!process.env.SERVICETITAN_CLIENT_ID?.trim(),
                hasClientSecret: !!process.env.SERVICETITAN_CLIENT_SECRET?.trim(),
                hasTenantId: !!process.env.SERVICETITAN_TENANT_ID?.trim(),
                hasAppKey: !!process.env.SERVICETITAN_APP_KEY?.trim(),
            },
            supabaseConfigured: !!(
                process.env.NEXT_PUBLIC_SUPABASE_URL &&
                process.env.SUPABASE_SERVICE_ROLE_KEY
            ),
        },
        dateRanges: {
            days,
            current: { start: '', end: '' },
            previous: { start: '', end: '' },
        },
        cache: {
            rankingsExists: false,
            currentPeriodExists: false,
            previousPeriodExists: false,
        },
        rawData: {
            fetchAttempted: false,
            fetchSuccess: false,
            rowCount: 0,
            fieldNames: [],
            sampleRow: null,
            hasTechnicianField: false,
            technicianFieldVariants: [],
        },
        processing: {
            rowsWithTechnicianField: 0,
            rowsAfterExclusion: 0,
            excludedTechnicians: EXCLUDED_TECHNICIANS,
            foundTechnicianNames: [],
        },
    };

    try {
        // Get date ranges
        const dateRange = getFullDateRange(days);
        result.dateRanges.current = {
            start: dateRange.startDate,
            end: dateRange.endDate,
        };
        result.dateRanges.previous = {
            start: dateRange.previousStartDate,
            end: dateRange.previousEndDate,
        };

        // Check cache state
        const [cachedRankings, cachedCurrentPeriod, cachedPreviousPeriod] = await Promise.all([
            getCachedRankings(days),
            getCachedTechnicianPeriod(days, false),
            getCachedTechnicianPeriod(days, true),
        ]);

        result.cache.rankingsExists = !!cachedRankings;
        result.cache.currentPeriodExists = !!cachedCurrentPeriod;
        result.cache.previousPeriodExists = !!cachedPreviousPeriod;

        // Try to fetch fresh data if ServiceTitan is configured
        if (result.configuration.serviceTitanConfigured) {
            result.rawData.fetchAttempted = true;

            try {
                const rawData = await fetchTechnicianPerformance(
                    dateRange.startDate,
                    dateRange.endDate
                );

                result.rawData.fetchSuccess = true;
                result.rawData.rowCount = rawData?.length || 0;

                if (rawData && rawData.length > 0) {
                    const sampleRow = rawData[0];
                    result.rawData.fieldNames = Object.keys(sampleRow);

                    // Sanitize sample row (remove potentially sensitive data)
                    const sanitizedSample: Record<string, any> = {};
                    for (const [key, value] of Object.entries(sampleRow)) {
                        if (typeof value === 'string' && value.length > 100) {
                            sanitizedSample[key] = `[string, ${value.length} chars]`;
                        } else {
                            sanitizedSample[key] = value;
                        }
                    }
                    result.rawData.sampleRow = sanitizedSample;

                    // Check for technician field variants
                    const technicianVariants = ['Technician', 'technician', 'TechnicianName', 'tech_name', 'Tech', 'tech'];
                    result.rawData.technicianFieldVariants = technicianVariants.filter(
                        variant => result.rawData.fieldNames.some(
                            field => field.toLowerCase() === variant.toLowerCase()
                        )
                    );
                    result.rawData.hasTechnicianField = result.rawData.technicianFieldVariants.length > 0;

                    // Find actual technician field
                    const technicianField = result.rawData.fieldNames.find(
                        f => f.toLowerCase() === 'technician'
                    );

                    // Process data to count what would be filtered
                    if (technicianField) {
                        const rowsWithTech = rawData.filter(row => row[technicianField]);
                        result.processing.rowsWithTechnicianField = rowsWithTech.length;

                        // Collect unique technician names
                        const techNames = new Set<string>();
                        rowsWithTech.forEach(row => {
                            if (row[technicianField]) {
                                techNames.add(row[technicianField]);
                            }
                        });
                        result.processing.foundTechnicianNames = Array.from(techNames);

                        // Count after exclusion
                        const afterExclusion = rowsWithTech.filter(row => {
                            const name = row[technicianField];
                            return !EXCLUDED_TECHNICIANS.some(
                                excluded => name.toLowerCase().includes(excluded.toLowerCase())
                            );
                        });
                        result.processing.rowsAfterExclusion = afterExclusion.length;
                    }
                }
            } catch (fetchError) {
                result.rawData.fetchSuccess = false;
                result.rawData.fetchError = fetchError instanceof Error
                    ? fetchError.message
                    : 'Unknown fetch error';
            }
        }

        return NextResponse.json({
            success: true,
            diagnostic: result,
        });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                diagnostic: result,
            },
            { status: 500 }
        );
    }
}
