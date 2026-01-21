import { NextResponse } from 'next/server'
import { 
  getCapacityWithStatus, 
  getDemoCapacityData, 
  isServiceTitanConfigured 
} from '@/lib/servicetitan-discount'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Check if ServiceTitan is configured
    if (!isServiceTitanConfigured()) {
      // Return demo data if not configured
      const demoData = getDemoCapacityData()
      return NextResponse.json({
        success: true,
        data: demoData,
        isDemoMode: true,
        message: 'ServiceTitan API not configured. Using demo data.',
      })
    }

    // Fetch real capacity data from ServiceTitan
    const capacityData = await getCapacityWithStatus()
    
    return NextResponse.json({
      success: true,
      data: capacityData,
      isDemoMode: false,
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
    })
  }
}
