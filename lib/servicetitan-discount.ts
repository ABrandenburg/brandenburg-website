// ServiceTitan API Client for Discount Calculator
// Uses serviceTitanFetch from client.ts for authentication and API requests
// Version: 2026-02-16-v9 (fix: body params with args + robust response parsing)

import { CapacityData, getStatusFromAvailability } from './discount-calculator'
import { serviceTitanFetch, clearTokenCache } from './servicetitan/client'

export interface CapacityDebugInfo {
  rawResponse: unknown
  topLevelKeys: string[]
  firstItemKeys: string[] | null
  slotsSource: string
  parsingPath: string
  slotFieldsUsed: { capacityField: string; availableField: string } | null
}

export interface CapacityWithDebug {
  data: CapacityData
  debug: CapacityDebugInfo
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
 * Extract capacity values from a slot object by trying multiple field name patterns.
 * Returns null if no recognizable capacity fields are found.
 */
function extractCapacityFromSlot(slot: Record<string, any>): { capacity: number; available: number; capacityField: string; availableField: string } | null {
  // Try capacity field names (total capacity / max capacity)
  const capacityFields = ['capacity', 'totalCapacity', 'allowedCapacity', 'totalHours', 'maxCapacity']
  // Try available field names
  const availableFields = ['availableCapacity', 'available', 'availability', 'openCapacity', 'freeHours', 'openSlots']
  // Try booked field names (for computing available = capacity - booked)
  const bookedFields = ['booked', 'bookedCount', 'usedCapacity', 'scheduledHrs', 'usedHours']

  let capacityVal: number | null = null
  let capacityField = ''
  let availableVal: number | null = null
  let availableField = ''

  for (const f of capacityFields) {
    if (typeof slot[f] === 'number' && slot[f] > 0) {
      capacityVal = slot[f]
      capacityField = f
      break
    }
  }

  for (const f of availableFields) {
    if (typeof slot[f] === 'number') {
      availableVal = slot[f]
      availableField = f
      break
    }
  }

  // Fallback: compute available from capacity - booked
  if (capacityVal !== null && availableVal === null) {
    for (const f of bookedFields) {
      if (typeof slot[f] === 'number') {
        availableVal = capacityVal - slot[f]
        availableField = `computed(${capacityField} - ${f})`
        break
      }
    }
  }

  if (capacityVal !== null && availableVal !== null) {
    return { capacity: capacityVal, available: availableVal, capacityField, availableField }
  }

  return null
}

/**
 * Fetch capacity data from ServiceTitan for the next 3 days
 * and calculate availability status.
 * Returns both the capacity data and debug info about the raw API response.
 */
export async function getCapacityWithStatus(): Promise<CapacityWithDebug> {
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

  const requestBody = {
    startsOnOrAfter,
    endsOnOrBefore,
    skillBasedAvailability: false,
    args: {},
  }

  console.log('ServiceTitan capacity API request:', {
    endpoint,
    method: 'POST',
    body: requestBody,
  })

  const debug: CapacityDebugInfo = {
    rawResponse: null,
    topLevelKeys: [],
    firstItemKeys: null,
    slotsSource: 'none',
    parsingPath: 'none',
    slotFieldsUsed: null,
  }

  try {
    const response = await serviceTitanFetch<any>(
      endpoint,
      {
        method: 'POST',
        body: JSON.stringify(requestBody),
      }
    )

    // Capture debug info from raw response
    debug.rawResponse = response
    if (response && typeof response === 'object') {
      debug.topLevelKeys = Object.keys(response)
    }

    console.log('ServiceTitan capacity response keys:', debug.topLevelKeys)
    console.log('ServiceTitan capacity response:', JSON.stringify(response))

    // Calculate totals from all slots
    let totalCapacity = 0
    let availableCapacity = 0

    // Handle different response structures
    let slots: any
    let slotsSource = 'none'

    if (Array.isArray(response?.data)) {
      slots = response.data; slotsSource = 'response.data'
    } else if (Array.isArray(response?.items)) {
      slots = response.items; slotsSource = 'response.items'
    } else if (Array.isArray(response?.results)) {
      slots = response.results; slotsSource = 'response.results'
    } else if (Array.isArray(response?.capacities)) {
      slots = response.capacities; slotsSource = 'response.capacities'
    } else if (Array.isArray(response)) {
      slots = response; slotsSource = 'response (root array)'
    } else {
      slots = response; slotsSource = 'response (raw object)'
    }

    debug.slotsSource = slotsSource

    // Capture first item keys for debugging
    if (Array.isArray(slots) && slots.length > 0 && typeof slots[0] === 'object') {
      debug.firstItemKeys = Object.keys(slots[0])
      console.log('First slot keys:', debug.firstItemKeys)
      console.log('First slot sample:', JSON.stringify(slots[0]))
    }

    // Helper to check if a date is a weekend (Saturday = 6, Sunday = 0)
    const isWeekend = (dateStr: string): boolean => {
      const date = new Date(dateStr)
      const day = date.getDay()
      return day === 0 || day === 6
    }

    if (Array.isArray(slots)) {
      let parsedCount = 0
      for (const slot of slots) {
        // Skip weekends
        const slotDate = slot.date || slot.start || slot.startsOnOrAfter
        if (slotDate && isWeekend(slotDate)) {
          console.log('Skipping weekend slot:', slotDate)
          continue
        }

        const extracted = extractCapacityFromSlot(slot)
        if (extracted) {
          totalCapacity += extracted.capacity
          availableCapacity += extracted.available
          if (!debug.slotFieldsUsed) {
            debug.slotFieldsUsed = { capacityField: extracted.capacityField, availableField: extracted.availableField }
          }
          parsedCount++
        }
      }
      debug.parsingPath = `array(${slotsSource}): ${parsedCount}/${slots.length} slots parsed`
      console.log('Processed slots (excluding weekends):', { totalCapacity, availableCapacity, parsedCount, totalSlots: slots.length })
    } else if (typeof slots === 'object' && slots !== null) {
      const slotDate = slots.date || slots.start || slots.startsOnOrAfter
      if (slotDate && isWeekend(slotDate)) {
        console.log('Skipping weekend (single object):', slotDate)
        debug.parsingPath = 'single object: skipped (weekend)'
      } else {
        const extracted = extractCapacityFromSlot(slots)
        if (extracted) {
          totalCapacity = extracted.capacity
          availableCapacity = extracted.available
          debug.slotFieldsUsed = { capacityField: extracted.capacityField, availableField: extracted.availableField }
          debug.parsingPath = `single object: used ${extracted.capacityField}/${extracted.availableField}`
        } else {
          debug.parsingPath = 'single object: no recognizable capacity fields'
        }
      }
      console.log('Response is object, not array:', Object.keys(slots))
    } else {
      console.warn('Unexpected response format:', typeof slots, slots)
      debug.parsingPath = `unexpected format: ${typeof slots}`
    }

    // If we got a valid API response but parsed 0 capacity, throw to trigger demo mode
    // This prevents silently showing 0% when the response format is unrecognized
    if (totalCapacity === 0 && debug.rawResponse !== null) {
      const errorMsg = `ServiceTitan capacity API returned data but parsed to 0 capacity. ` +
        `Response keys: [${debug.topLevelKeys.join(', ')}]. ` +
        `Slots source: ${debug.slotsSource}. ` +
        `First item keys: [${(debug.firstItemKeys || []).join(', ')}]. ` +
        `Check /api/discount/debug?liveTest=true for raw response.`
      console.error(errorMsg)
      throw new Error(errorMsg)
    }

    // Calculate availability percentage
    const availabilityPercent = totalCapacity > 0
      ? (availableCapacity / totalCapacity) * 100
      : 0

    // Determine status based on availability
    const status = getStatusFromAvailability(availabilityPercent)

    return {
      data: {
        status,
        availabilityPercent: Math.round(availabilityPercent * 10) / 10,
        totalCapacity,
        availableCapacity,
      },
      debug,
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
