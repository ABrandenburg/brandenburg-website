// ServiceTitan API Client
// Handles OAuth2 authentication, rate limiting, and API requests

import { SERVICETITAN_AUTH_URL, SERVICETITAN_API_BASE } from './types';

interface TokenCache {
    accessToken: string;
    expiresAt: number;
}

let tokenCache: TokenCache | null = null;

/**
 * Get a valid access token, fetching a new one if expired
 */
export async function getAccessToken(): Promise<string> {
    // Check if we have a valid cached token (with 60 second buffer for safety)
    const now = Date.now();
    if (tokenCache && tokenCache.expiresAt > now + 60000) {
        return tokenCache.accessToken;
    }

    // If token exists but is expired or about to expire, clear it to force refresh
    if (tokenCache && tokenCache.expiresAt <= now) {
        console.warn('ServiceTitan token expired, fetching new token', {
            expiredAt: new Date(tokenCache.expiresAt).toISOString(),
            currentTime: new Date(now).toISOString(),
        });
        tokenCache = null;
    }

    const clientId = process.env.SERVICETITAN_CLIENT_ID?.trim();
    const clientSecret = process.env.SERVICETITAN_CLIENT_SECRET?.trim();

    if (!clientId || !clientSecret) {
        throw new Error('ServiceTitan credentials not configured');
    }

    const response = await fetch(SERVICETITAN_AUTH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: clientId,
            client_secret: clientSecret,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get access token: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    // Cache the token with expiration (subtract 5 minutes for safety buffer)
    tokenCache = {
        accessToken: data.access_token,
        expiresAt: Date.now() + (data.expires_in - 300) * 1000,
    };

    console.log('ServiceTitan token refreshed', {
        expiresAt: new Date(tokenCache.expiresAt).toISOString(),
        expiresIn: data.expires_in,
    });

    return data.access_token;
}

interface FetchOptions extends RequestInit {
    maxRetries?: number;
    retryDelayMs?: number;
}

/**
 * Make an authenticated request to ServiceTitan API with retry logic
 */
export async function serviceTitanFetch<T>(
    endpoint: string,
    options: FetchOptions = {}
): Promise<T> {
    const { maxRetries = 3, retryDelayMs = 15000, ...fetchOptions } = options;

    const tenantId = process.env.SERVICETITAN_TENANT_ID?.trim();
    const appKey = process.env.SERVICETITAN_APP_KEY?.trim();

    if (!tenantId || !appKey) {
        throw new Error('ServiceTitan tenant ID or app key not configured');
    }

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const token = await getAccessToken();

            // Replace {tenantId} placeholder in endpoint
            const resolvedEndpoint = endpoint.replace('{tenantId}', tenantId);

            const response = await fetch(`${SERVICETITAN_API_BASE}${resolvedEndpoint}`, {
                ...fetchOptions,
                headers: {
                    Authorization: `Bearer ${token}`,
                    'ST-App-Key': appKey,
                    'Content-Type': 'application/json',
                    ...fetchOptions.headers,
                },
            });

            // Handle rate limiting
            if (response.status === 429) {
                const backoffDelay = retryDelayMs * Math.pow(2, attempt);
                console.warn(`Rate limited, waiting ${backoffDelay}ms before retry ${attempt + 1}/${maxRetries}`);
                await delay(backoffDelay);
                continue;
            }

            // Handle expired token (401) - clear cache and retry with fresh token
            if (response.status === 401) {
                const errorText = await response.text();
                console.warn('ServiceTitan API returned 401 (Unauthorized), clearing token cache and retrying...', errorText);
                
                // Clear the expired token cache
                tokenCache = null;
                
                // Retry the request with a fresh token
                if (attempt < maxRetries - 1) {
                    continue;
                } else {
                    throw new Error(`ServiceTitan API authentication failed: ${response.status} - ${errorText}`);
                }
            }

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`ServiceTitan API error: ${response.status} - ${errorText}`);
            }

            return response.json();
        } catch (error) {
            if (attempt < maxRetries - 1) {
                console.warn(`Request failed, retrying in ${retryDelayMs}ms:`, error);
                await delay(retryDelayMs);
                continue;
            }
            throw error;
        }
    }

    throw new Error(`Failed after ${maxRetries} retries`);
}

