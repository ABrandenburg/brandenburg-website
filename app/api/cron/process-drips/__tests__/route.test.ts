import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock sendMessage
const mockSendMessage = vi.fn()
vi.mock('@/lib/messaging/send', () => ({
  sendMessage: (...args: unknown[]) => mockSendMessage(...args),
}))

// Mock advanceEnrollment
const mockAdvanceEnrollment = vi.fn().mockResolvedValue(undefined)
vi.mock('@/lib/sequences/engine', () => ({
  advanceEnrollment: (...args: unknown[]) => mockAdvanceEnrollment(...args),
}))

// Mock Supabase with chainable query builder
const mockSelect = vi.fn()
const mockSingle = vi.fn()
const mockMaybeSingle = vi.fn()
const mockUpdate = vi.fn()
const mockChain = {
  select: mockSelect,
  eq: vi.fn().mockReturnThis(),
  lte: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  in: vi.fn().mockReturnThis(),
  single: mockSingle,
  maybeSingle: mockMaybeSingle,
  update: mockUpdate,
}

// Each chain method returns itself
for (const method of ['select', 'eq', 'lte', 'order', 'limit', 'in']) {
  (mockChain as Record<string, ReturnType<typeof vi.fn>>)[method] = vi.fn().mockReturnValue(mockChain)
}
mockChain.update = vi.fn().mockReturnValue(mockChain)

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn().mockReturnValue(mockChain),
  })),
}))

import { GET } from '../route'

function makeRequest(headers?: Record<string, string>) {
  return new NextRequest('https://example.com/api/cron/process-drips', {
    method: 'GET',
    headers: { ...headers },
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubEnv('CRON_SECRET', 'test-cron-secret')
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-key')

  // Reset chain mocks
  for (const method of ['select', 'eq', 'lte', 'order', 'limit', 'in']) {
    (mockChain as Record<string, ReturnType<typeof vi.fn>>)[method].mockReturnValue(mockChain)
  }
  mockChain.update.mockReturnValue(mockChain)
})

describe('GET /api/cron/process-drips', () => {
  it('rejects unauthorized requests', async () => {
    const res = await GET(makeRequest({ authorization: 'Bearer wrong-secret' }))
    expect(res.status).toBe(401)
  })

  it('rejects missing auth header', async () => {
    const res = await GET(makeRequest())
    expect(res.status).toBe(401)
  })

  it('returns early when no pending messages', async () => {
    // First .select() call returns the pending messages query
    mockChain.limit.mockResolvedValueOnce({ data: [], error: null })

    const res = await GET(makeRequest({ authorization: 'Bearer test-cron-secret' }))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.message).toContain('No pending')
  })

  it('processes pending messages and sends them', async () => {
    // Pending messages query
    mockChain.limit.mockResolvedValueOnce({
      data: [{
        id: 'drip-1',
        enrollment_id: 'enr-1',
        customer_id: 'cust-1',
        message_body: 'Follow up!',
        attempts: 0,
      }],
      error: null,
    })

    // Enrollment check
    mockSingle.mockResolvedValueOnce({
      data: { status: 'active', conversation_id: 'conv-1' },
    })

    // Customer phone lookup
    mockSingle.mockResolvedValueOnce({
      data: { phone_e164: '+15127569847' },
    })

    // sendMessage succeeds
    mockSendMessage.mockResolvedValueOnce({ success: true })

    const res = await GET(makeRequest({ authorization: 'Bearer test-cron-secret' }))
    const body = await res.json()

    expect(body.sent).toBe(1)
    expect(mockSendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        to: '+15127569847',
        body: 'Follow up!',
        sender: 'drip_system',
        isUrgent: false,
      }),
    )
    expect(mockAdvanceEnrollment).toHaveBeenCalledWith('enr-1')
  })

  it('skips cancelled enrollments', async () => {
    mockChain.limit.mockResolvedValueOnce({
      data: [{
        id: 'drip-1',
        enrollment_id: 'enr-1',
        customer_id: 'cust-1',
        message_body: 'Follow up!',
        attempts: 0,
      }],
      error: null,
    })

    // Enrollment is cancelled
    mockSingle.mockResolvedValueOnce({
      data: { status: 'cancelled', conversation_id: 'conv-1' },
    })

    const res = await GET(makeRequest({ authorization: 'Bearer test-cron-secret' }))
    const body = await res.json()

    expect(body.skipped).toBe(1)
    expect(mockSendMessage).not.toHaveBeenCalled()
  })
})
