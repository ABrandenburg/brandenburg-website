import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  formatDate,
  formatDateForAPI,
  getDateRange,
  getPreviousDateRange,
  getFullDateRange,
  getDateRangeWithOffset,
  getDateRangeLabel,
  daysBetween,
  isValidDateString,
} from '../date-utils'

const FIXED_NOW = new Date('2025-06-15T12:00:00.000Z')

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(FIXED_NOW)
})

afterEach(() => {
  vi.useRealTimers()
})

describe('formatDate', () => {
  it('formats date as YYYY-MM-DD', () => {
    expect(formatDate(new Date('2025-06-15T12:00:00Z'))).toBe('2025-06-15')
  })

  it('formats beginning of year', () => {
    expect(formatDate(new Date('2025-01-01T00:00:00Z'))).toBe('2025-01-01')
  })

  it('formats end of year', () => {
    expect(formatDate(new Date('2025-12-31T23:59:59Z'))).toBe('2025-12-31')
  })
})

describe('formatDateForAPI', () => {
  it('returns ISO string', () => {
    const date = new Date('2025-06-15T12:00:00.000Z')
    expect(formatDateForAPI(date)).toBe('2025-06-15T12:00:00.000Z')
  })
})

describe('getDateRange', () => {
  it('endDate is a valid date string', () => {
    const range = getDateRange(7)
    expect(isValidDateString(range.endDate)).toBe(true)
    expect(isValidDateString(range.startDate)).toBe(true)
  })

  it('startDate is before endDate', () => {
    const range = getDateRange(7)
    expect(new Date(range.startDate).getTime()).toBeLessThan(new Date(range.endDate).getTime())
  })

  it('7-day range spans approximately 7 days', () => {
    const range = getDateRange(7)
    const span = daysBetween(range.startDate, range.endDate)
    // Exact span depends on local-to-UTC offset; 6 or 7 are both valid
    expect(span).toBeGreaterThanOrEqual(6)
    expect(span).toBeLessThanOrEqual(7)
  })

  it('30-day range spans approximately 30 days', () => {
    const range = getDateRange(30)
    const span = daysBetween(range.startDate, range.endDate)
    expect(span).toBeGreaterThanOrEqual(29)
    expect(span).toBeLessThanOrEqual(30)
  })

  it('90-day range spans approximately 90 days', () => {
    const range = getDateRange(90)
    const span = daysBetween(range.startDate, range.endDate)
    expect(span).toBeGreaterThanOrEqual(89)
    expect(span).toBeLessThanOrEqual(90)
  })

  it('365-day range spans approximately 365 days', () => {
    const range = getDateRange(365)
    const span = daysBetween(range.startDate, range.endDate)
    expect(span).toBeGreaterThanOrEqual(364)
    expect(span).toBeLessThanOrEqual(365)
  })
})

describe('getPreviousDateRange', () => {
  it('previous range ends near where current range starts', () => {
    const current = getDateRange(7)
    const previous = getPreviousDateRange(7)
    const gap = daysBetween(previous.endDate, current.startDate)
    expect(gap).toBeLessThanOrEqual(1)
  })

  it('previous range has same span as current range', () => {
    const current = getDateRange(7)
    const previous = getPreviousDateRange(7)
    expect(daysBetween(previous.startDate, previous.endDate))
      .toBe(daysBetween(current.startDate, current.endDate))
  })

  it('30-day previous matches current span', () => {
    const current = getDateRange(30)
    const previous = getPreviousDateRange(30)
    expect(daysBetween(previous.startDate, previous.endDate))
      .toBe(daysBetween(current.startDate, current.endDate))
  })
})

describe('getFullDateRange', () => {
  it('returns both current and previous ranges', () => {
    const full = getFullDateRange(7)
    const current = getDateRange(7)
    const previous = getPreviousDateRange(7)

    expect(full.startDate).toBe(current.startDate)
    expect(full.endDate).toBe(current.endDate)
    expect(full.previousStartDate).toBe(previous.startDate)
    expect(full.previousEndDate).toBe(previous.endDate)
  })
})

describe('getDateRangeWithOffset', () => {
  it('offset 0 matches getDateRange', () => {
    const range = getDateRangeWithOffset(7, 0)
    const normal = getDateRange(7)
    expect(range.startDate).toBe(normal.startDate)
    expect(range.endDate).toBe(normal.endDate)
  })

  it('offset shifts the range backward', () => {
    const noOffset = getDateRangeWithOffset(7, 0)
    const offset7 = getDateRangeWithOffset(7, 7)
    expect(new Date(offset7.endDate).getTime()).toBeLessThan(new Date(noOffset.endDate).getTime())
  })

  it('preserves span length across offset', () => {
    const range0 = getDateRangeWithOffset(7, 0)
    const range14 = getDateRangeWithOffset(7, 14)
    expect(daysBetween(range14.startDate, range14.endDate))
      .toBe(daysBetween(range0.startDate, range0.endDate))
  })
})

describe('getDateRangeLabel', () => {
  it('labels 7 days', () => {
    expect(getDateRangeLabel(7)).toBe('Last 7 Days')
  })

  it('labels 30 days', () => {
    expect(getDateRangeLabel(30)).toBe('Last 30 Days')
  })

  it('labels 90 days', () => {
    expect(getDateRangeLabel(90)).toBe('Last 90 Days')
  })

  it('labels 365 days', () => {
    expect(getDateRangeLabel(365)).toBe('Last Year')
  })
})

describe('daysBetween', () => {
  it('calculates days between two dates', () => {
    expect(daysBetween('2025-06-01', '2025-06-08')).toBe(7)
  })

  it('returns 0 for same date', () => {
    expect(daysBetween('2025-06-15', '2025-06-15')).toBe(0)
  })

  it('handles reversed order (absolute difference)', () => {
    expect(daysBetween('2025-06-15', '2025-06-01')).toBe(14)
  })

  it('handles cross-month', () => {
    expect(daysBetween('2025-01-15', '2025-02-15')).toBe(31)
  })

  it('handles cross-year', () => {
    expect(daysBetween('2024-12-31', '2025-01-01')).toBe(1)
  })
})

describe('isValidDateString', () => {
  it('validates YYYY-MM-DD', () => {
    expect(isValidDateString('2025-06-15')).toBe(true)
  })

  it('validates ISO string', () => {
    expect(isValidDateString('2025-06-15T12:00:00.000Z')).toBe(true)
  })

  it('rejects invalid date', () => {
    expect(isValidDateString('not-a-date')).toBe(false)
  })

  it('rejects empty string', () => {
    expect(isValidDateString('')).toBe(false)
  })
})
