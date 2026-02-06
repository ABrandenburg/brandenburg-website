// XLSX parser for ServiceTitan report attachments
// Parses xlsx buffers into JSON rows and identifies the report period

import * as XLSX from 'xlsx';
import type { ValidPeriod } from '@/lib/scorecard/types';
import { VALID_PERIODS } from '@/lib/scorecard/types';

export interface ParsedReport {
    period: ValidPeriod;
    rows: Record<string, any>[];
    filename: string;
    dateRange?: {
        startDate: string;
        endDate: string;
    };
}

/**
 * Parse an xlsx buffer into JSON rows
 * Returns the first sheet's data as an array of objects (column headers become keys)
 */
export function parseXlsxBuffer(buffer: Buffer): Record<string, any>[] {
    const workbook = XLSX.read(buffer, { type: 'buffer' });

    // Use the first sheet
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
        console.warn('XLSX file has no sheets');
        return [];
    }

    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, {
        defval: '', // Default value for empty cells
    });

    console.log(`Parsed ${rows.length} rows from sheet "${sheetName}"`);
    if (rows.length > 0) {
        console.log('Column headers:', Object.keys(rows[0]));
    }

    return rows;
}

/**
 * Detect which period (7/30/90/365) a report covers based on filename and date range
 * 
 * ServiceTitan report filenames typically contain date ranges like:
 *   "Technician Performance Board_Dated 01_29_26 - 02_05_26.xlsx"
 * 
 * The function tries to determine the period from:
 * 1. The filename (parses date range and calculates days)
 * 2. The email subject line
 * 3. Falls back to the closest matching standard period
 */
export function detectPeriod(filename: string, subject?: string): ValidPeriod | null {
    // Try to extract date range from filename
    // Pattern: dates like MM_DD_YY - MM_DD_YY or MM/DD/YY - MM/DD/YY
    const dateRangePattern = /(\d{1,2})[_/](\d{1,2})[_/](\d{2,4})\s*[-–]\s*(\d{1,2})[_/](\d{1,2})[_/](\d{2,4})/;

    const sources = [filename, subject || ''];
    for (const source of sources) {
        const match = source.match(dateRangePattern);
        if (match) {
            const [, m1, d1, y1, m2, d2, y2] = match;
            const startDate = parseReportDate(m1, d1, y1);
            const endDate = parseReportDate(m2, d2, y2);

            if (startDate && endDate) {
                const daysDiff = Math.round(
                    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
                ) + 1; // inclusive

                console.log(`Detected date range: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]} = ${daysDiff} days`);

                return matchPeriod(daysDiff);
            }
        }
    }

    // Try to detect period from keywords in filename or subject
    // Handles formats like "7 Day View.xlsx", "30 Day View", "365day", "weekly", etc.
    for (const source of sources) {
        const lower = source.toLowerCase();
        // Check for explicit day counts (e.g., "7 day", "30 day view", "365 day")
        const dayMatch = lower.match(/(\d+)\s*day/);
        if (dayMatch) {
            const days = parseInt(dayMatch[1], 10);
            return matchPeriod(days);
        }
        if (lower.includes('weekly')) return 7;
        if (lower.includes('monthly')) return 30;
        if (lower.includes('quarterly')) return 90;
        if (lower.includes('yearly') || lower.includes('annual')) return 365;
    }

    console.warn(`Could not detect period from filename "${filename}" or subject "${subject}"`);
    return null;
}

/**
 * Parse a date from report filename components (MM, DD, YY or YYYY)
 */
function parseReportDate(month: string, day: string, year: string): Date | null {
    try {
        let fullYear = parseInt(year, 10);
        if (fullYear < 100) {
            fullYear += 2000; // 26 -> 2026
        }
        const date = new Date(fullYear, parseInt(month, 10) - 1, parseInt(day, 10));
        if (isNaN(date.getTime())) return null;
        return date;
    } catch {
        return null;
    }
}

/**
 * Match a day count to the nearest valid period
 * Allows some tolerance for date range calculations
 */
function matchPeriod(days: number): ValidPeriod {
    // Exact or close matches
    if (days <= 10) return 7;
    if (days <= 45) return 30;
    if (days <= 120) return 90;
    return 365;
}

/**
 * Parse an email attachment into a structured report
 * Combines xlsx parsing with period detection
 */
export function parseReportAttachment(
    buffer: Buffer,
    filename: string,
    subject?: string
): ParsedReport | null {
    try {
        const rows = parseXlsxBuffer(buffer);
        if (rows.length === 0) {
            console.warn(`No data rows in ${filename}`);
            return null;
        }

        const period = detectPeriod(filename, subject);
        if (!period) {
            console.warn(`Could not determine period for ${filename}`);
            return null;
        }

        // Extract date range from filename for metadata
        const dateRangePattern = /(\d{1,2})[_/](\d{1,2})[_/](\d{2,4})\s*[-–]\s*(\d{1,2})[_/](\d{1,2})[_/](\d{2,4})/;
        const match = filename.match(dateRangePattern) || subject?.match(dateRangePattern);
        let dateRange: ParsedReport['dateRange'];

        if (match) {
            const [, m1, d1, y1, m2, d2, y2] = match;
            const start = parseReportDate(m1, d1, y1);
            const end = parseReportDate(m2, d2, y2);
            if (start && end) {
                dateRange = {
                    startDate: start.toISOString().split('T')[0],
                    endDate: end.toISOString().split('T')[0],
                };
            }
        }

        console.log(`Parsed report: ${filename} -> period=${period}, rows=${rows.length}`);

        return {
            period,
            rows,
            filename,
            dateRange,
        };
    } catch (error) {
        console.error(`Failed to parse report ${filename}:`, error);
        return null;
    }
}
