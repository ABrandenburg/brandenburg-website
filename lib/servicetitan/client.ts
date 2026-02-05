// ServiceTitan API Client
// Handles OAuth2 authentication, rate limiting, and API requests

import { SERVICETITAN_AUTH_URL, SERVICETITAN_API_BASE } from './types';

interface TokenCache {
    accessToken: string;
    expiresAt: number;
}

let tokenCache: TokenCache | null = null;

/**
 * Clear the token cache - call this when receiving 401 errors
 */
export function clearTokenCache(): void {
    console.log('Clearing ServiceTitan token cache');
    tokenCache = null;
}

/**
 * Get a valid access token, fetching a new one if expired
 * @param forceRefresh - If true, always fetch a new token (ignore cache)
 */
export async function getAccessToken(forceRefresh: boolean = false): Promise<string> {
    const now = Date.now();
    
    // Force refresh if requested (e.g., after a 401 error)
    if (forceRefresh) {
        console.log('Force refreshing ServiceTitan token');
        tokenCache = null;
    }
    
    // Check if we have a valid cached token (with 60 second buffer for safety)
    if (tokenCache && tokenCache.expiresAt > now + 60000) {
        return tokenCache.accessToken;
    }

    // If token exists but is expired or about to expire, clear it
    if (tokenCache) {
        console.warn('ServiceTitan token expired or expiring soon, fetching new token', {
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

    console.log('Fetching new ServiceTitan access token...', {
        timestamp: new Date().toISOString(),
        clientIdPrefix: clientId.substring(0, 8),
    });
    
    const response = await fetch(SERVICETITAN_AUTH_URL, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
        },
        body: new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: clientId,
            client_secret: clientSecret,
        }),
        cache: 'no-store', // Disable fetch caching
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to get ServiceTitan access token:', {
            status: response.status,
            error: errorText,
        });
        throw new Error(`Failed to get access token: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    // Log token details (first/last 4 chars only for security)
    const tokenPreview = data.access_token 
        ? `${data.access_token.substring(0, 4)}...${data.access_token.substring(data.access_token.length - 4)}`
        : 'none';

    // Cache the token with expiration (subtract 5 minutes for safety buffer)
    const expiresAt = Date.now() + (data.expires_in - 300) * 1000;
    tokenCache = {
        accessToken: data.access_token,
        expiresAt: expiresAt,
    };

    console.log('ServiceTitan token obtained successfully', {
        tokenPreview,
        expiresAt: new Date(expiresAt).toISOString(),
        expiresIn: data.expires_in,
        issuedAt: new Date().toISOString(),
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

    let forceTokenRefresh = false;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            console.log(`ServiceTitan API attempt ${attempt + 1}/${maxRetries}`, {
                forceTokenRefresh,
                timestamp: new Date().toISOString(),
            });
            
            // Force refresh on retry after 401
            const token = await getAccessToken(forceTokenRefresh);
            
            // Log token being used (first/last 4 chars for security)
            const tokenPreview = `${token.substring(0, 4)}...${token.substring(token.length - 4)}`;
            console.log(`Using token: ${tokenPreview}`);

            // Replace {tenantId} placeholder in endpoint
            const resolvedEndpoint = endpoint.replace('{tenantId}', tenantId);

            console.log(`ServiceTitan API request:`, {
                endpoint: resolvedEndpoint,
                method: fetchOptions.method || 'GET',
            });

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

            // Handle expired token (401) - force fresh token on next attempt
            if (response.status === 401) {
                const errorText = await response.text();
                console.warn('ServiceTitan API returned 401 (Unauthorized), will force token refresh on retry...', errorText);
                
                // Clear cache and force refresh on next attempt
                clearTokenCache();
                forceTokenRefresh = true;
                
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
            console.error(`ServiceTitan API attempt ${attempt + 1}/${maxRetries} failed:`, error);
            if (attempt < maxRetries - 1) {
                console.warn(`Retrying in ${retryDelayMs}ms...`);
                await delay(retryDelayMs);
                continue;
            }
            throw error;
        }
    }

    throw new Error(`ServiceTitan API: Failed after ${maxRetries} retries. Check server logs for details.`);
}

/**
 * Fetch technician performance report data (Report ID: 3594 - Technician Performance Board)
 */
export async function fetchTechnicianPerformance(
    startDate: string,
    endDate: string
): Promise<any[]> {
    const tenantId = process.env.SERVICETITAN_TENANT_ID;

    const response = await serviceTitanFetch<{ data: any[] }>(
        `/reporting/v2/tenant/{tenantId}/report-category/technician-dashboard/reports/3594/data`,
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
