// Rankings calculation and KPI processing logic
// Pure data processing -- no API calls or caching

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
import { getFullDateRange } from './date-utils';

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
 * Process raw report data into TechnicianKPIs
 * 
 * Technician Performance Board fields:
 *   Name, TechnicianBusinessUnit, CompletedRevenue, CompletedJobs,
 *   Opportunity, CompletedNonOpportunities, OpportunityConversionRate,
 *   OpportunityJobAverage, ReplacementLeadConversionRate, JobsOnHold,
 *   WipJobs, TotalSales, ItemBillableHours, BillableEfficiency
 */
export function processTechnicianData(rawData: any[]): TechnicianKPIs[] {
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

            // Item Billable Hours / Net Billable Hours
            const itemBillableHours = parseFloat(getFieldValue(row, [
                'Net Billable Hours', 'NetBillableHours',
                'ItemBillableHours', 'Item Billable Hours', 'BillableHours', 'Billable Hours'
            ])) || 0;

            // Replacement Lead Conversion Rate
            let replacementRate = parseFloat(getFieldValue(row, [
                'ReplacementLeadConversionRate', 'Replacement Lead Conversion Rate'
            ])) || 0;
            if (replacementRate > 0 && replacementRate <= 1) {
                replacementRate = replacementRate * 100;
            }

            // Memberships Sold (may be in main report or supplemental)
            const membershipsSold = parseInt(getFieldValue(row, [
                'MembershipsSold', 'Memberships Sold'
            ])) || 0;

            // Options Per Opportunity (may be in main report or supplemental)
            const optionsPerOpportunity = parseFloat(getFieldValue(row, [
                'OptionsPerOpportunity', 'Options Per Opportunity'
            ])) || 0;

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
                    membershipsSold,
                });
            }

            return {
                id: slugify(techName),
                name: techName,
                opportunityJobAverage,
                totalRevenueCompleted,
                optionsPerOpportunity,
                closeRate,
                membershipsSold,
                membershipConversionRate: 0, // May come from supplemental report
                leads: 0, // May come from supplemental report
                leadsBooked: 0, // May come from supplemental report
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
 * Merge duplicate technician profiles into single entries
 * For the same technician appearing multiple times (e.g., archived profiles):
 * - Sums: Revenue, Total Sales, Billable Hours, Memberships Sold, Leads, Sales
 * - Simple averages: Close Rate, Opportunity Job Average, Options Per Opportunity,
 *   Membership Conversion Rate (only counting entries with non-zero values)
 * Also merges duplicate entries with the same name (case-insensitive)
 */
function mergeTechnicianProfiles(technicians: TechnicianKPIs[]): TechnicianKPIs[] {
    // Build a map of alternate names to canonical names (lowercase -> canonical)
    const aliasToCanonical = new Map<string, string>();
    for (const [canonical, aliases] of Object.entries(MERGED_TECHNICIANS)) {
        aliasToCanonical.set(canonical.toLowerCase(), canonical);
        for (const alias of aliases) {
            aliasToCanonical.set(alias.toLowerCase(), canonical);
        }
    }

    // Group technicians by canonical name (case-insensitive)
    const grouped = new Map<string, { canonicalName: string; techs: TechnicianKPIs[] }>();

    for (const tech of technicians) {
        const lowerName = tech.name.toLowerCase();
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
        // Filter out entries where ALL metrics are zero (empty archived profiles)
        const nonEmptyTechs = techs.filter(t =>
            t.totalRevenueCompleted > 0 ||
            t.totalSales > 0 ||
            t.hoursSold > 0 ||
            t.membershipsSold > 0 ||
            t.closeRate > 0
        );

        // If all entries were empty, skip this technician entirely
        if (nonEmptyTechs.length === 0) return;

        if (nonEmptyTechs.length === 1) {
            const tech = nonEmptyTechs[0];
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
            console.log(`Merging ${nonEmptyTechs.length} profiles for ${canonicalName}:`, nonEmptyTechs.map(t => t.name));

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

            // Sum fields: revenue, sales amounts, hours, counts
            for (const tech of nonEmptyTechs) {
                merged.totalRevenueCompleted += tech.totalRevenueCompleted;
                merged.totalSales += tech.totalSales;
                merged.hoursSold += tech.hoursSold;
                merged.membershipsSold += tech.membershipsSold;
                merged.leads += tech.leads;
                merged.leadsBooked += tech.leadsBooked;
                merged.sales += tech.sales;
            }

            // Simple average for rate/average fields (only counting non-zero entries)
            const avgField = (field: keyof TechnicianKPIs) => {
                const nonZero = nonEmptyTechs.filter(t => (t[field] as number) > 0);
                if (nonZero.length === 0) return 0;
                return nonZero.reduce((sum, t) => sum + (t[field] as number), 0) / nonZero.length;
            };

            merged.opportunityJobAverage = avgField('opportunityJobAverage');
            merged.closeRate = avgField('closeRate');
            merged.optionsPerOpportunity = avgField('optionsPerOpportunity');
            merged.membershipConversionRate = avgField('membershipConversionRate');

            console.log(`Merged ${canonicalName}:`, {
                revenue: merged.totalRevenueCompleted,
                totalSales: merged.totalSales,
                hours: merged.hoursSold,
                memberships: merged.membershipsSold,
                closeRate: merged.closeRate,
                oppJobAvg: merged.opportunityJobAverage,
            });

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
    const sorted = [...technicians].sort((a, b) => {
        const aVal = a[metric] as number;
        const bVal = b[metric] as number;
        return ascending ? aVal - bVal : bVal - aVal;
    });

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
        cancelledJobs: 0,
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

/**
 * Process supplemental Field Conversion Report data and merge into technician KPIs
 * Adds: OptionsPerOpportunity, MembershipConversionRate
 */
export function mergeFieldConversionData(technicians: TechnicianKPIs[], reportData: any[]): TechnicianKPIs[] {
    if (!reportData || reportData.length === 0) return technicians;

    const supplementMap = new Map<string, any>();
    for (const row of reportData) {
        const name = getFieldValue(row, ['Name', 'Technician', 'TechnicianName'], null);
        if (name && typeof name === 'string') {
            supplementMap.set(name.toLowerCase(), row);
        }
    }

    console.log(`mergeFieldConversionData: Merging data for ${supplementMap.size} technicians`);

    return technicians.map(tech => {
        const supplement = supplementMap.get(tech.name.toLowerCase());
        if (!supplement) return tech;

        const optionsPerOpportunity = parseFloat(getFieldValue(supplement, [
            'OptionsPerOpportunity', 'Options Per Opportunity'
        ])) || 0;

        let membershipConversionRate = parseFloat(getFieldValue(supplement, [
            'MembershipConversionRate', 'Membership Conversion Rate'
        ])) || 0;
        if (membershipConversionRate > 0 && membershipConversionRate <= 1) {
            membershipConversionRate = membershipConversionRate * 100;
        }

        return {
            ...tech,
            optionsPerOpportunity,
            membershipConversionRate,
        };
    });
}

/**
 * Process supplemental Memberships Report data and merge into technician KPIs
 * Adds: membershipsSold (count)
 */
export function mergeMembershipsData(technicians: TechnicianKPIs[], reportData: any[]): TechnicianKPIs[] {
    if (!reportData || reportData.length === 0) return technicians;

    const supplementMap = new Map<string, any>();
    for (const row of reportData) {
        const name = getFieldValue(row, ['Name', 'Technician'], null);
        if (name && typeof name === 'string') {
            supplementMap.set(name.toLowerCase(), row);
        }
    }

    console.log(`mergeMembershipsData: Merging data for ${supplementMap.size} technicians`);

    return technicians.map(tech => {
        const supplement = supplementMap.get(tech.name.toLowerCase());
        if (!supplement) return tech;

        const membershipsSold = parseInt(getFieldValue(supplement, [
            'MembershipsSold', 'Memberships Sold'
        ])) || 0;

        return {
            ...tech,
            membershipsSold,
        };
    });
}

/**
 * Build rankings object from processed technician data
 * This is the main entry point for building scorecard rankings from any data source
 */
export function buildRankings(
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

/**
 * Calculate rankings from raw report data
 * Main entry point for the email-based pipeline
 */
export function calculateRankingsFromData(
    currentRows: any[],
    previousRows: any[] | null,
    days: ValidPeriod
): RankedKPIs {
    const technicians = processTechnicianData(currentRows);
    const previousTechnicians = previousRows ? processTechnicianData(previousRows) : null;
    return buildRankings(technicians, previousTechnicians, days);
}
