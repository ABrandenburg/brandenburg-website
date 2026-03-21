import { describe, it, expect, vi, beforeEach } from 'vitest'
import crypto from 'crypto'

// Mock twilio module
vi.mock('twilio', () => ({
  default: {
    validateRequest: vi.fn(),
  },
}))

import {
  verifyAngiWebhook,
  verifyThumbtackWebhook,
  verifyGoogleLsaWebhook,
  verifyServiceTitanWebhook,
  verifyTwilioWebhook,
} from '../verify'

beforeEach(() => {
  vi.unstubAllEnvs()
})

describe('verifyAngiWebhook', () => {
  it('returns true for matching API key', () => {
    vi.stubEnv('ANGI_API_KEY', 'test-angi-key')
    expect(verifyAngiWebhook('test-angi-key')).toBe(true)
  })

  it('returns false for non-matching key', () => {
    vi.stubEnv('ANGI_API_KEY', 'real-key')
    expect(verifyAngiWebhook('wrong-key')).toBe(false)
  })

  it('returns false when env var not set', () => {
    vi.stubEnv('ANGI_API_KEY', '')
    expect(verifyAngiWebhook('any-key')).toBe(false)
  })

  it('returns false when apiKey is null', () => {
    vi.stubEnv('ANGI_API_KEY', 'real-key')
    expect(verifyAngiWebhook(null)).toBe(false)
  })
})

describe('verifyThumbtackWebhook', () => {
  const secret = 'tt-secret-key'

  function computeHmac(payload: string): string {
    return crypto.createHmac('sha256', secret).update(payload).digest('hex')
  }

  it('returns true for valid HMAC signature', () => {
    vi.stubEnv('TT_WEBHOOK_SECRET', secret)
    const payload = '{"leadId":"123"}'
    const sig = computeHmac(payload)
    expect(verifyThumbtackWebhook(payload, sig)).toBe(true)
  })

  it('returns false for invalid signature', () => {
    vi.stubEnv('TT_WEBHOOK_SECRET', secret)
    expect(verifyThumbtackWebhook('payload', 'badsig')).toBe(false)
  })

  it('returns false when secret not configured', () => {
    vi.stubEnv('TT_WEBHOOK_SECRET', '')
    expect(verifyThumbtackWebhook('payload', 'sig')).toBe(false)
  })

  it('returns false when signature is null', () => {
    vi.stubEnv('TT_WEBHOOK_SECRET', secret)
    expect(verifyThumbtackWebhook('payload', null)).toBe(false)
  })

  it('returns false when payload differs', () => {
    vi.stubEnv('TT_WEBHOOK_SECRET', secret)
    const sig = computeHmac('original')
    expect(verifyThumbtackWebhook('tampered', sig)).toBe(false)
  })
})

describe('verifyGoogleLsaWebhook', () => {
  it('returns true for matching key', () => {
    vi.stubEnv('GOOGLE_LSA_WEBHOOK_KEY', 'google-key')
    expect(verifyGoogleLsaWebhook('google-key')).toBe(true)
  })

  it('returns false for wrong key', () => {
    vi.stubEnv('GOOGLE_LSA_WEBHOOK_KEY', 'google-key')
    expect(verifyGoogleLsaWebhook('wrong')).toBe(false)
  })

  it('returns false when env not set', () => {
    vi.stubEnv('GOOGLE_LSA_WEBHOOK_KEY', '')
    expect(verifyGoogleLsaWebhook('key')).toBe(false)
  })

  it('returns false for null key', () => {
    vi.stubEnv('GOOGLE_LSA_WEBHOOK_KEY', 'key')
    expect(verifyGoogleLsaWebhook(null)).toBe(false)
  })
})

describe('verifyServiceTitanWebhook', () => {
  const secret = 'st-hmac-key'

  function computeHmac(payload: string): string {
    return crypto.createHmac('sha256', secret).update(payload).digest('hex')
  }

  it('returns true for valid HMAC', () => {
    vi.stubEnv('ST_WEBHOOK_HMAC_KEY', secret)
    const payload = '{"event":"job.complete"}'
    const sig = computeHmac(payload)
    expect(verifyServiceTitanWebhook(payload, sig)).toBe(true)
  })

  it('returns false for invalid signature', () => {
    vi.stubEnv('ST_WEBHOOK_HMAC_KEY', secret)
    expect(verifyServiceTitanWebhook('payload', 'badsig')).toBe(false)
  })

  it('returns false when secret missing', () => {
    vi.stubEnv('ST_WEBHOOK_HMAC_KEY', '')
    expect(verifyServiceTitanWebhook('payload', 'sig')).toBe(false)
  })

  it('returns false for null signature', () => {
    vi.stubEnv('ST_WEBHOOK_HMAC_KEY', secret)
    expect(verifyServiceTitanWebhook('payload', null)).toBe(false)
  })
})

describe('verifyTwilioWebhook', () => {
  it('returns true when twilio validates', async () => {
    vi.stubEnv('TWILIO_AUTH_TOKEN', 'twilio-token')
    const twilio = await import('twilio')
    vi.mocked(twilio.default.validateRequest).mockReturnValue(true)

    const result = await verifyTwilioWebhook(
      'https://example.com/webhook',
      { Body: 'Hello' },
      'valid-sig',
    )
    expect(result).toBe(true)
  })

  it('returns false when twilio rejects', async () => {
    vi.stubEnv('TWILIO_AUTH_TOKEN', 'twilio-token')
    const twilio = await import('twilio')
    vi.mocked(twilio.default.validateRequest).mockReturnValue(false)

    const result = await verifyTwilioWebhook(
      'https://example.com/webhook',
      { Body: 'Hello' },
      'bad-sig',
    )
    expect(result).toBe(false)
  })

  it('returns false when auth token not set', async () => {
    vi.stubEnv('TWILIO_AUTH_TOKEN', '')
    const result = await verifyTwilioWebhook('url', {}, 'sig')
    expect(result).toBe(false)
  })

  it('returns false when signature is null', async () => {
    vi.stubEnv('TWILIO_AUTH_TOKEN', 'token')
    const result = await verifyTwilioWebhook('url', {}, null)
    expect(result).toBe(false)
  })

  it('returns false when twilio throws', async () => {
    vi.stubEnv('TWILIO_AUTH_TOKEN', 'token')
    const twilio = await import('twilio')
    vi.mocked(twilio.default.validateRequest).mockImplementation(() => {
      throw new Error('SDK error')
    })

    const result = await verifyTwilioWebhook('url', {}, 'sig')
    expect(result).toBe(false)
  })
})
