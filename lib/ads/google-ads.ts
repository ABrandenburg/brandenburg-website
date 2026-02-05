// Google Ads API Integration
// Fetches ad spend data from Google Ads using the official API

import { GoogleAdsApi, Customer } from 'google-ads-api';

interface GoogleAdsConfig {
    clientId: string;
    clientSecret: string;
    developerToken: string;
    refreshToken: string;
    customerId: string;
}

interface AdSpendData {
    date: string;
    spend: number;
    impressions: number;
    clicks: number;
    conversions: number;
}

/**
 * Check if Google Ads is configured
 */
export function isGoogleAdsConfigured(): boolean {
    return !!(
        process.env.GOOGLE_ADS_CLIENT_ID &&
        process.env.GOOGLE_ADS_CLIENT_SECRET &&
        process.env.GOOGLE_ADS_DEVELOPER_TOKEN &&
        process.env.GOOGLE_ADS_REFRESH_TOKEN &&
        process.env.GOOGLE_ADS_CUSTOMER_ID
    );
}

/**
 * Get Google Ads configuration from environment variables
 */
function getGoogleAdsConfig(): GoogleAdsConfig {
    return {
        clientId: process.env.GOOGLE_ADS_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
        developerToken: process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
        refreshToken: process.env.GOOGLE_ADS_REFRESH_TOKEN!,
        customerId: process.env.GOOGLE_ADS_CUSTOMER_ID!,
    };
}

/**
 * Fetch ad spend data from Google Ads for a specific date range
 * @param startDate - YYYY-MM-DD format
 * @param endDate - YYYY-MM-DD format
 * @returns Array of daily ad spend data
 */
export async function fetchGoogleAdsData(
    startDate: string,
    endDate: string
): Promise<AdSpendData[]> {
    if (!isGoogleAdsConfigured()) {
        console.log('Google Ads not configured, skipping...');
        return [];
    }

    const config = getGoogleAdsConfig();

    console.log('Initializing Google Ads API client...', {
        customerId: config.customerId,
        dateRange: `${startDate} to ${endDate}`,
    });

    try {
        // Initialize Google Ads API client
        const client = new GoogleAdsApi({
            client_id: config.clientId,
            client_secret: config.clientSecret,
            developer_token: config.developerToken,
        });

        // Get customer instance
        const customer: Customer = client.Customer({
            customer_id: config.customerId,
            refresh_token: config.refreshToken,
        });

        // Query for campaign performance data grouped by day
        // This gets spend, impressions, clicks, and conversions
        const query = `
            SELECT
                segments.date,
                metrics.cost_micros,
                metrics.impressions,
                metrics.clicks,
                metrics.conversions
            FROM campaign
            WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
        `;

        console.log('Fetching Google Ads data with query:', query);

        const response = await customer.query(query);

        console.log(`Received ${response.length} rows from Google Ads`);

        // Group by date and sum metrics
        const dailyData = new Map<string, AdSpendData>();

        for (const row of response) {
            const date = row.segments?.date || '';
            const costMicros = Number(row.metrics?.cost_micros || 0);
            const impressions = Number(row.metrics?.impressions || 0);
            const clicks = Number(row.metrics?.clicks || 0);
            const conversions = Number(row.metrics?.conversions || 0);

            if (!dailyData.has(date)) {
                dailyData.set(date, {
                    date,
                    spend: 0,
                    impressions: 0,
                    clicks: 0,
                    conversions: 0,
                });
            }

            const dayData = dailyData.get(date)!;
            dayData.spend += costMicros / 1_000_000; // Convert micros to dollars
            dayData.impressions += impressions;
            dayData.clicks += clicks;
            dayData.conversions += conversions;
        }

        const results = Array.from(dailyData.values());

        console.log(`Processed ${results.length} days of Google Ads data`, {
            totalSpend: results.reduce((sum, d) => sum + d.spend, 0).toFixed(2),
            totalImpressions: results.reduce((sum, d) => sum + d.impressions, 0),
        });

        return results;
    } catch (error: any) {
        console.error('Google Ads API error:', {
            message: error.message,
            code: error.code,
            details: error.details,
        });

        // Rethrow with more context
        throw new Error(`Google Ads API error: ${error.message}`);
    }
}

/**
 * Fetch yesterday's Google Ads data
 */
export async function fetchYesterdayGoogleAdsData(): Promise<AdSpendData[]> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0]; // YYYY-MM-DD

    console.log(`Fetching Google Ads data for ${dateStr}`);

    return fetchGoogleAdsData(dateStr, dateStr);
}
