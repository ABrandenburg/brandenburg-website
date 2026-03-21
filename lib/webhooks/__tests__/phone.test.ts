import { describe, it, expect } from 'vitest'
import { normalizePhone, formatPhoneDisplay, isValidE164 } from '../phone'

describe('normalizePhone', () => {
  // Standard US formats
  it('normalizes 10-digit number', () => {
    expect(normalizePhone('5127569847')).toBe('+15127569847')
  })

  it('normalizes dashed format', () => {
    expect(normalizePhone('512-756-9847')).toBe('+15127569847')
  })

  it('normalizes parenthesized format', () => {
    expect(normalizePhone('(512) 756-9847')).toBe('+15127569847')
  })

  it('normalizes dotted format', () => {
    expect(normalizePhone('512.756.9847')).toBe('+15127569847')
  })

  it('normalizes spaced format', () => {
    expect(normalizePhone('512 756 9847')).toBe('+15127569847')
  })

  // With country code
  it('normalizes 11-digit with leading 1', () => {
    expect(normalizePhone('15127569847')).toBe('+15127569847')
  })

  it('normalizes +1 prefix', () => {
    expect(normalizePhone('+15127569847')).toBe('+15127569847')
  })

  it('normalizes +1 with formatting', () => {
    expect(normalizePhone('+1 (512) 756-9847')).toBe('+15127569847')
  })

  it('normalizes 1- prefix format', () => {
    expect(normalizePhone('1-512-756-9847')).toBe('+15127569847')
  })

  // Edge cases
  it('returns null for null', () => {
    expect(normalizePhone(null)).toBeNull()
  })

  it('returns null for undefined', () => {
    expect(normalizePhone(undefined)).toBeNull()
  })

  it('returns null for empty string', () => {
    expect(normalizePhone('')).toBeNull()
  })

  it('returns null for too-short number', () => {
    expect(normalizePhone('12345')).toBeNull()
  })

  it('returns null for too-long number', () => {
    expect(normalizePhone('12345678901234567')).toBeNull()
  })

  it('strips non-numeric characters and normalizes by digit count', () => {
    // 13 digits after stripping → goes through the 10-15 digit catch-all path
    expect(normalizePhone('(512) 756-9847 ext. 123')).toBe('+5127569847123')
  })

  // International-looking numbers (10-15 digits, non-US)
  it('handles international-length number with +', () => {
    expect(normalizePhone('+442071234567')).toBe('+442071234567')
  })
})

describe('formatPhoneDisplay', () => {
  it('formats US E.164 to display format', () => {
    expect(formatPhoneDisplay('+15127569847')).toBe('(512) 756-9847')
  })

  it('formats another US number', () => {
    expect(formatPhoneDisplay('+12025551234')).toBe('(202) 555-1234')
  })

  // Pass-through for non-US
  it('returns non-US E.164 as-is', () => {
    expect(formatPhoneDisplay('+442071234567')).toBe('+442071234567')
  })

  it('returns short number as-is', () => {
    expect(formatPhoneDisplay('+1512')).toBe('+1512')
  })

  // Edge cases
  it('returns empty string for empty input', () => {
    expect(formatPhoneDisplay('')).toBe('')
  })

  it('returns empty string for null-ish input', () => {
    // @ts-expect-error testing runtime behavior
    expect(formatPhoneDisplay(null)).toBe('')
    // @ts-expect-error testing runtime behavior
    expect(formatPhoneDisplay(undefined)).toBe('')
  })
})

describe('isValidE164', () => {
  it('validates US E.164 number', () => {
    expect(isValidE164('+15127569847')).toBe(true)
  })

  it('validates UK E.164 number', () => {
    expect(isValidE164('+442071234567')).toBe(true)
  })

  it('validates minimum length (10 digits + country code)', () => {
    expect(isValidE164('+1234567890')).toBe(true)
  })

  it('validates maximum length (15 digits)', () => {
    expect(isValidE164('+123456789012345')).toBe(true)
  })

  it('rejects missing + prefix', () => {
    expect(isValidE164('15127569847')).toBe(false)
  })

  it('rejects leading zero in country code', () => {
    expect(isValidE164('+0127569847')).toBe(false)
  })

  it('rejects too-short number', () => {
    expect(isValidE164('+123456789')).toBe(false)
  })

  it('rejects too-long number', () => {
    expect(isValidE164('+1234567890123456')).toBe(false)
  })

  it('rejects non-numeric characters', () => {
    expect(isValidE164('+1512-756-9847')).toBe(false)
  })

  it('rejects empty string', () => {
    expect(isValidE164('')).toBe(false)
  })
})
