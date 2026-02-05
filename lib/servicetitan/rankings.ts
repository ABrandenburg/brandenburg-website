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
    fetchSoldHours,
    isServiceTitanConfigured,
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
/**
 * Map numeric indices to field names based on ServiceTitan Technician Performance Report API
 * 
 * NOTE: API has Department/Team at index 0, so all indices are +1 compared to Excel export!
 * 
 * Excel Export:                    API Response:
 *   0: Name                        0: Department/Team
 *   1: Business Unit               1: Technician name
 *   2: Completed Revenue           2: Business Unit
 *   3: Completed Jobs              3: Completed Revenue
 *   4: Opportunity                 4: Completed Jobs
 *   5: Non-opportunities           5: Opportunity count
 *   6: Conversion Rate             6: Non-opportunities
 *   7: Opportunity Job Avg         7: Conversion Rate (decimal)
 *   8: Replacement Rate            8: Opportunity Job Average
 *   9: Jobs on Hold                9: Replacement Rate
 *   10: WIP Jobs                   10: Jobs on Hold
 *   11: Total Sales                11: WIP Jobs
 *   12: Item Billable Hours        12: Total Sales
 *   13: Billable Efficiency        13: Item Billable Hours
 *                                  14: Billable Efficiency
 */
const NUMERIC_INDEX_MAP: Record<string, number> = {
    technician: 1,             // Technician name
    totalRevenueCompleted: 3,  // Completed Revenue - invoiced from completed jobs
    completedJobs: 4,          // Completed Jobs count
    opportunities: 5,          // Count of opportunities
    closeRate: 7,              // Opportunity Conversion Rate (decimal)
    opportunityJobAverage: 8,  // Opportunity Job Average
    totalSold: 12,             // Total Sales - sum of sold estimate subtotals
    hoursSold: 13,             // Item Billable Hours
    // These fields may not be present - will use named field fallback
    optionsPerOpportunity: 9,
    membershipsSold: 16,
    leads: 15,
    leadsBooked: 16,
    membershipConversionRate: 9,
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
    console.log('processTechnicianData: Sample row data:', JSON.stringify(sampleRow));

    // Determine technician field
    let technicianField: string | null = null;
    if (isNumericFormat) {
        technicianField = NUMERIC_INDEX_MAP.technician.toString();
        console.log(`processTechnicianData: Using numeric index ${technicianField} for technician name`);
        // Log all values to help debug column mapping
        console.log('processTechnicianData: Row values by index:');
        for (let i = 0; i <= 15; i++) {
            if (sampleRow[i.toString()] !== undefined) {
                console.log(`  Index ${i}: ${sampleRow[i.toString()]}`);
            }
        }
    } else {
        technicianField = findField(sampleRow, ['Technician', 'TechnicianName', 'technician', 'Tech', 'Name']);
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

            // Get values using flexible field matching (works with both named fields and numeric indices)
            const opportunityJobAverage = parseFloat(getValueFromRow(row, 'opportunityJobAverage', [
                'Opportunity Job Average', 'OpportunityJobAverage', 'Opp Job Avg', 'AvgJobValue'
            ])) || 0;
            
            const opportunitiesCount = parseInt(getValueFromRow(row, 'opportunities', [
                'Opportunity', 'Opportunities', 'Opp', 'OpportunityCount'
            ])) || 0;
            
            // Get "Total Sales" - sum of sold estimate subtotals
            const totalSold = parseFloat(getValueFromRow(row, 'totalSold', [
                'Total Sales', 'TotalSales', 'Sold', 'TotalSold', 'Sales Total'
            ])) || 0;
            
            // Get "Completed Revenue" - invoiced amount from completed jobs
            const totalRevenueCompleted = parseFloat(getValueFromRow(row, 'totalRevenueCompleted', [
                'Completed Revenue', 'CompletedRevenue', 'Revenue', 'Total Revenue', 'TotalRevenue'
            ])) || 0;
            
            // Get "Item Billable Hours"
            const itemBillableHours = parseFloat(getValueFromRow(row, 'hoursSold', [
                'Item Billable Hours', 'ItemBillableHours', 'Billable Hours', 'BillableHours', 'Hours'
            ])) || 0;
            
            // Log first technician's data to verify field mapping
            if (rawData.indexOf(row) === 0) {
                console.log('processTechnicianData: First tech values:', {
                    name: techName,
                    totalRevenueCompleted,
                    totalSold,
                    opportunityJobAverage,
                    opportunitiesCount,
                    itemBillableHours,
                    closeRate
                });
            }
            
            return {
                id: slugify(techName),
                name: techName,
                opportunityJobAverage,
                totalRevenueCompleted,
                optionsPerOpportunity: parseFloat(getValueFromRow(row, 'optionsPerOpportunity', ['OptionsPerOpportunity', 'Options Per Opportunity'])) || 0,
                closeRate,
                membershipsSold: parseInt(getValueFromRow(row, 'membershipsSold', ['MembershipsSold', 'Memberships Sold'])) || 0,
                membershipConversionRate,
                leads: parseInt(getValueFromRow(row, 'leads', ['Leads', 'TotalLeads', 'Total Leads'])) || 0,
                leadsBooked: parseInt(getValueFromRow(row, 'leadsBooked', ['LeadsBooked', 'Leads Booked'])) || 0,
                hoursSold: itemBillableHours, // Item Billable Hours from index 12
                sales: opportunitiesCount,
                totalSales: totalSold, // Total Sales from index 11 - sum of sold estimate subtotals
            };
        });

    console.log(`processTechnicianData: Processed ${processed.length} technicians from ${rawData.length} rows`);
    if (processed.length > 0) {
        console.log('processTechnicianData: Sample processed tech:', JSON.stringify(processed[0]));
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
 * Process sold hours data and return a map of technician name -> hours sold
 */
function processSoldHoursData(rawData: any[]): Map<string, number> {
    const hoursMap = new Map<string, number>();
    
    if (!rawData || rawData.length === 0) {
        console.log('processSoldHoursData: No raw data received');
        return hoursMap;
    }

    // Log field names from first row for debugging
    const sampleRow = rawData[0];
    const fieldNames = Object.keys(sampleRow);
    const isNumericFormat = hasNumericIndices(sampleRow);
    
    console.log('processSoldHoursData: Available fields:', fieldNames);
    console.log('processSoldHoursData: Using numeric index format:', isNumericFormat);
    console.log('processSoldHoursData: Sample row:', JSON.stringify(sampleRow));

    // Find technician and hours fields
    let techField: string | null = null;
    let hoursField: string | null = null;

    if (isNumericFormat) {
        // For numeric indices, try common positions
        // Typically: 0=Technician, and hours could be in various positions
        techField = '0';
        // Try to find hours field - look for a numeric value that seems like hours
        for (let i = 1; i <= 10; i++) {
            const val = sampleRow[i.toString()];
            if (typeof val === 'number' && val >= 0 && val < 1000) {
                hoursField = i.toString();
                break;
            }
        }
    } else {
        techField = findField(sampleRow, ['Technician', 'TechnicianName', 'technician', 'Tech', 'Employee', 'Name']);
        hoursField = findField(sampleRow, ['SoldHours', 'Sold Hours', 'Hours', 'HoursSold', 'BillableHours', 'Billable Hours', 'TotalHours', 'Total Hours']);
    }

    console.log(`processSoldHoursData: Tech field: ${techField}, Hours field: ${hoursField}`);

    if (!techField) {
        console.error('processSoldHoursData: Could not find technician field');
        return hoursMap;
    }

    for (const row of rawData) {
        const techName = row[techField];
        if (!techName || typeof techName !== 'string') continue;
        if (shouldExclude(techName)) continue;

        const hours = hoursField ? parseFloat(row[hoursField]) || 0 : 0;
        
        // Aggregate hours per technician (in case of multiple rows)
        const existingHours = hoursMap.get(techName.toLowerCase()) || 0;
        hoursMap.set(techName.toLowerCase(), existingHours + hours);
    }

    console.log(`processSoldHoursData: Processed hours for ${hoursMap.size} technicians`);
    return hoursMap;
}

/**
 * Merge sold hours into technician KPIs
 */
function mergeSoldHours(technicians: TechnicianKPIs[], soldHoursMap: Map<string, number>): TechnicianKPIs[] {
    return technicians.map(tech => {
        const hours = soldHoursMap.get(tech.name.toLowerCase()) || 0;
        return {
            ...tech,
            hoursSold: hours,
        };
    });
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

    // Fetch current period technician performance
    const currentData = await executeWithLock(
        'technician-performance',
        '3017',
        () => fetchTechnicianPerformance(dateRange.startDate, dateRange.endDate)
    );
    await setCachedTechnicianPeriod(days, currentData, false);

    // Fetch previous period technician performance
    const previousData = await executeWithLock(
        'technician-performance',
        '3017',
        () => fetchTechnicianPerformance(dateRange.previousStartDate, dateRange.previousEndDate)
    );
    await setCachedTechnicianPeriod(days, previousData, true);

    // Fetch sold hours data from separate report (Report 239)
    let currentSoldHours: any[] = [];
    let previousSoldHours: any[] = [];
    
    try {
        currentSoldHours = await executeWithLock(
            'sold-hours',
            '239',
            () => fetchSoldHours(dateRange.startDate, dateRange.endDate)
        );
        console.log(`Fetched ${currentSoldHours.length} sold hours records for current period`);
    } catch (err) {
        console.warn('Failed to fetch current sold hours:', err);
    }

    try {
        previousSoldHours = await executeWithLock(
            'sold-hours',
            '239',
            () => fetchSoldHours(dateRange.previousStartDate, dateRange.previousEndDate)
        );
        console.log(`Fetched ${previousSoldHours.length} sold hours records for previous period`);
    } catch (err) {
        console.warn('Failed to fetch previous sold hours:', err);
    }

    // Process technician data
    let technicians = processTechnicianData(currentData);
    let previousTechnicians = previousData ? processTechnicianData(previousData) : null;

    // Merge sold hours data if available
    if (currentSoldHours.length > 0) {
        const soldHoursMap = processSoldHoursData(currentSoldHours);
        technicians = mergeSoldHours(technicians, soldHoursMap);
    }

    if (previousSoldHours.length > 0 && previousTechnicians) {
        const prevSoldHoursMap = processSoldHoursData(previousSoldHours);
        previousTechnicians = mergeSoldHours(previousTechnicians, prevSoldHoursMap);
    }

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

