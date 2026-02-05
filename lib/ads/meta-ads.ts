// Meta (Facebook) Ads API Integration
// Fetches ad spend data from Meta Ads using the official Business SDK

interface MetaAdsConfig {
    accessToken: string;
    adAccountId: string;
}

interface AdSpendData {
    date: string;
    spend: number;
    impressions: number;
    clicks: number;
    conversions: number;
}

/**
 * Check if Meta Ads is configured
 */
export function isMetaAdsConfigured(): boolean {
    return !!(
        process.env.META_ADS_ACCESS_TOKEN &&
        process.env.META_ADS_ACCOUNT_ID
    );
}

/**
 * Get Meta Ads configuration from environment variables
 */
function getMetaAdsConfig(): MetaAdsConfig {
    return {
        accessToken: process.env.META_ADS_ACCESS_TOKEN!,
        adAccountId: process.env.META_ADS_ACCOUNT_ID!,
    };
}

/**
 * Fetch ad spend data from Meta Ads for a specific date range
 * Uses the Insights API to get daily aggregated data
 * @param startDate - YYYY-MM-DD format
 * @param endDate - YYYY-MM-DD format
 * @returns Array of daily ad spend data
 */
export async function fetchMetaAdsData(
    startDate: string,
    endDate: string
): Promise<AdSpendData[]> {
    if (!isMetaAdsConfigured()) {
        console.log('Meta Ads not configured, skipping...');
        return [];
    }

    const config = getMetaAdsConfig();

    console.log('Fetching Meta Ads data...', {
        accountId: config.adAccountId,
        dateRange: `${startDate} to ${endDate}`,
    });

    try {
        // Dynamically import the SDK to avoid issues in edge runtime
        const { FacebookAdsApi, AdAccount } = await import('facebook-nodejs-business-sdk');

        // Initialize API
        FacebookAdsApi.init(config.accessToken);

        // Get ad account
        const account = new AdAccount(`act_${config.adAccountId}`);

        // Request insights with daily breakdowns
        const params = {
            time_range: {
                since: startDate,
                until: endDate,
            },
            level: 'account',
            time_increment: 1, // Daily breakdown
            fields: [
                'spend',
                'impressions',
                'clicks',
                'conversions',
                'date_start',
            ],
        };

        console.log('Querying Meta Ads Insights API with params:', params);

        const insights = await account.getInsights([], params);

        console.log(`Received ${insights.length} days of Meta Ads data`);

        // Transform to our standard format
        const results: AdSpendData[] = insights.map((insight: any) => ({
            date: insight.date_start,
            spend: parseFloat(insight.spend || '0'),
            impressions: parseInt(insight.impressions || '0', 10),
            clicks: parseInt(insight.clicks || '0', 10),
            conversions: parseFloat(insight.conversions || '0'),
        }));

        console.log(`Processed ${results.length} days of Meta Ads data`, {
            totalSpend: results.reduce((sum, d) => sum + d.spend, 0).toFixed(2),
            totalImpressions: results.reduce((sum, d) => sum + d.impressions, 0),
        });

        return results;
    } catch (error: any) {
        console.error('Meta Ads API error:', {
            message: error.message,
            code: error.code,
            type: error.type,
            error_subcode: error.error_subcode,
        });

        // Rethrow with more context
        throw new Error(`Meta Ads API error: ${error.message}`);
    }
}

/**
 * Fetch yesterday's Meta Ads data
 */
export async function fetchYesterdayMetaAdsData(): Promise<AdSpendData[]> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0]; // YYYY-MM-DD

    console.log(`Fetching Meta Ads data for ${dateStr}`);

    return fetchMetaAdsData(dateStr, dateStr);
}
