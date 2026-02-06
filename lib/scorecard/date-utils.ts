// Date utilities for scorecard calculations

import { ValidPeriod } from './types';

export interface DateRange {
    startDate: string; // YYYY-MM-DD
    endDate: string;   // YYYY-MM-DD
}

export interface FullDateRange extends DateRange {
    previousStartDate: string;
    previousEndDate: string;
}

/**
 * Format a date as YYYY-MM-DD
 */
export function formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
}

/**
 * Format a date as ISO string for API calls
 */
export function formatDateForAPI(date: Date): string {
    return date.toISOString();
}

/**
 * Get the date range for the last X days (inclusive)
 * "Last 7 days" means today - 6 days to today
 */
export function getDateRange(days: ValidPeriod): DateRange {
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1));
    startDate.setHours(0, 0, 0, 0);

    return {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
    };
}

/**
 * Get the previous period date range for comparison
 * If current period is last 7 days, previous is the 7 days before that
 */
export function getPreviousDateRange(days: ValidPeriod): DateRange {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - days);
    endDate.setHours(23, 59, 59, 999);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days * 2 - 1));
    startDate.setHours(0, 0, 0, 0);

    return {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
    };
}

/**
 * Get both current and previous date ranges
 */
export function getFullDateRange(days: ValidPeriod): FullDateRange {
    const current = getDateRange(days);
    const previous = getPreviousDateRange(days);

    return {
        ...current,
        previousStartDate: previous.startDate,
        previousEndDate: previous.endDate,
    };
}

/**
 * Get date range with offset (for historical data)
 */
export function getDateRangeWithOffset(days: ValidPeriod, offsetDays: number): DateRange {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - offsetDays);
    endDate.setHours(23, 59, 59, 999);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - offsetDays - (days - 1));
    startDate.setHours(0, 0, 0, 0);

    return {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
    };
}

/**
 * Get a human-readable label for the date range
 */
export function getDateRangeLabel(days: ValidPeriod): string {
    switch (days) {
        case 7:
            return 'Last 7 Days';
        case 30:
            return 'Last 30 Days';
        case 90:
            return 'Last 90 Days';
        case 365:
            return 'Last Year';
        default:
            return `Last ${days} Days`;
    }
}

/**
 * Calculate the number of days between two dates
 */
export function daysBetween(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Check if a date string is valid
 */
export function isValidDateString(dateString: string): boolean {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
}
