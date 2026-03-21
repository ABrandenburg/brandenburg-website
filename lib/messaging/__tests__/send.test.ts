import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Supabase
const mockMaybeSingle = vi.fn()
const mockSingle = vi.fn()
const mockSupabaseChain = {
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  gte: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  single: mockSingle,
  maybeSingle: mockMaybeSingle,
}
const mockFrom = vi.fn().mockReturnValue(mockSupabaseChain)

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({ from: mockFrom })),
}))

// Mock twilio
const mockTwilioCreate = vi.fn()
vi.mock('twilio', () => ({
  default: vi.fn(() => ({
    messages: { create: mockTwilioCreate },
  })),
}))

beforeEach(() => {
  vi.unstubAllEnvs()
  mockFrom.mockClear()
  mockMaybeSingle.mockReset()
  mockSingle.mockReset()
  mockTwilioCreate.mockReset()

  // Reset chain mocks
  for (const method of ['select', 'insert', 'update', 'eq', 'gte', 'limit']) {
    (mockSupabaseChain as Record<string, ReturnType<typeof vi.fn>>)[method].mockReturnValue(mockSupabaseChain)
  }

  // Default: Supabase credentials set
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-key')
})

// Note: sendMessage reads TWILIO_* env vars at MODULE scope.
// We must set env BEFORE importing to test Twilio config paths.
// For tests where we need Twilio configured, we'll use a separate import approach.

describe('sendMessage', () => {
  const baseParams = {
    to: '+15127569847',
    body: 'Hello!',
    conversationId: 'conv-1',
    customerId: 'cust-1',
    sender: 'ai_chris' as const,
  }

  describe('suppression check', () => {
    it('blocks suppressed phone numbers', async () => {
      // Phone is on suppression list
      mockMaybeSingle.mockResolvedValueOnce({ data: { id: 'sup-1' } })

      const { sendMessage } = await import('../send')
      const result = await sendMessage(baseParams)

      expect(result.success).toBe(false)
      expect(result.blocked).toBe('suppressed')
    })

    it('proceeds when phone is not suppressed', async () => {
      // Not suppressed
      mockMaybeSingle.mockResolvedValueOnce({ data: null })
      // Twilio not configured → will stop at step 4
      vi.stubEnv('TWILIO_ACCOUNT_SID', '')
      vi.stubEnv('TWILIO_AUTH_TOKEN', '')
      vi.stubEnv('TWILIO_PHONE_NUMBER', '')

      // DB insert for logging
      mockSingle.mockResolvedValueOnce({ data: { id: 'msg-1' } })

      const { sendMessage } = await import('../send')
      const result = await sendMessage(baseParams)

      // Should get past suppression check (even if blocked for other reason)
      expect(result.blocked).not.toBe('suppressed')
    })
  })

  describe('business hours check', () => {
    it('blocks drip messages outside business hours', async () => {
      // Not suppressed
      mockMaybeSingle.mockResolvedValueOnce({ data: null })

      // Set time to 3am CT (outside 8am-7pm)
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2025-06-15T08:00:00.000Z')) // 3am CDT

      const { sendMessage } = await import('../send')
      const result = await sendMessage({
        ...baseParams,
        sender: 'drip_system',
        isUrgent: false,
      })

      vi.useRealTimers()

      expect(result.success).toBe(false)
      expect(result.blocked).toBe('outside_hours')
    })

    it('allows urgent messages outside business hours', async () => {
      // Not suppressed
      mockMaybeSingle.mockResolvedValueOnce({ data: null })
      // No Twilio configured
      mockSingle.mockResolvedValueOnce({ data: { id: 'msg-1' } })

      vi.useFakeTimers()
      vi.setSystemTime(new Date('2025-06-15T08:00:00.000Z')) // 3am CDT

      const { sendMessage } = await import('../send')
      const result = await sendMessage({
        ...baseParams,
        sender: 'drip_system',
        isUrgent: true,
      })

      vi.useRealTimers()

      expect(result.blocked).not.toBe('outside_hours')
    })
  })

  describe('rate limiting', () => {
    it('blocks drip messages when customer was recently messaged', async () => {
      // Not suppressed
      mockMaybeSingle.mockResolvedValueOnce({ data: null })
      // Was messaged recently
      mockMaybeSingle.mockResolvedValueOnce({ data: { id: 'recent-msg' } })

      vi.useFakeTimers()
      vi.setSystemTime(new Date('2025-06-15T18:00:00.000Z')) // 1pm CDT (business hours)

      const { sendMessage } = await import('../send')
      const result = await sendMessage({
        ...baseParams,
        sender: 'drip_system',
        isUrgent: false,
      })

      vi.useRealTimers()

      expect(result.success).toBe(false)
      expect(result.blocked).toBe('rate_limited')
    })
  })

  describe('twilio not configured', () => {
    it('logs message in DB but returns failure', async () => {
      // Not suppressed
      mockMaybeSingle.mockResolvedValueOnce({ data: null })
      // DB insert
      mockSingle.mockResolvedValueOnce({ data: { id: 'msg-1' } })

      vi.stubEnv('TWILIO_ACCOUNT_SID', '')
      vi.stubEnv('TWILIO_AUTH_TOKEN', '')
      vi.stubEnv('TWILIO_PHONE_NUMBER', '')

      const { sendMessage } = await import('../send')
      const result = await sendMessage(baseParams)

      expect(result.blocked).toBe('twilio_not_configured')
      expect(result.messageId).toBe('msg-1')
    })
  })
})
