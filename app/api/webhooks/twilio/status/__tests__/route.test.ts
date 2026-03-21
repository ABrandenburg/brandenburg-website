import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const mockLogWebhookEvent = vi.fn().mockResolvedValue('evt-1')
const mockMarkWebhookProcessed = vi.fn()
vi.mock('@/lib/webhooks/log', () => ({
  logWebhookEvent: (...args: unknown[]) => mockLogWebhookEvent(...args),
  markWebhookProcessed: (...args: unknown[]) => mockMarkWebhookProcessed(...args),
}))

// Mock Supabase
const mockUpdate = vi.fn().mockReturnThis()
const mockEq = vi.fn().mockResolvedValue({ error: null })
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn().mockReturnValue({
      update: mockUpdate,
      eq: mockEq,
    }),
  })),
}))

import { POST } from '../route'

function makeFormRequest(params: Record<string, string>) {
  const body = new URLSearchParams(params)
  return new NextRequest('https://example.com/api/webhooks/twilio/status', {
    method: 'POST',
    body: body.toString(),
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-key')
  mockUpdate.mockReturnValue({ eq: mockEq })
})

describe('POST /api/webhooks/twilio/status', () => {
  it('updates message delivery status', async () => {
    const res = await POST(makeFormRequest({
      MessageSid: 'SM123',
      MessageStatus: 'delivered',
    }))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.received).toBe(true)
    expect(mockUpdate).toHaveBeenCalled()
  })

  it('maps "undelivered" to "failed"', async () => {
    await POST(makeFormRequest({
      MessageSid: 'SM456',
      MessageStatus: 'undelivered',
    }))

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        delivery_status: 'failed',
      }),
    )
  })

  it('maps "delivered" to "delivered"', async () => {
    await POST(makeFormRequest({
      MessageSid: 'SM789',
      MessageStatus: 'delivered',
    }))

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        delivery_status: 'delivered',
      }),
    )
  })

  it('returns 200 when missing SID or status', async () => {
    const res = await POST(makeFormRequest({}))
    expect(res.status).toBe(200)
  })

  it('always returns 200 on errors', async () => {
    mockLogWebhookEvent.mockRejectedValue(new Error('fail'))
    const res = await POST(makeFormRequest({
      MessageSid: 'SM000',
      MessageStatus: 'sent',
    }))
    expect(res.status).toBe(200)
  })
})
