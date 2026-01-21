// Discount Calculator Business Logic
// Implements the two-stage discount authorization system

export type CapacityStatus = 'hungry' | 'normal' | 'busy'

export interface DiscountConfig {
  maxSacrificePercent: number  // Percentage of margin that can be sacrificed
  standardDiscountCap: number  // Hard cap for standard discount ($)
  maxDiscountCap: number       // Cap for max/manager discount ($)
}

export interface DiscountResult {
  status: CapacityStatus
  availabilityPercent: number
  grossMargin: number
  
  // Max sacrifice amount (100% of allowed sacrifice)
  maxSacrificeAmount: number
  maxSacrificePercent: number
  
  // Standard Discount (Output A): 50% of max sacrifice, capped at $1,000
  standardDiscount: number
  standardRetainedMargin: number
  
  // Max Discount (Output B): 100% of max sacrifice, capped at $5,000
  maxDiscount: number
  maxRetainedMargin: number
}

export interface CapacityData {
  status: CapacityStatus
  availabilityPercent: number
  totalCapacity: number
  availableCapacity: number
}

/**
 * Get discount configuration based on capacity status
 * 
 * - Hungry (>40% open): 30% of margin can be sacrificed
 * - Normal (20-40% open): 15% of margin can be sacrificed
 * - Busy (<20% open): No discounts allowed
 */
function getDiscountConfig(status: CapacityStatus): DiscountConfig {
  const configs: Record<CapacityStatus, DiscountConfig> = {
    hungry: {
      maxSacrificePercent: 0.30,  // 30% of margin
      standardDiscountCap: 1000,
      maxDiscountCap: 5000,
    },
    normal: {
      maxSacrificePercent: 0.15,  // 15% of margin
      standardDiscountCap: 1000,
      maxDiscountCap: 5000,
    },
    busy: {
      maxSacrificePercent: 0,
      standardDiscountCap: 0,
      maxDiscountCap: 0,
    },
  }
  return configs[status]
}

/**
 * Calculate discounts based on gross margin and capacity status
 * 
 * @param grossMargin - The gross margin amount in dollars
 * @param status - Current capacity status (hungry, normal, busy)
 * @param availabilityPercent - Percentage of capacity available
 * @returns DiscountResult with calculated discount amounts
 */
export function calculateDiscounts(
  grossMargin: number,
  status: CapacityStatus,
  availabilityPercent: number
): DiscountResult {
  const config = getDiscountConfig(status)
  
  // Calculate max sacrifice amount based on margin and status
  const maxSacrificeAmount = grossMargin * config.maxSacrificePercent
  
  // Standard Discount: 50% of max sacrifice, capped at $1,000
  const standardDiscountRaw = maxSacrificeAmount * 0.5
  const standardDiscount = Math.min(standardDiscountRaw, config.standardDiscountCap)
  
  // Max Discount: 100% of max sacrifice, capped at $5,000
  const maxDiscount = Math.min(maxSacrificeAmount, config.maxDiscountCap)
  
  // Calculate retained margins
  const standardRetainedMargin = grossMargin - standardDiscount
  const maxRetainedMargin = grossMargin - maxDiscount
  
  return {
    status,
    availabilityPercent,
    grossMargin,
    maxSacrificeAmount: Math.round(maxSacrificeAmount * 100) / 100,
    maxSacrificePercent: config.maxSacrificePercent * 100,
    standardDiscount: Math.round(standardDiscount * 100) / 100,
    standardRetainedMargin: Math.round(standardRetainedMargin * 100) / 100,
    maxDiscount: Math.round(maxDiscount * 100) / 100,
    maxRetainedMargin: Math.round(maxRetainedMargin * 100) / 100,
  }
}

/**
 * Determine capacity status from availability percentage
 * 
 * - Hungry: >40% open
 * - Normal: 20-40% open
 * - Busy: <20% open
 */
export function getStatusFromAvailability(availabilityPercent: number): CapacityStatus {
  if (availabilityPercent > 40) return 'hungry'
  if (availabilityPercent >= 20) return 'normal'
  return 'busy'
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
