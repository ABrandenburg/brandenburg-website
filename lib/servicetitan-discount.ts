// ServiceTitan API Client for Discount Calculator
// Computes capacity from technician shifts and appointments
// Version: 2026-02-18-v10 (use shifts + appointments instead of dispatch capacity)

import { CapacityData, getStatusFromAvailability } from './discount-calculator'
import { serviceTitanFetch, clearTokenCache } from './servicetitan/client'

export interface CapacityDebugInfo {
  totalShifts: number
  weekdayShifts: number
  totalShiftHours: number
  totalAppointments: number
  activeWeekdayAppointments: number
  bookedHours: number
  availableHours: number
  method: string
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
 * Fetch capacity data from ServiceTitan for the next 3 days
 * by comparing technician shift hours against booked appointment hours.
 */
export async function getCapacityWithStatus(): Promise<CapacityWithDebug> {
  if (!isServiceTitanConfigured()) {
    throw new Error('ServiceTitan API not configured. Please set environment variables.')
  }

  const today = new Date()
  const endDate = new Date()
  endDate.setDate(today.getDate() + 3)

  const startsOnOrAfter = today.toISOString()
  const endsOnOrBefore = endDate.toISOString()

  console.log('Fetching capacity from shifts + appointments:', { startsOnOrAfter, endsOnOrBefore })

  try {
    // Fetch technician shifts and appointments in parallel
    const [shiftsResponse, appointmentsResponse] = await Promise.all([
      serviceTitanFetch<{ data?: any[] }>(
        `/dispatch/v2/tenant/{tenantId}/technician-shifts?startsOnOrAfter=${startsOnOrAfter}&endsOnOrBefore=${endsOnOrBefore}`
      ),
      serviceTitanFetch<{ data?: any[] }>(
        `/jpm/v2/tenant/{tenantId}/appointments?startsOnOrAfter=${startsOnOrAfter}&endsOnOrBefore=${endsOnOrBefore}`
      ),
    ])

    const shifts: any[] = shiftsResponse.data || (Array.isArray(shiftsResponse) ? shiftsResponse : [])
    const appointments: any[] = appointmentsResponse.data || (Array.isArray(appointmentsResponse) ? appointmentsResponse : [])

    // Helper to check if a date is a weekend
    const isWeekend = (dateStr: string): boolean => {
      const day = new Date(dateStr).getDay()
      return day === 0 || day === 6
    }

    // Sum weekday shift hours (Normal shifts only)
    let totalShiftHours = 0
    let weekdayShifts = 0
    for (const shift of shifts) {
      if (shift.shiftType !== 'Normal') continue
      if (isWeekend(shift.start)) continue
      const hours = (new Date(shift.end).getTime() - new Date(shift.start).getTime()) / (1000 * 60 * 60)
      totalShiftHours += hours
      weekdayShifts++
    }

    // Sum weekday appointment hours (active only)
    let bookedHours = 0
    let activeWeekdayAppointments = 0
    for (const appt of appointments) {
      if (!appt.active) continue
      if (isWeekend(appt.start)) continue
      const hours = (new Date(appt.end).getTime() - new Date(appt.start).getTime()) / (1000 * 60 * 60)
      bookedHours += hours
      activeWeekdayAppointments++
    }

    const availableHours = Math.max(0, totalShiftHours - bookedHours)
    const availabilityPercent = totalShiftHours > 0
      ? (availableHours / totalShiftHours) * 100
      : 0
    const status = getStatusFromAvailability(availabilityPercent)

    const debug: CapacityDebugInfo = {
      totalShifts: shifts.length,
      weekdayShifts,
      totalShiftHours: Math.round(totalShiftHours * 10) / 10,
      totalAppointments: appointments.length,
      activeWeekdayAppointments,
      bookedHours: Math.round(bookedHours * 10) / 10,
      availableHours: Math.round(availableHours * 10) / 10,
      method: 'shifts-minus-appointments',
    }

    console.log('Capacity computed:', debug)

    return {
      data: {
        status,
        availabilityPercent: Math.round(availabilityPercent * 10) / 10,
        totalCapacity: Math.round(totalShiftHours * 10) / 10,
        availableCapacity: Math.round(availableHours * 10) / 10,
      },
      debug,
    }
  } catch (error) {
    console.error('ServiceTitan capacity computation error:', error)
    clearTokenCache()
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
