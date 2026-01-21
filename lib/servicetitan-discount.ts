// ServiceTitan API Client for Discount Calculator
// Handles OAuth 2.0 authentication and capacity data fetching

import { CapacityData, getStatusFromAvailability } from './discount-calculator'
import { serviceTitanFetch } from './servicetitan/client'

interface TokenCache {
  token: string
  expiresAt: number
}

interface ServiceTitanCapacitySlot {
  date: string
  start: string
  end: string
  capacity: number
  availableCapacity: number
  openings: number
  bookedCount: number
  scheduledHrs: number
}

interface ServiceTitanCapacityResponse {
  data: ServiceTitanCapacitySlot[]
  hasMore: boolean
}

// Token cache (module-level for persistence across requests in serverless)
let cachedToken: TokenCache | null = null

/**
 * Get ServiceTitan environment configuration
 */
function getServiceTitanConfig() {
  const env = process.env.SERVICETITAN_ENV || 'production'
  const isIntegration = env === 'integration'
  
  return {
    authUrl: isIntegration
      ? 'https://auth-integration.servicetitan.io/connect/token'
      : 'https://auth.servicetitan.io/connect/token',
    baseUrl: isIntegration
      ? 'https://api-integration.servicetitan.io'
      : 'https://api.servicetitan.io',
    clientId: process.env.SERVICETITAN_CLIENT_ID,
    clientSecret: process.env.SERVICETITAN_CLIENT_SECRET,
    tenantId: process.env.SERVICETITAN_TENANT_ID,
    appKey: process.env.SERVICETITAN_APP_KEY,
  }
}

/**
 * Get detailed configuration status for debugging
 */
export function getServiceTitanConfigStatus() {
  const config = getServiceTitanConfig()
  
  return {
    hasClientId: !!config.clientId?.trim(),
    hasClientSecret: !!config.clientSecret?.trim(),
    hasTenantId: !!config.tenantId?.trim(),
    hasAppKey: !!config.appKey?.trim(),
    environment: process.env.SERVICETITAN_ENV || 'production',
    // Show partial values for debugging (first 4 chars only)
    clientIdPreview: config.clientId?.trim()?.substring(0, 4) || null,
    tenantIdPreview: config.tenantId?.trim()?.substring(0, 4) || null,
    appKeyPreview: config.appKey?.trim()?.substring(0, 4) || null,
  }
}

/**
 * Check if ServiceTitan is configured
 * Validates that all required environment variables are present and non-empty
 */
export function isServiceTitanConfigured(): boolean {
  const config = getServiceTitanConfig()
  const hasClientId = !!config.clientId?.trim()
  const hasClientSecret = !!config.clientSecret?.trim()
  const hasTenantId = !!config.tenantId?.trim()
  const hasAppKey = !!config.appKey?.trim()
  
  const isConfigured = hasClientId && hasClientSecret && hasTenantId && hasAppKey
  
  if (!isConfigured) {
    console.warn('ServiceTitan configuration check failed:', {
      hasClientId,
      hasClientSecret,
      hasTenantId,
      hasAppKey,
      env: process.env.SERVICETITAN_ENV || 'production',
    })
  }
  
  return isConfigured
}

/**
 * Get OAuth access token from ServiceTitan
 * Implements token caching with 60-second buffer before expiry
 */
async function getAccessToken(): Promise<string> {
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60000) {
    return cachedToken.token
  }

  const config = getServiceTitanConfig()
  
  if (!config.clientId || !config.clientSecret) {
    throw new Error('ServiceTitan credentials not configured')
  }

  const response = await fetch(config.authUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: config.clientId,
      client_secret: config.clientSecret,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`ServiceTitan authentication failed: ${errorText}`)
  }

  const data = await response.json()
  
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  }
  
  return data.access_token
}

/**
 * Fetch capacity data from ServiceTitan for the next 3 days
 * and calculate availability status
 */
export async function getCapacityWithStatus(): Promise<CapacityData> {
  const config = getServiceTitanConfig()
  
  if (!isServiceTitanConfigured()) {
    throw new Error('ServiceTitan API not configured. Please set environment variables.')
  }

  // Calculate date range (today + 3 days)
  const today = new Date()
  const endDate = new Date()
  endDate.setDate(today.getDate() + 3)

  // Use ISO 8601 datetime format for capacity endpoint
  const startsOnOrAfter = today.toISOString()
  const endsOnOrBefore = endDate.toISOString()

  const endpoint = `/dispatch/v2/tenant/{tenantId}/capacity`
  
  console.log('ServiceTitan capacity API request:', {
    endpoint,
    method: 'POST',
    dateRange: {
      startsOnOrAfter,
      endsOnOrBefore,
    },
  })
  
  try {
    // Capacity endpoint uses POST with query parameters
    // According to ServiceTitan docs, parameters can be in query string or body
    const data = await serviceTitanFetch<ServiceTitanCapacityResponse>(
      `${endpoint}?startsOnOrAfter=${encodeURIComponent(startsOnOrAfter)}&endsOnOrBefore=${encodeURIComponent(endsOnOrBefore)}`,
      {
        method: 'POST',
      }
    )
  
    // Calculate totals from all slots
    let totalCapacity = 0
    let availableCapacity = 0
    
    for (const slot of data.data) {
      totalCapacity += slot.capacity
      availableCapacity += slot.availableCapacity
    }

    // Calculate availability percentage
    const availabilityPercent = totalCapacity > 0
      ? (availableCapacity / totalCapacity) * 100
      : 0

    // Determine status based on availability
    const status = getStatusFromAvailability(availabilityPercent)

    return {
      status,
      availabilityPercent: Math.round(availabilityPercent * 10) / 10,
      totalCapacity,
      availableCapacity,
    }
  } catch (error) {
    console.error('ServiceTitan capacity API error:', error)
    
    // Provide more helpful error message for 404
    if (error instanceof Error && error.message.includes('404')) {
      throw new Error(
        `ServiceTitan capacity endpoint not found (404). ` +
        `The endpoint '/dispatch/v2/tenant/{tenantId}/capacity' may not be available in your ServiceTitan version or may require different scopes. ` +
        `You have 'Capacity' scopes enabled under 'Customer Transactions' and 'Scheduling API', but the endpoint is under 'Dispatch API'. ` +
        `Please verify that Dispatch API scopes are enabled, or check ServiceTitan documentation for the correct endpoint path. ` +
        `Original error: ${error.message}`
      )
    }
    
    throw error
  }
}

/**
 * Get demo capacity data for testing without ServiceTitan API
 * Returns Hungry status with 45% availability by default
 */
export function getDemoCapacityData(): CapacityData {
  return {
    status: 'hungry',
    availabilityPercent: 45.0,
    totalCapacity: 100,
    availableCapacity: 45,
  }
}
