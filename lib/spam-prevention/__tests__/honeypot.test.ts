import { describe, it, expect } from 'vitest'
import { validateHoneypot, HONEYPOT_FIELD_NAME } from '../honeypot'

describe('HONEYPOT_FIELD_NAME', () => {
  it('is a string constant', () => {
    expect(typeof HONEYPOT_FIELD_NAME).toBe('string')
    expect(HONEYPOT_FIELD_NAME).toBe('website_url')
  })
})

describe('validateHoneypot', () => {
  // Not spam cases
  it('passes when value is null', () => {
    expect(validateHoneypot(null)).toEqual({ isSpam: false })
  })

  it('passes when value is undefined', () => {
    expect(validateHoneypot(undefined)).toEqual({ isSpam: false })
  })

  it('passes when value is empty string', () => {
    expect(validateHoneypot('')).toEqual({ isSpam: false })
  })

  it('passes when value is whitespace only', () => {
    expect(validateHoneypot('   ')).toEqual({ isSpam: false })
    expect(validateHoneypot('\t\n')).toEqual({ isSpam: false })
  })

  // Spam cases
  it('detects spam when field has a URL', () => {
    const result = validateHoneypot('http://spam.com')
    expect(result.isSpam).toBe(true)
    expect(result.reason).toBeDefined()
  })

  it('detects spam when field has any text', () => {
    const result = validateHoneypot('anything')
    expect(result.isSpam).toBe(true)
  })

  it('detects spam when field has a single character', () => {
    const result = validateHoneypot('x')
    expect(result.isSpam).toBe(true)
  })
})
