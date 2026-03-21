import { describe, it, expect } from 'vitest'
import {
  calculateDiscounts,
  getStatusFromAvailability,
  formatCurrency,
  type CapacityStatus,
} from '../discount-calculator'

describe('getStatusFromAvailability', () => {
  it('returns hungry when > 40%', () => {
    expect(getStatusFromAvailability(41)).toBe('hungry')
    expect(getStatusFromAvailability(50)).toBe('hungry')
    expect(getStatusFromAvailability(100)).toBe('hungry')
  })

  it('returns normal when 20-40% (inclusive)', () => {
    expect(getStatusFromAvailability(20)).toBe('normal')
    expect(getStatusFromAvailability(30)).toBe('normal')
    expect(getStatusFromAvailability(40)).toBe('normal')
  })

  it('returns busy when < 20%', () => {
    expect(getStatusFromAvailability(19)).toBe('busy')
    expect(getStatusFromAvailability(10)).toBe('busy')
    expect(getStatusFromAvailability(0)).toBe('busy')
  })

  // Boundary tests
  it('boundary: 40 is normal (not hungry)', () => {
    expect(getStatusFromAvailability(40)).toBe('normal')
  })

  it('boundary: 40.01 is hungry', () => {
    expect(getStatusFromAvailability(40.01)).toBe('hungry')
  })

  it('boundary: 20 is normal (not busy)', () => {
    expect(getStatusFromAvailability(20)).toBe('normal')
  })

  it('boundary: 19.99 is busy', () => {
    expect(getStatusFromAvailability(19.99)).toBe('busy')
  })
})

describe('calculateDiscounts', () => {
  describe('hungry status (30% sacrifice)', () => {
    const status: CapacityStatus = 'hungry'

    it('calculates discounts on $10,000 margin', () => {
      const result = calculateDiscounts(10000, status, 50)
      expect(result.status).toBe('hungry')
      expect(result.grossMargin).toBe(10000)
      expect(result.maxSacrificePercent).toBe(30)
      expect(result.maxSacrificeAmount).toBe(3000) // 10000 * 0.30
      expect(result.standardDiscount).toBe(1000) // min(1500, 1000) — capped
      expect(result.maxDiscount).toBe(3000) // min(3000, 5000)
    })

    it('caps standard discount at $1,000', () => {
      // 5000 * 0.30 = 1500 sacrifice, 50% = 750 < 1000 cap → 750
      const result = calculateDiscounts(5000, status, 50)
      expect(result.standardDiscount).toBe(750)

      // 10000 * 0.30 = 3000, 50% = 1500 > 1000 → capped at 1000
      const result2 = calculateDiscounts(10000, status, 50)
      expect(result2.standardDiscount).toBe(1000)
    })

    it('caps max discount at $5,000', () => {
      // 20000 * 0.30 = 6000 > 5000 → capped at 5000
      const result = calculateDiscounts(20000, status, 50)
      expect(result.maxDiscount).toBe(5000)
    })

    it('calculates retained margins correctly', () => {
      const result = calculateDiscounts(10000, status, 50)
      expect(result.standardRetainedMargin).toBe(10000 - result.standardDiscount)
      expect(result.maxRetainedMargin).toBe(10000 - result.maxDiscount)
    })

    it('handles small margin', () => {
      const result = calculateDiscounts(100, status, 50)
      expect(result.maxSacrificeAmount).toBe(30) // 100 * 0.30
      expect(result.standardDiscount).toBe(15) // 30 * 0.5
      expect(result.maxDiscount).toBe(30)
    })
  })

  describe('normal status (15% sacrifice)', () => {
    const status: CapacityStatus = 'normal'

    it('calculates discounts on $10,000 margin', () => {
      const result = calculateDiscounts(10000, status, 30)
      expect(result.maxSacrificePercent).toBe(15)
      expect(result.maxSacrificeAmount).toBe(1500) // 10000 * 0.15
      expect(result.standardDiscount).toBe(750) // 1500 * 0.5
      expect(result.maxDiscount).toBe(1500)
    })

    it('caps standard discount at $1,000', () => {
      // 20000 * 0.15 = 3000, 50% = 1500 > 1000 → capped
      const result = calculateDiscounts(20000, status, 30)
      expect(result.standardDiscount).toBe(1000)
    })

    it('caps max discount at $5,000', () => {
      // 40000 * 0.15 = 6000 > 5000 → capped
      const result = calculateDiscounts(40000, status, 30)
      expect(result.maxDiscount).toBe(5000)
    })
  })

  describe('busy status (no discounts)', () => {
    const status: CapacityStatus = 'busy'

    it('returns zero discounts', () => {
      const result = calculateDiscounts(10000, status, 10)
      expect(result.maxSacrificeAmount).toBe(0)
      expect(result.standardDiscount).toBe(0)
      expect(result.maxDiscount).toBe(0)
    })

    it('retains full margin', () => {
      const result = calculateDiscounts(10000, status, 10)
      expect(result.standardRetainedMargin).toBe(10000)
      expect(result.maxRetainedMargin).toBe(10000)
    })
  })

  describe('rounding', () => {
    it('rounds to 2 decimal places', () => {
      // 333 * 0.30 = 99.9
      const result = calculateDiscounts(333, 'hungry', 50)
      expect(result.maxSacrificeAmount).toBe(99.9)
      expect(result.standardDiscount).toBe(49.95)
    })

    it('rounds correctly for fractional cents', () => {
      // 111.11 * 0.15 = 16.6665
      const result = calculateDiscounts(111.11, 'normal', 30)
      expect(result.maxSacrificeAmount).toBe(16.67) // Math.round(16.6665 * 100) / 100
    })
  })

  describe('edge cases', () => {
    it('handles zero margin', () => {
      const result = calculateDiscounts(0, 'hungry', 50)
      expect(result.standardDiscount).toBe(0)
      expect(result.maxDiscount).toBe(0)
    })

    it('preserves status and availability in result', () => {
      const result = calculateDiscounts(5000, 'normal', 35)
      expect(result.status).toBe('normal')
      expect(result.availabilityPercent).toBe(35)
    })
  })
})

describe('formatCurrency', () => {
  it('formats whole dollar amounts', () => {
    expect(formatCurrency(1000)).toBe('$1,000')
  })

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0')
  })

  it('formats large numbers with commas', () => {
    expect(formatCurrency(5000)).toBe('$5,000')
    expect(formatCurrency(100000)).toBe('$100,000')
  })

  it('rounds decimal amounts (no fraction digits)', () => {
    expect(formatCurrency(999.99)).toBe('$1,000')
    expect(formatCurrency(49.5)).toBe('$50')
  })

  it('formats negative numbers', () => {
    expect(formatCurrency(-500)).toBe('-$500')
  })
})
