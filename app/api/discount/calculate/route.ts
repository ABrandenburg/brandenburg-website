import { NextRequest, NextResponse } from 'next/server'
import { 
  getCapacityWithStatus, 
  getDemoCapacityData, 
  isServiceTitanConfigured 
} from '@/lib/servicetitan-discount'
import { calculateDiscounts } from '@/lib/discount-calculator'

export const dynamic = 'force-dynamic'

interface CalculateRequest {
  grossMargin: number
}

export async function POST(request: NextRequest) {
  try {
    const body: CalculateRequest = await request.json()
    
    // Validate input
    if (typeof body.grossMargin !== 'number' || body.grossMargin <= 0) {
      return NextResponse.json(
        { success: false, error: 'Gross margin must be a positive number' },
        { status: 400 }
      )
    }

    // Get capacity data
    let capacityData
    let isDemoMode = false

    if (!isServiceTitanConfigured()) {
      capacityData = getDemoCapacityData()
      isDemoMode = true
    } else {
      try {
        const result = await getCapacityWithStatus()
        capacityData = result.data
      } catch (error) {
        console.error('ServiceTitan API error, falling back to demo:', error)
        capacityData = getDemoCapacityData()
        isDemoMode = true
      }
    }

    // Calculate discounts
    const discountResult = calculateDiscounts(
      body.grossMargin,
      capacityData.status,
      capacityData.availabilityPercent
    )

    return NextResponse.json({
      success: true,
      data: discountResult,
      isDemoMode,
    })
  } catch (error) {
    console.error('Error calculating discount:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to calculate discount' 
      },
      { status: 500 }
    )
  }
}
