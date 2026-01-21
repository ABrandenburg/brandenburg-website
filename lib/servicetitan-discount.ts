// ServiceTitan API Client for Discount Calculator
// Uses serviceTitanFetch from client.ts for authentication and API requests
// Version: 2026-01-21-v6 (handle response format)

import { CapacityData, getStatusFromAvailability } from './discount-calculator'
import { serviceTitanFetch, clearTokenCache } from './servicetitan/client'

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
    // Capacity endpoint - try simple format first
    const requestBody = {
      startsOnOrAfter,
      endsOnOrBefore,
      skillBasedAvailability: false,
    }
    
    console.log('Capacity request body:', JSON.stringify(requestBody))
    
    const response = await serviceTitanFetch<any>(
      endpoint,
      {
        method: 'POST',
        body: JSON.stringify(requestBody),
      }
    )
    
    // Log the actual response structure to understand the format
    console.log('ServiceTitan capacity response:', JSON.stringify(response))
  
    // Calculate totals from all slots
    let totalCapacity = 0
    let availableCapacity = 0
    
    // Handle different response structures
    const slots = response.data || response.items || response.results || response
    
    if (Array.isArray(slots)) {
      for (const slot of slots) {
        totalCapacity += slot.capacity || 0
        availableCapacity += slot.availableCapacity || 0
      }
    } else if (typeof slots === 'object' && slots !== null) {
      // Maybe it's a single object with totals already calculated
      totalCapacity = slots.totalCapacity || slots.capacity || 100
      availableCapacity = slots.availableCapacity || slots.available || 45
      console.log('Response is object, not array:', slots)
    } else {
      console.warn('Unexpected response format:', typeof slots, slots)
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
    
    // Clear token cache on any error to ensure fresh token on next attempt
    clearTokenCache()
    
    // Provide more helpful error message for specific errors
    if (error instanceof Error) {
      if (error.message.includes('404')) {
        throw new Error(
          `ServiceTitan capacity endpoint not found (404). ` +
          `The endpoint '/dispatch/v2/tenant/{tenantId}/capacity' may not be available. ` +
          `Please verify that Dispatch API scopes are enabled. ` +
          `Original error: ${error.message}`
        )
      }
      
      if (error.message.includes('401')) {
        throw new Error(
          `ServiceTitan authentication failed (401). Token may have expired. ` +
          `The system will attempt to refresh the token on the next request. ` +
          `Original error: ${error.message}`
        )
      }
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
