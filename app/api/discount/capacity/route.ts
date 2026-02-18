import { NextResponse } from 'next/server'
import {
  getCapacityWithStatus,
  getDemoCapacityData,
  isServiceTitanConfigured,
  getServiceTitanConfigStatus
} from '@/lib/servicetitan-discount'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Check if ServiceTitan is configured
    if (!isServiceTitanConfigured()) {
      // Log detailed configuration status for debugging
      const configStatus = getServiceTitanConfigStatus()
      console.warn('ServiceTitan not configured. Status:', configStatus)

      // Build helpful message about missing variables
      const missing: string[] = []
      if (!configStatus.hasClientId) missing.push('SERVICETITAN_CLIENT_ID')
      if (!configStatus.hasClientSecret) missing.push('SERVICETITAN_CLIENT_SECRET')
      if (!configStatus.hasTenantId) missing.push('SERVICETITAN_TENANT_ID')
      if (!configStatus.hasAppKey) missing.push('SERVICETITAN_APP_KEY')

      const demoData = getDemoCapacityData()
      return NextResponse.json({
        success: true,
        data: demoData,
        isDemoMode: true,
        message: `ServiceTitan API not configured. Missing: ${missing.join(', ')}. Using demo data.`,
        configStatus: {
          hasClientId: configStatus.hasClientId,
          hasClientSecret: configStatus.hasClientSecret,
          hasTenantId: configStatus.hasTenantId,
          hasAppKey: configStatus.hasAppKey,
          environment: configStatus.environment,
        },
      })
    }

    // Compute capacity from technician shifts and appointments
    console.log('Computing capacity from ServiceTitan shifts + appointments')
    const { data: capacityData, debug } = await getCapacityWithStatus()

    return NextResponse.json({
      success: true,
      data: capacityData,
      isDemoMode: false,
      apiVersion: 'v10-2026-02-18',
      debug,
    })
  } catch (error) {
    console.error('Error fetching capacity:', error)

    // Fallback to demo mode on error
    const demoData = getDemoCapacityData()
    return NextResponse.json({
      success: true,
      data: demoData,
      isDemoMode: true,
      message: error instanceof Error ? error.message : 'API error - using demo data',
      apiVersion: 'v10-2026-02-18',
    })
  }
}
