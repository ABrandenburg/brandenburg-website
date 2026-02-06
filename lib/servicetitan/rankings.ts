// Rankings calculation and KPI processing logic

import {
    TechnicianKPIs,
    RankedTechnician,
    RankedKPIs,
    LeadsSummary,
    OverallStats,
    ValidPeriod,
    EXCLUDED_TECHNICIANS,
    MERGED_TECHNICIANS,
} from './types';
import {
    fetchTechnicianPerformance,
    isServiceTitanConfigured,
    delay,
} from './client';
import {
    getCachedTechnicianPeriod,
    setCachedTechnicianPeriod,
    getCachedRankings,
    getCachedRankingsWithStale,
    setCachedRankings,
} from './cache';
import { getFullDateRange } from './date-utils';
import { executeWithLock } from './api-queue';

/**
 * Slugify a name for use as ID
 */
function slugify(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

/**
 * Check if a technician should be excluded from rankings
 */
function shouldExclude(name: string): boolean {
    return EXCLUDED_TECHNICIANS.some(
        excluded => name.toLowerCase().includes(excluded.toLowerCase())
    );
}

/**
 * Format currency value
 */
export function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

/**
 * Format percentage value (rounded to whole number)
 */
export function formatPercentage(value: number): string {
    return `${Math.round(value)}%`;
}

/**
 * Format decimal value
 */
export function formatDecimal(value: number): string {
    return value.toFixed(2);
}

/**
 * Format whole number
 */
export function formatNumber(value: number): string {
    return Math.round(value).toLocaleString();
}

/**
 * Calculate percentage change between periods
 */
function calculateTrend(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
}

/**
 * Find a field in a row using case-insensitive matching
 * Returns the actual field name if found, null otherwise
 */
function findField(row: any, fieldNames: string[]): string | null {
    const keys = Object.keys(row);
    for (const fieldName of fieldNames) {
        // Try exact match first
        if (row[fieldName] !== undefined) return fieldName;
        // Try case-insensitive match
        const match = keys.find(k => k.toLowerCase() === fieldName.toLowerCase());
        if (match) return match;
    }
    return null;
}

/**
 * Get a value from a row using flexible field matching
 * Tries multiple possible field names (case-insensitive) and returns the first match
 */
function getFieldValue(row: any, fieldNames: string[], defaultValue: any = 0): any {
    const field = findField(row, fieldNames);
    return field !== null ? row[field] : defaultValue;
}

/**
 * Process raw ServiceTitan data into TechnicianKPIs
 * 
 * Report 3594 (Technician Performance Board) fields from API:
 *   Name, TechnicianBusinessUnit, CompletedRevenue, CompletedJobs,
 *   Opportunity, CompletedNonOpportunities, OpportunityConversionRate,
 *   OpportunityJobAverage, ReplacementLeadConversionRate, JobsOnHold,
 *   WipJobs, TotalSales, ItemBillableHours, BillableEfficiency
 */
function processTechnicianData(rawData: any[]): TechnicianKPIs[] {
    if (!rawData || rawData.length === 0) {
        console.log('processTechnicianData: No raw data received');
        return [];
    }

    const sampleRow = rawData[0];
    const fieldNames = Object.keys(sampleRow);
    console.log('processTechnicianData: Available fields:', fieldNames);
    console.log('processTechnicianData: Sample row:', JSON.stringify(sampleRow));

    // Find technician name field
    const technicianField = findField(sampleRow, [
        'Name', 'Technician', 'TechnicianName', 'technician', 'Tech'
    ]);

    if (!technicianField || sampleRow[technicianField] === undefined) {
        console.error('processTechnicianData: No technician name field found. Available fields:', fieldNames);
        return [];
    }

    console.log(`processTechnicianData: Using technician field: "${technicianField}"`);

    const processed = rawData
        .filter(row => {
            const techName = row[technicianField!];
            if (!techName || typeof techName !== 'string') return false;
            if (shouldExclude(techName)) return false;
            return true;
        })
        .map((row, index) => {
            const techName = row[technicianField!];

            // Completed Revenue - invoiced amount from completed jobs
            const totalRevenueCompleted = parseFloat(getFieldValue(row, [
                'CompletedRevenue', 'Completed Revenue', 'TotalRevenueCompleted', 'Revenue'
            ])) || 0;

            // Total Sales - sum of sold estimate subtotals (different from revenue!)
            const totalSales = parseFloat(getFieldValue(row, [
                'TotalSales', 'Total Sales', 'TotalSold', 'Sold'
            ])) || 0;

            // Opportunity Job Average
            const opportunityJobAverage = parseFloat(getFieldValue(row, [
                'OpportunityJobAverage', 'Opportunity Job Average', 'OppJobAvg'
            ])) || 0;

            // Opportunity count (sales count)
            const opportunitiesCount = parseInt(getFieldValue(row, [
                'Opportunity', 'Opportunities', 'OpportunityCount'
            ])) || 0;

            // Completed Jobs
            const completedJobs = parseInt(getFieldValue(row, [
                'CompletedJobs', 'Completed Jobs', 'Jobs'
            ])) || 0;

            // Opportunity Conversion Rate (comes as decimal, e.g. 0.83 = 83%)
            let closeRate = parseFloat(getFieldValue(row, [
                'OpportunityConversionRate', 'Opportunity Conversion Rate',
                'CloseRate', 'Close Rate', 'ConversionRate'
            ])) || 0;
            if (closeRate > 0 && closeRate <= 1) {
                closeRate = closeRate * 100;
            }

            // Item Billable Hours
            const itemBillableHours = parseFloat(getFieldValue(row, [
                'ItemBillableHours', 'Item Billable Hours', 'BillableHours', 'Billable Hours'
            ])) || 0;

            // Replacement Lead Conversion Rate
            let replacementRate = parseFloat(getFieldValue(row, [
                'ReplacementLeadConversionRate', 'Replacement Lead Conversion Rate'
            ])) || 0;
            if (replacementRate > 0 && replacementRate <= 1) {
                replacementRate = replacementRate * 100;
            }

            // Log first technician's data to verify field mapping
            if (index === 0) {
                console.log('processTechnicianData: First tech values:', {
                    name: techName,
                    totalRevenueCompleted,
                    totalSales,
                    opportunityJobAverage,
                    opportunitiesCount,
                    completedJobs,
                    itemBillableHours,
                    closeRate,
                });
            }

            return {
                id: slugify(techName),
                name: techName,
                opportunityJobAverage,
                totalRevenueCompleted,
                optionsPerOpportunity: 0, // Not in report 3594
                closeRate,
                membershipsSold: 0, // Not in report 3594
                membershipConversionRate: 0, // Not in report 3594
                leads: 0, // Not in report 3594
                leadsBooked: 0, // Not in report 3594
                hoursSold: itemBillableHours,
                sales: opportunitiesCount,
                totalSales,
            };
        });

    console.log(`processTechnicianData: Processed ${processed.length} technicians from ${rawData.length} rows`);
    if (processed.length > 0) {
        console.log('processTechnicianData: First tech:', JSON.stringify(processed[0]));
    }

    // Merge archived technician profiles into their canonical profiles
    const merged = mergeTechnicianProfiles(processed);
    console.log(`processTechnicianData: After merging: ${merged.length} technicians`);

    return merged;
}

/**
 * Merge archived technician profiles into their canonical profiles
 * Combines KPIs by summing numeric values
 * Also merges duplicate entries with the same name (case-insensitive)
 */
function mergeTechnicianProfiles(technicians: TechnicianKPIs[]): TechnicianKPIs[] {
    // Build a map of alternate names to canonical names (lowercase -> canonical)
    const aliasToCanonical = new Map<string, string>();
    for (const [canonical, aliases] of Object.entries(MERGED_TECHNICIANS)) {
        // Add the canonical name itself (lowercase) -> canonical
        aliasToCanonical.set(canonical.toLowerCase(), canonical);
        // Add all aliases
        for (const alias of aliases) {
            aliasToCanonical.set(alias.toLowerCase(), canonical);
        }
    }

    // Group technicians by canonical name (case-insensitive)
    // Key is lowercase name, value is { canonicalName, techs }
    const grouped = new Map<string, { canonicalName: string; techs: TechnicianKPIs[] }>();

    for (const tech of technicians) {
        const lowerName = tech.name.toLowerCase();
        // Check if this name maps to a canonical name, otherwise use original
        const canonicalName = aliasToCanonical.get(lowerName) || tech.name;
        const groupKey = canonicalName.toLowerCase();

        if (!grouped.has(groupKey)) {
            grouped.set(groupKey, { canonicalName, techs: [] });
        }
        grouped.get(groupKey)!.techs.push(tech);
    }

    // Merge grouped technicians
    const result: TechnicianKPIs[] = [];

    grouped.forEach(({ canonicalName, techs }) => {
        if (techs.length === 1) {
            // No merging needed, but use canonical name if this was an alias
            const tech = techs[0];
            if (tech.name !== canonicalName) {
                result.push({
                    ...tech,
                    id: slugify(canonicalName),
                    name: canonicalName,
                });
            } else {
                result.push(tech);
            }
        } else {
            // Merge multiple profiles by summing their KPIs
            console.log(`Merging ${techs.length} profiles for ${canonicalName}:`, techs.map(t => t.name));

            const merged: TechnicianKPIs = {
                id: slugify(canonicalName),
                name: canonicalName,
                opportunityJobAverage: 0,
                totalRevenueCompleted: 0,
                optionsPerOpportunity: 0,
                closeRate: 0,
                membershipsSold: 0,
                membershipConversionRate: 0,
                leads: 0,
                leadsBooked: 0,
                hoursSold: 0,
                sales: 0,
                totalSales: 0,
            };

            // Sum all values
            for (const tech of techs) {
                merged.totalRevenueCompleted += tech.totalRevenueCompleted;
                merged.membershipsSold += tech.membershipsSold;
                merged.leads += tech.leads;
                merged.leadsBooked += tech.leadsBooked;
                merged.hoursSold += tech.hoursSold;
                merged.sales += tech.sales;
                merged.totalSales += tech.totalSales;
            }

            // For rates and averages, use weighted average based on revenue
            const totalRevenue = techs.reduce((sum, t) => sum + t.totalRevenueCompleted, 0);
            if (totalRevenue > 0) {
                for (const tech of techs) {
                    const weight = tech.totalRevenueCompleted / totalRevenue;
                    merged.opportunityJobAverage += tech.opportunityJobAverage * weight;
                    merged.optionsPerOpportunity += tech.optionsPerOpportunity * weight;
                    merged.closeRate += tech.closeRate * weight;
                    merged.membershipConversionRate += tech.membershipConversionRate * weight;
                }
            }

            result.push(merged);
        }
    });

    return result;
}

/**
 * Rank technicians by a specific metric
 */
function rankBy(
    technicians: TechnicianKPIs[],
    previousTechnicians: TechnicianKPIs[] | null,
    metric: keyof TechnicianKPIs,
    formatValue: (value: number) => string,
    ascending: boolean = false
): RankedTechnician[] {
    // Sort by metric
    const sorted = [...technicians].sort((a, b) => {
        const aVal = a[metric] as number;
        const bVal = b[metric] as number;
        return ascending ? aVal - bVal : bVal - aVal;
    });

    // Create previous rankings map
    const previousRankings = new Map<string, { rank: number; value: number }>();
    if (previousTechnicians) {
        const previousSorted = [...previousTechnicians].sort((a, b) => {
            const aVal = a[metric] as number;
            const bVal = b[metric] as number;
            return ascending ? aVal - bVal : bVal - aVal;
        });
        previousSorted.forEach((tech, index) => {
            previousRankings.set(tech.id, {
                rank: index + 1,
                value: tech[metric] as number,
            });
        });
    }

    return sorted.map((tech, index) => {
        const currentValue = tech[metric] as number;
        const previous = previousRankings.get(tech.id);
        const previousValue = previous?.value ?? 0;

        return {
            id: tech.id,
            name: tech.name,
            value: currentValue,
            formattedValue: formatValue(currentValue),
            trend: previous ? calculateTrend(currentValue, previousValue) : 0,
            rank: index + 1,
            previousValue,
            previousRank: previous?.rank,
        };
    });
}

/**
 * Calculate overall stats from technician data
 */
function calculateOverallStats(
    technicians: TechnicianKPIs[],
    previousTechnicians: TechnicianKPIs[] | null
): OverallStats {
    const sum = (arr: TechnicianKPIs[], key: keyof TechnicianKPIs) =>
        arr.reduce((total, t) => total + (t[key] as number), 0);

    const avg = (arr: TechnicianKPIs[], key: keyof TechnicianKPIs) =>
        arr.length > 0 ? sum(arr, key) / arr.length : 0;

    return {
        opportunityJobAverage: avg(technicians, 'opportunityJobAverage'),
        opportunityCloseRate: avg(technicians, 'closeRate'),
        totalCloseRate: avg(technicians, 'closeRate'),
        optionsPerOpportunity: avg(technicians, 'optionsPerOpportunity'),
        totalRevenue: sum(technicians, 'totalRevenueCompleted'),
        cancelledJobs: 0, // Will be fetched separately
        previousOpportunityJobAverage: previousTechnicians ? avg(previousTechnicians, 'opportunityJobAverage') : undefined,
        previousOpportunityCloseRate: previousTechnicians ? avg(previousTechnicians, 'closeRate') : undefined,
        previousTotalCloseRate: previousTechnicians ? avg(previousTechnicians, 'closeRate') : undefined,
        previousOptionsPerOpportunity: previousTechnicians ? avg(previousTechnicians, 'optionsPerOpportunity') : undefined,
        previousTotalRevenue: previousTechnicians ? sum(previousTechnicians, 'totalRevenueCompleted') : undefined,
    };
}

/**
 * Calculate leads summary
 */
function calculateLeadsSummary(
    technicians: TechnicianKPIs[],
    previousTechnicians: TechnicianKPIs[] | null
): LeadsSummary {
    const totalLeads = technicians?.reduce((sum, t) => sum + t.leads, 0) ?? 0;
    const bookedLeads = technicians?.reduce((sum, t) => sum + t.leadsBooked, 0) ?? 0;
    const bookingRate = totalLeads > 0 ? (bookedLeads / totalLeads) * 100 : 0;

    const previousTotalLeads = previousTechnicians?.reduce((sum, t) => sum + t.leads, 0);
    const previousBookedLeads = previousTechnicians?.reduce((sum, t) => sum + t.leadsBooked, 0);
    const previousBookingRate = previousTotalLeads && previousTotalLeads > 0
        ? ((previousBookedLeads || 0) / previousTotalLeads) * 100
        : undefined;

    return {
        totalLeads,
        bookedLeads,
        bookingRate,
        previousTotalLeads,
        previousBookedLeads,
        previousBookingRate,
    };
}

// In-flight request deduplication to prevent thundering herd
const inFlightRequests = new Map<string, Promise<RankedKPIs>>();

/**
 * Fetch and calculate all rankings with stale-while-revalidate support
 */
export async function calculateRankings(days: ValidPeriod): Promise<RankedKPIs> {
    // Check for stale-while-revalidate
    const { data: cachedData, isStale } = await getCachedRankingsWithStale(days);

    if (cachedData && !isStale) {
        // Fresh cache hit - return immediately
        return cachedData;
    }

    // Check for in-flight request to deduplicate
    const requestKey = `rankings:${days}`;
    const existingRequest = inFlightRequests.get(requestKey);

    if (existingRequest) {
        // Another request is already fetching this data
        if (cachedData && isStale) {
            // Return stale data while another request refreshes
            return cachedData;
        }
        // Wait for the existing request
        return existingRequest;
    }

    // If we have stale data, return it immediately and refresh in background
    if (cachedData && isStale) {
        // Trigger background refresh (don't await)
        refreshRankingsInBackground(days);
        return cachedData;
    }

    // No cached data - need to fetch synchronously
    return fetchRankingsWithDeduplication(days);
}

/**
 * Refresh rankings in background (fire and forget)
 */
function refreshRankingsInBackground(days: ValidPeriod): void {
    const requestKey = `rankings:${days}`;

    // Check if already refreshing
    if (inFlightRequests.has(requestKey)) return;

    // Start background refresh
    const refreshPromise = fetchAndCalculateRankings(days)
        .finally(() => {
            inFlightRequests.delete(requestKey);
        });

    inFlightRequests.set(requestKey, refreshPromise);

    // Fire and forget - don't await
    refreshPromise.catch(err => {
        console.error(`Background refresh failed for ${days}-day rankings:`, err);
    });
}

/**
 * Fetch rankings with request deduplication
 */
async function fetchRankingsWithDeduplication(days: ValidPeriod): Promise<RankedKPIs> {
    const requestKey = `rankings:${days}`;

    // Try to build from cached period data first
    const rankings = await calculateRankingsFromCache(days);
    if (rankings) {
        await setCachedRankings(days, rankings);
        return rankings;
    }

    // Create new fetch request
    const fetchPromise = fetchAndCalculateRankings(days)
        .finally(() => {
            inFlightRequests.delete(requestKey);
        });

    inFlightRequests.set(requestKey, fetchPromise);
    return fetchPromise;
}

/**
 * Build rankings from cached period data
 */
async function calculateRankingsFromCache(days: ValidPeriod): Promise<RankedKPIs | null> {
    const currentData = await getCachedTechnicianPeriod(days, false);
    const previousData = await getCachedTechnicianPeriod(days, true);

    if (!currentData) return null;

    const technicians = processTechnicianData(currentData);
    const previousTechnicians = previousData ? processTechnicianData(previousData) : null;

    return buildRankings(technicians, previousTechnicians, days);
}

/**
 * Fetch fresh data and calculate rankings
 * 
 * Report 3594 (Technician Performance Board) already includes all metrics we need:
 * CompletedRevenue, TotalSales, ItemBillableHours, OpportunityJobAverage, etc.
 * No need for separate Report 239 calls - this reduces API calls and avoids rate limiting.
 */
async function fetchAndCalculateRankings(days: ValidPeriod): Promise<RankedKPIs> {
    if (!isServiceTitanConfigured()) {
        return getMockRankings(days);
    }

    const dateRange = getFullDateRange(days);

    // Fetch current period technician performance from Report 3594
    console.log(`Fetching rankings for ${days}-day period: ${dateRange.startDate} to ${dateRange.endDate}`);
    const currentData = await executeWithLock(
        'technician-performance',
        '3594',
        () => fetchTechnicianPerformance(dateRange.startDate, dateRange.endDate)
    );
    await setCachedTechnicianPeriod(days, currentData, false);

    // Fetch previous period for trend comparison
    // Add a small delay to avoid rate limiting between consecutive API calls
    await delay(2000);
    
    let previousData: any[] | null = null;
    try {
        previousData = await executeWithLock(
            'technician-performance',
            '3594-prev',
            () => fetchTechnicianPerformance(dateRange.previousStartDate, dateRange.previousEndDate)
        );
        await setCachedTechnicianPeriod(days, previousData, true);
    } catch (err) {
        console.warn(`Failed to fetch previous period data for ${days}-day rankings, trends will be unavailable:`, err);
    }

    // Process technician data - Report 3594 includes all metrics
    const technicians = processTechnicianData(currentData);
    const previousTechnicians = previousData ? processTechnicianData(previousData) : null;

    const rankings = buildRankings(technicians, previousTechnicians, days);
    await setCachedRankings(days, rankings);

    return rankings;
}

/**
 * Build rankings object from processed data
 */
function buildRankings(
    technicians: TechnicianKPIs[],
    previousTechnicians: TechnicianKPIs[] | null,
    days: ValidPeriod
): RankedKPIs {
    const dateRange = getFullDateRange(days);

    return {
        opportunityJobAverage: rankBy(technicians, previousTechnicians, 'opportunityJobAverage', formatCurrency),
        totalRevenueCompleted: rankBy(technicians, previousTechnicians, 'totalRevenueCompleted', formatCurrency),
        optionsPerOpportunity: rankBy(technicians, previousTechnicians, 'optionsPerOpportunity', formatDecimal),
        closeRate: rankBy(technicians, previousTechnicians, 'closeRate', formatPercentage),
        membershipsSold: rankBy(technicians, previousTechnicians, 'membershipsSold', formatNumber),
        membershipConversionRate: rankBy(technicians, previousTechnicians, 'membershipConversionRate', formatPercentage),
        hoursSold: rankBy(technicians, previousTechnicians, 'hoursSold', formatDecimal),
        leads: rankBy(technicians, previousTechnicians, 'leads', formatNumber),
        leadsBooked: rankBy(technicians, previousTechnicians, 'leadsBooked', formatNumber),
        sales: rankBy(technicians, previousTechnicians, 'sales', formatNumber),
        totalSales: rankBy(technicians, previousTechnicians, 'totalSales', formatCurrency),
        leadsSummary: calculateLeadsSummary(technicians, previousTechnicians),
        overallStats: calculateOverallStats(technicians, previousTechnicians),
        dateRange: {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
            previousStartDate: dateRange.previousStartDate,
            previousEndDate: dateRange.previousEndDate,
        },
        hasPreviousPeriodData: !!previousTechnicians && previousTechnicians.length > 0,
    };
}

// Mock data for development without ServiceTitan credentials

function getMockRankings(days: ValidPeriod): RankedKPIs {
    const mockTechnicians = [
        { id: 'john-smith', name: 'John Smith' },
        { id: 'jane-doe', name: 'Jane Doe' },
        { id: 'mike-johnson', name: 'Mike Johnson' },
        { id: 'sarah-williams', name: 'Sarah Williams' },
        { id: 'david-brown', name: 'David Brown' },
    ];

    const generateRankings = (formatFn: (v: number) => string, baseValue: number, variance: number): RankedTechnician[] => {
        return mockTechnicians.map((tech, i) => {
            const value = baseValue - (i * variance) + Math.random() * variance * 0.5;
            const previousValue = value * (0.9 + Math.random() * 0.2);
            return {
                id: tech.id,
                name: tech.name,
                value,
                formattedValue: formatFn(value),
                trend: calculateTrend(value, previousValue),
                rank: i + 1,
                previousValue,
                previousRank: i + 1,
            };
        });
    };

    const dateRange = getFullDateRange(days);

    return {
        opportunityJobAverage: generateRankings(formatCurrency, 2500, 300),
        totalRevenueCompleted: generateRankings(formatCurrency, 85000, 15000),
        optionsPerOpportunity: generateRankings(formatDecimal, 3.5, 0.5),
        closeRate: generateRankings(formatPercentage, 75, 10),
        membershipsSold: generateRankings(formatNumber, 25, 5),
        membershipConversionRate: generateRankings(formatPercentage, 45, 8),
        hoursSold: generateRankings(formatDecimal, 120, 20),
        leads: generateRankings(formatNumber, 50, 10),
        leadsBooked: generateRankings(formatNumber, 40, 8),
        sales: generateRankings(formatNumber, 15, 3),
        totalSales: generateRankings(formatCurrency, 37500, 6000), // ~$2500 avg * 15 sales
        leadsSummary: {
            totalLeads: 180,
            bookedLeads: 145,
            bookingRate: 80.5,
            previousTotalLeads: 165,
            previousBookedLeads: 130,
            previousBookingRate: 78.8,
        },
        overallStats: {
            opportunityJobAverage: 2100,
            opportunityCloseRate: 68,
            totalCloseRate: 72,
            optionsPerOpportunity: 2.8,
            totalRevenue: 425000,
            cancelledJobs: 12,
            previousOpportunityJobAverage: 1950,
            previousOpportunityCloseRate: 65,
            previousTotalCloseRate: 70,
            previousOptionsPerOpportunity: 2.6,
            previousTotalRevenue: 390000,
            previousCancelledJobs: 15,
        },
        dateRange: {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
            previousStartDate: dateRange.previousStartDate,
            previousEndDate: dateRange.previousEndDate,
        },
        hasPreviousPeriodData: true,
    };
}

