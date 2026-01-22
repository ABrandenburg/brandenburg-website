// Rankings calculation and KPI processing logic

import {
    TechnicianKPIs,
    RankedTechnician,
    RankedKPIs,
    LeadsSummary,
    OverallStats,
    ValidPeriod,
    EXCLUDED_TECHNICIANS,
} from './types';
import {
    fetchTechnicianPerformance,
    isServiceTitanConfigured,
} from './client';
import {
    getCachedTechnicianPeriod,
    setCachedTechnicianPeriod,
    getCachedRankings,
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
 * Format percentage value
 */
export function formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
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
 * Check if data uses numeric indices (ServiceTitan sometimes returns array-like objects)
 */
function hasNumericIndices(row: any): boolean {
    const keys = Object.keys(row);
    return keys.length > 0 && keys.every(k => /^\d+$/.test(k));
}

/**
 * Map numeric indices to field names based on ServiceTitan report structure
 * Index mapping for Technician Performance Report (3017):
 *   0: Department/Team
 *   1: Technician name
 *   2: (unknown)
 *   3: Total Revenue Completed
 *   4: Opportunity Job Average
 *   5: Close Rate (as decimal, e.g., 0.83 = 83%)
 *   6: Opportunities count
 *   7: (unknown rate)
 *   8: Options per Opportunity
 *   9-12: (various metrics)
 *   13: Leads
 *   14: Leads Booked
 *   15: Memberships Sold
 */
const NUMERIC_INDEX_MAP: Record<string, number> = {
    technician: 1,
    totalRevenueCompleted: 3,
    opportunityJobAverage: 4,
    closeRate: 5,
    optionsPerOpportunity: 8,
    leads: 13,
    leadsBooked: 14,
    membershipsSold: 15,
    // These may need adjustment based on actual report columns
    membershipConversionRate: 7,
    hoursSold: 6,
};

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
 */
function getFieldValue(row: any, fieldNames: string[], defaultValue: any = 0): any {
    const field = findField(row, fieldNames);
    return field ? row[field] : defaultValue;
}

/**
 * Get value from a row that might use numeric indices
 */
function getValueFromRow(row: any, numericKey: string, namedFields: string[], defaultValue: any = 0): any {
    // If using numeric indices, use the mapped index
    if (hasNumericIndices(row)) {
        const index = NUMERIC_INDEX_MAP[numericKey];
        if (index !== undefined && row[index.toString()] !== undefined) {
            return row[index.toString()];
        }
        return defaultValue;
    }
    // Otherwise use named field matching
    return getFieldValue(row, namedFields, defaultValue);
}

/**
 * Process raw ServiceTitan data into TechnicianKPIs
 * Uses flexible field matching to handle variations in ServiceTitan API response
 * Supports both named fields and numeric index formats
 */
function processTechnicianData(rawData: any[]): TechnicianKPIs[] {
    if (!rawData || rawData.length === 0) {
        console.log('processTechnicianData: No raw data received');
        return [];
    }

    // Log field names from first row for debugging
    const sampleRow = rawData[0];
    const fieldNames = Object.keys(sampleRow);
    const isNumericFormat = hasNumericIndices(sampleRow);

    console.log('processTechnicianData: Available fields:', fieldNames);
    console.log('processTechnicianData: Using numeric index format:', isNumericFormat);

    // Determine technician field
    let technicianField: string | null = null;
    if (isNumericFormat) {
        technicianField = NUMERIC_INDEX_MAP.technician.toString();
        console.log(`processTechnicianData: Using numeric index ${technicianField} for technician name`);
    } else {
        technicianField = findField(sampleRow, ['Technician', 'TechnicianName', 'technician', 'Tech']);
    }

    if (!technicianField || sampleRow[technicianField] === undefined) {
        console.error('processTechnicianData: No technician field found. Available fields:', fieldNames);
        console.error('processTechnicianData: Sample row:', JSON.stringify(sampleRow));
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
        .map(row => {
            const techName = row[technicianField!];

            // Get close rate and convert from decimal to percentage if needed
            let closeRate = parseFloat(getValueFromRow(row, 'closeRate', ['CloseRate', 'Close Rate', 'OpportunityCloseRate', 'Opportunity Close Rate'])) || 0;
            // If close rate is less than 1, it's likely a decimal (0.83 = 83%)
            if (closeRate > 0 && closeRate <= 1) {
                closeRate = closeRate * 100;
            }

            // Get membership conversion rate and convert from decimal if needed
            let membershipConversionRate = parseFloat(getValueFromRow(row, 'membershipConversionRate', ['MembershipConversionRate', 'Membership Conversion Rate'])) || 0;
            if (membershipConversionRate > 0 && membershipConversionRate <= 1) {
                membershipConversionRate = membershipConversionRate * 100;
            }

            return {
                id: slugify(techName),
                name: techName,
                opportunityJobAverage: parseFloat(getValueFromRow(row, 'opportunityJobAverage', ['OpportunityJobAverage', 'Opportunity Job Average'])) || 0,
                totalRevenueCompleted: parseFloat(getValueFromRow(row, 'totalRevenueCompleted', ['TotalRevenueCompleted', 'Total Revenue Completed', 'Revenue', 'TotalRevenue'])) || 0,
                optionsPerOpportunity: parseFloat(getValueFromRow(row, 'optionsPerOpportunity', ['OptionsPerOpportunity', 'Options Per Opportunity'])) || 0,
                closeRate,
                membershipsSold: parseInt(getValueFromRow(row, 'membershipsSold', ['MembershipsSold', 'Memberships Sold'])) || 0,
                membershipConversionRate,
                leads: parseInt(getValueFromRow(row, 'leads', ['Leads', 'TotalLeads', 'Total Leads'])) || 0,
                leadsBooked: parseInt(getValueFromRow(row, 'leadsBooked', ['LeadsBooked', 'Leads Booked'])) || 0,
                hoursSold: parseFloat(getValueFromRow(row, 'hoursSold', ['SoldHours', 'Sold Hours', 'HoursSold', 'Hours Sold', 'BillableHours'])) || 0,
            };
        });

    console.log(`processTechnicianData: Processed ${processed.length} technicians from ${rawData.length} rows`);
    if (processed.length > 0) {
        console.log('processTechnicianData: Sample processed tech:', JSON.stringify(processed[0]));
    }
    return processed;
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
    const totalLeads = technicians.reduce((sum, t) => sum + t.leads, 0);
    const bookedLeads = technicians.reduce((sum, t) => sum + t.leadsBooked, 0);
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

/**
 * Fetch and calculate all rankings
 */
export async function calculateRankings(days: ValidPeriod): Promise<RankedKPIs> {
    // Try cached rankings first
    const cached = await getCachedRankings(days);
    if (cached) {
        return cached;
    }

    // Try to build from cached period data
    const rankings = await calculateRankingsFromCache(days);
    if (rankings) {
        await setCachedRankings(days, rankings);
        return rankings;
    }

    // Fetch fresh data
    return fetchAndCalculateRankings(days);
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
 */
async function fetchAndCalculateRankings(days: ValidPeriod): Promise<RankedKPIs> {
    if (!isServiceTitanConfigured()) {
        // Return mock data if ServiceTitan is not configured
        return getMockRankings(days);
    }

    const dateRange = getFullDateRange(days);

    // Fetch current period
    const currentData = await executeWithLock(
        'technician-performance',
        '3017',
        () => fetchTechnicianPerformance(dateRange.startDate, dateRange.endDate)
    );
    await setCachedTechnicianPeriod(days, currentData, false);

    // Fetch previous period
    const previousData = await executeWithLock(
        'technician-performance',
        '3017',
        () => fetchTechnicianPerformance(dateRange.previousStartDate, dateRange.previousEndDate)
    );
    await setCachedTechnicianPeriod(days, previousData, true);

    const technicians = processTechnicianData(currentData);
    const previousTechnicians = processTechnicianData(previousData);

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

