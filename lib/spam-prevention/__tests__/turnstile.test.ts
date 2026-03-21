import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock global fetch
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

import { verifyTurnstileToken } from '../turnstile'

beforeEach(() => {
  vi.unstubAllEnvs()
  mockFetch.mockReset()
})

describe('verifyTurnstileToken', () => {
  describe('when secret key is not configured', () => {
    beforeEach(() => {
      vi.stubEnv('TURNSTILE_SECRET_KEY', '')
    })

    it('returns success in development mode', async () => {
      vi.stubEnv('NODE_ENV', 'development')
      const result = await verifyTurnstileToken('any-token')
      expect(result.success).toBe(true)
    })

    it('returns failure in production', async () => {
      vi.stubEnv('NODE_ENV', 'production')
      const result = await verifyTurnstileToken('any-token')
      expect(result.success).toBe(false)
      expect(result.error).toContain('not configured')
    })
  })

  describe('test token bypass', () => {
    it('returns success for dummy token', async () => {
      vi.stubEnv('TURNSTILE_SECRET_KEY', 'real-key')
      const result = await verifyTurnstileToken('XXXX.DUMMY.TOKEN.XXXX')
      expect(result.success).toBe(true)
      expect(mockFetch).not.toHaveBeenCalled()
    })
  })

  describe('Cloudflare API verification', () => {
    beforeEach(() => {
      vi.stubEnv('TURNSTILE_SECRET_KEY', 'test-secret')
    })

    it('returns success when Cloudflare validates', async () => {
      mockFetch.mockResolvedValue({
        json: () => Promise.resolve({
          success: true,
          challenge_ts: '2025-01-01T00:00:00Z',
          hostname: 'example.com',
        }),
      })

      const result = await verifyTurnstileToken('valid-token')
      expect(result.success).toBe(true)
      expect(result.challengeTs).toBe('2025-01-01T00:00:00Z')
      expect(result.hostname).toBe('example.com')
    })

    it('returns failure when Cloudflare rejects', async () => {
      mockFetch.mockResolvedValue({
        json: () => Promise.resolve({
          success: false,
          'error-codes': ['invalid-input-response'],
        }),
      })

      const result = await verifyTurnstileToken('bad-token')
      expect(result.success).toBe(false)
      expect(result.error).toContain('invalid-input-response')
    })

    it('returns failure with generic message when no error codes', async () => {
      mockFetch.mockResolvedValue({
        json: () => Promise.resolve({ success: false }),
      })

      const result = await verifyTurnstileToken('bad-token')
      expect(result.success).toBe(false)
      expect(result.error).toBe('Verification failed')
    })

    it('passes remoteIp when provided', async () => {
      mockFetch.mockResolvedValue({
        json: () => Promise.resolve({ success: true }),
      })

      await verifyTurnstileToken('token', '1.2.3.4')

      const callArgs = mockFetch.mock.calls[0]
      const body = callArgs[1].body as URLSearchParams
      expect(body.get('remoteip')).toBe('1.2.3.4')
    })

    it('sends secret and response token', async () => {
      mockFetch.mockResolvedValue({
        json: () => Promise.resolve({ success: true }),
      })

      await verifyTurnstileToken('my-token')

      const callArgs = mockFetch.mock.calls[0]
      expect(callArgs[0]).toContain('turnstile')
      const body = callArgs[1].body as URLSearchParams
      expect(body.get('secret')).toBe('test-secret')
      expect(body.get('response')).toBe('my-token')
    })

    it('handles fetch errors gracefully', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))

      const result = await verifyTurnstileToken('token')
      expect(result.success).toBe(false)
      expect(result.error).toBe('Verification request failed')
    })
  })
})