/**
 * Fetch technician performance report data (Report ID: 3017)
 */
export async function fetchTechnicianPerformance(
    startDate: string,
    endDate: string
): Promise<any[]> {
    const tenantId = process.env.SERVICETITAN_TENANT_ID;

    const response = await serviceTitanFetch<{ data: any[] }>(
        `/reporting/v2/tenant/{tenantId}/report-category/technician-dashboard/reports/3017/data`,
        {
            method: 'POST',
            body: JSON.stringify({
                parameters: [
                    { name: 'From', value: startDate },
                    { name: 'To', value: endDate },
                ],
            }),
        }
    );

    return response.data || [];
}

/**
 * Fetch sold hours report data (Report ID: 239)
 */
export async function fetchSoldHours(
    startDate: string,
    endDate: string
): Promise<any[]> {
    const response = await serviceTitanFetch<{ data: any[] }>(
        `/reporting/v2/tenant/{tenantId}/report-category/operations/reports/239/data`,
        {
            method: 'POST',
            body: JSON.stringify({
                parameters: [
                    { name: 'DateType', value: '2' }, // Completion Date
                    { name: 'From', value: startDate },
                    { name: 'To', value: endDate },
                ],
            }),
        }
    );

    return response.data || [];
}

/**
 * Fetch gross margin report data (Report ID: 3874)
 */
export async function fetchGrossMarginReport(
    startDate: string,
    endDate: string
): Promise<any[]> {
    const response = await serviceTitanFetch<{ data: any[] }>(
        `/reporting/v2/tenant/{tenantId}/report-category/operations/reports/3874/data`,
        {
            method: 'POST',
            body: JSON.stringify({
                parameters: [
                    { name: 'DateType', value: '2' },
                    { name: 'From', value: startDate },
                    { name: 'To', value: endDate },
                ],
            }),
        }
    );

    return response.data || [];
}

/**
 * Fetch cancelled jobs
 */
export async function fetchCancelledJobs(
    modifiedOnOrAfter: string,
    modifiedBefore: string
): Promise<any[]> {
    const response = await serviceTitanFetch<{ data: any[] }>(
        `/jpm/v2/tenant/{tenantId}/jobs?status=Canceled&modifiedOnOrAfter=${encodeURIComponent(modifiedOnOrAfter)}&modifiedBefore=${encodeURIComponent(modifiedBefore)}&pageSize=100`,
        { method: 'GET' }
    );

    return response.data || [];
}

/**
 * Fetch leads data (CRM leads report)
 */
export async function fetchLeadsData(
    startDate: string,
    endDate: string
): Promise<any[]> {
    try {
        const response = await serviceTitanFetch<{ data: any[] }>(
            `/reporting/v2/tenant/{tenantId}/report-category/csr-dashboard/reports/2983/data`,
            {
                method: 'POST',
                body: JSON.stringify({
                    parameters: [
                        { name: 'From', value: startDate },
                        { name: 'To', value: endDate },
                    ],
                }),
            }
        );
        return response.data || [];
    } catch (error) {
        console.warn('CRM leads report failed, trying marketing fallback:', error);
        // Could implement fallback to marketing/telecom APIs here
        return [];
    }
}

/**
 * Utility function to delay execution
 */
export function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if ServiceTitan is configured
 * Validates that all required environment variables are present and non-empty
 */
export function isServiceTitanConfigured(): boolean {
    const hasClientId = !!process.env.SERVICETITAN_CLIENT_ID?.trim();
    const hasClientSecret = !!process.env.SERVICETITAN_CLIENT_SECRET?.trim();
    const hasTenantId = !!process.env.SERVICETITAN_TENANT_ID?.trim();
    const hasAppKey = !!process.env.SERVICETITAN_APP_KEY?.trim();
    
    const isConfigured = hasClientId && hasClientSecret && hasTenantId && hasAppKey;
    
    if (!isConfigured) {
        console.warn('ServiceTitan configuration check failed:', {
            hasClientId,
            hasClientSecret,
            hasTenantId,
            hasAppKey,
            env: process.env.SERVICETITAN_ENV || 'production',
        });
    }
    
    return isConfigured;
}
