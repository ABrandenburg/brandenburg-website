import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock dependencies
const mockLogWebhookEvent = vi.fn().mockResolvedValue('evt-1')
const mockMarkWebhookProcessed = vi.fn()
const mockMarkWebhookFailed = vi.fn()
vi.mock('@/lib/webhooks/log', () => ({
  logWebhookEvent: (...args: unknown[]) => mockLogWebhookEvent(...args),
  markWebhookProcessed: (...args: unknown[]) => mockMarkWebhookProcessed(...args),
  markWebhookFailed: (...args: unknown[]) => mockMarkWebhookFailed(...args),
}))

const mockNormalizePhone = vi.fn()
vi.mock('@/lib/webhooks/phone', () => ({
  normalizePhone: (...args: unknown[]) => mockNormalizePhone(...args),
}))

const mockIsSuppressed = vi.fn()
vi.mock('@/lib/webhooks/dedup', () => ({
  isSuppressed: (...args: unknown[]) => mockIsSuppressed(...args),
}))

const mockSendMessage = vi.fn().mockResolvedValue({ success: true })
vi.mock('@/lib/messaging/send', () => ({
  sendMessage: (...args: unknown[]) => mockSendMessage(...args),
}))

vi.mock('@/lib/messaging/templates', () => ({
  TCPA_MESSAGES: {
    STOP_CONFIRMED: 'You have been unsubscribed.',
    START_CONFIRMED: 'You have been re-subscribed.',
    HELP: 'Call (512) 756-9847 for help.',
  },
}))

const mockProcessWithAI = vi.fn().mockResolvedValue(null)
vi.mock('@/lib/ai/engine', () => ({
  processWithAI: (...args: unknown[]) => mockProcessWithAI(...args),
}))

const mockClassifyDripReply = vi.fn().mockResolvedValue('POSITIVE')
vi.mock('@/lib/ai/intent-classifier', () => ({
  classifyDripReply: (...args: unknown[]) => mockClassifyDripReply(...args),
}))

// Mock Supabase
const mockMaybeSingle = vi.fn()
const mockSingle = vi.fn()
const mockChain = {
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  upsert: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  in: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  single: mockSingle,
  maybeSingle: mockMaybeSingle,
}
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn().mockReturnValue(mockChain),
  })),
}))

import { POST } from '../route'

function makeFormRequest(params: Record<string, string>) {
  const body = new URLSearchParams(params)
  return new NextRequest('https://example.com/api/webhooks/twilio/inbound', {
    method: 'POST',
    body: body.toString(),
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-key')

  mockNormalizePhone.mockReturnValue('+15127569847')
  mockIsSuppressed.mockResolvedValue(false)

  // Reset chain
  for (const method of ['select', 'insert', 'update', 'delete', 'upsert', 'eq', 'in', 'order', 'limit']) {
    (mockChain as Record<string, ReturnType<typeof vi.fn>>)[method].mockReturnValue(mockChain)
  }
})

describe('POST /api/webhooks/twilio/inbound', () => {
  describe('TCPA keyword handling', () => {
    it('handles STOP keyword', async () => {
      mockMaybeSingle.mockResolvedValueOnce({ data: { id: 'cust-1' } }) // customer lookup for drip cancel

      const res = await POST(makeFormRequest({
        From: '+15127569847',
        Body: 'STOP',
        MessageSid: 'SM-stop-1',
      }))

      const text = await res.text()
      expect(text).toContain('unsubscribed')
      expect(res.headers.get('Content-Type')).toBe('text/xml')
    })

    it('handles lowercase stop', async () => {
      mockMaybeSingle.mockResolvedValueOnce({ data: { id: 'cust-1' } })

      const res = await POST(makeFormRequest({
        From: '+15127569847',
        Body: 'stop',
        MessageSid: 'SM-stop-2',
      }))

      const text = await res.text()
      expect(text).toContain('unsubscribed')
    })

    it('handles UNSUBSCRIBE keyword', async () => {
      mockMaybeSingle.mockResolvedValueOnce({ data: { id: 'cust-1' } })

      const res = await POST(makeFormRequest({
        From: '+15127569847',
        Body: 'UNSUBSCRIBE',
        MessageSid: 'SM-unsub-1',
      }))

      const text = await res.text()
      expect(text).toContain('unsubscribed')
    })

    it('handles START keyword', async () => {
      const res = await POST(makeFormRequest({
        From: '+15127569847',
        Body: 'START',
        MessageSid: 'SM-start-1',
      }))

      const text = await res.text()
      expect(text).toContain('re-subscribed')
    })

    it('handles HELP keyword', async () => {
      const res = await POST(makeFormRequest({
        From: '+15127569847',
        Body: 'HELP',
        MessageSid: 'SM-help-1',
      }))

      const text = await res.text()
      expect(text).toContain('(512) 756-9847')
    })
  })

  describe('invalid phone', () => {
    it('returns empty TwiML for invalid From number', async () => {
      mockNormalizePhone.mockReturnValue(null)

      const res = await POST(makeFormRequest({
        From: 'invalid',
        Body: 'Hello',
        MessageSid: 'SM-bad-phone',
      }))

      const text = await res.text()
      expect(text).toBe('<Response></Response>')
    })
  })

  describe('suppressed phone', () => {
    it('returns empty TwiML for suppressed numbers', async () => {
      mockIsSuppressed.mockResolvedValue(true)

      const res = await POST(makeFormRequest({
        From: '+15127569847',
        Body: 'Hello',
        MessageSid: 'SM-suppressed',
      }))

      const text = await res.text()
      expect(text).toBe('<Response></Response>')
    })
  })

  describe('normal message processing', () => {
    it('creates customer if not found and routes to AI', async () => {
      // Customer not found
      mockMaybeSingle.mockResolvedValueOnce({ data: null })
      // Create customer
      mockSingle.mockResolvedValueOnce({
        data: { id: 'new-cust', first_name: null, last_name: null },
      })
      // No active conversation
      mockMaybeSingle.mockResolvedValueOnce({ data: null })
      // Create conversation
      mockSingle.mockResolvedValueOnce({
        data: { id: 'new-conv', ai_enabled: true, status: 'new' },
      })
      // Message insert (no terminal method)
      // No active drip
      mockMaybeSingle.mockResolvedValueOnce({ data: null })

      const res = await POST(makeFormRequest({
        From: '+15127569847',
        Body: 'I need a plumber',
        MessageSid: 'SM-normal-1',
      }))

      const text = await res.text()
      expect(text).toBe('<Response></Response>')
      expect(mockProcessWithAI).toHaveBeenCalled()
    })
  })

  describe('error handling', () => {
    it('returns empty TwiML on unhandled error', async () => {
      mockLogWebhookEvent.mockRejectedValue(new Error('DB crash'))

      const res = await POST(makeFormRequest({
        From: '+15127569847',
        Body: 'Hello',
        MessageSid: 'SM-error',
      }))

      const text = await res.text()
      expect(text).toBe('<Response></Response>')
    })
  })
})
