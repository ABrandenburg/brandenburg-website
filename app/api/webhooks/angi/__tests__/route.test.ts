import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock all dependencies
const mockLogWebhookEvent = vi.fn().mockResolvedValue('evt-1')
const mockMarkWebhookProcessed = vi.fn().mockResolvedValue(undefined)
const mockMarkWebhookFailed = vi.fn().mockResolvedValue(undefined)
vi.mock('@/lib/webhooks/log', () => ({
  logWebhookEvent: (...args: unknown[]) => mockLogWebhookEvent(...args),
  markWebhookProcessed: (...args: unknown[]) => mockMarkWebhookProcessed(...args),
  markWebhookFailed: (...args: unknown[]) => mockMarkWebhookFailed(...args),
}))

const mockVerifyAngiWebhook = vi.fn()
vi.mock('@/lib/webhooks/verify', () => ({
  verifyAngiWebhook: (...args: unknown[]) => mockVerifyAngiWebhook(...args),
}))

const mockNormalizePhone = vi.fn()
vi.mock('@/lib/webhooks/phone', () => ({
  normalizePhone: (...args: unknown[]) => mockNormalizePhone(...args),
}))

const mockIsWebhookDuplicate = vi.fn()
const mockIsSuppressed = vi.fn()
const mockFindOrCreateCustomer = vi.fn()
const mockCreateConversation = vi.fn()
vi.mock('@/lib/webhooks/dedup', () => ({
  isWebhookDuplicate: (...args: unknown[]) => mockIsWebhookDuplicate(...args),
  isSuppressed: (...args: unknown[]) => mockIsSuppressed(...args),
  findOrCreateCustomer: (...args: unknown[]) => mockFindOrCreateCustomer(...args),
  createConversation: (...args: unknown[]) => mockCreateConversation(...args),
}))

const mockTriggerSpeedToLead = vi.fn().mockResolvedValue(undefined)
vi.mock('@/lib/ai/engine', () => ({
  triggerSpeedToLead: (...args: unknown[]) => mockTriggerSpeedToLead(...args),
}))

// Mock next/server's after() to be a no-op
vi.mock('next/server', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next/server')>()
  return {
    ...actual,
    after: vi.fn((fn: () => void) => fn()),
  }
})

import { POST } from '../route'

function makeRequest(payload: Record<string, unknown>, headers?: Record<string, string>) {
  return new NextRequest('https://example.com/api/webhooks/angi', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'content-type': 'application/json',
      ...headers,
    },
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  mockVerifyAngiWebhook.mockReturnValue(true)
  mockIsWebhookDuplicate.mockResolvedValue(false)
  mockIsSuppressed.mockResolvedValue(false)
  mockNormalizePhone.mockReturnValue('+15127569847')
  mockFindOrCreateCustomer.mockResolvedValue({ id: 'cust-1', isNew: true })
  mockCreateConversation.mockResolvedValue('conv-1')
})

const validPayload = {
  leadOid: 'angi-lead-123',
  customerPhone: '5127569847',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  description: 'Water heater repair',
  crmKey: 'test-api-key',
}

describe('POST /api/webhooks/angi', () => {
  it('processes a valid lead end-to-end', async () => {
    const res = await POST(makeRequest(validPayload))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.received).toBe(true)
    expect(body.conversationId).toBe('conv-1')
    expect(mockLogWebhookEvent).toHaveBeenCalled()
    expect(mockMarkWebhookProcessed).toHaveBeenCalledWith('evt-1')
  })

  it('always returns 200 even on auth failure', async () => {
    mockVerifyAngiWebhook.mockReturnValue(false)
    const res = await POST(makeRequest(validPayload))
    expect(res.status).toBe(200)
    expect(mockMarkWebhookFailed).toHaveBeenCalledWith('evt-1', 'Authentication failed')
  })

  it('detects duplicate webhooks', async () => {
    mockIsWebhookDuplicate.mockResolvedValue(true)
    const res = await POST(makeRequest(validPayload))
    const body = await res.json()

    expect(body.duplicate).toBe(true)
    expect(mockFindOrCreateCustomer).not.toHaveBeenCalled()
  })

  it('fails gracefully when phone is invalid', async () => {
    mockNormalizePhone.mockReturnValue(null)
    const res = await POST(makeRequest(validPayload))
    expect(res.status).toBe(200)
    expect(mockMarkWebhookFailed).toHaveBeenCalledWith('evt-1', 'No valid phone number')
  })

  it('skips suppressed phone numbers', async () => {
    mockIsSuppressed.mockResolvedValue(true)
    const res = await POST(makeRequest(validPayload))
    const body = await res.json()

    expect(body.suppressed).toBe(true)
    expect(mockFindOrCreateCustomer).not.toHaveBeenCalled()
  })

  it('reads crmKey from payload', async () => {
    await POST(makeRequest(validPayload))
    expect(mockVerifyAngiWebhook).toHaveBeenCalledWith('test-api-key')
  })

  it('reads x-api-key from header', async () => {
    const { crmKey, ...payloadWithoutKey } = validPayload
    await POST(makeRequest(payloadWithoutKey, { 'x-api-key': 'header-key' }))
    expect(mockVerifyAngiWebhook).toHaveBeenCalledWith('header-key')
  })

  it('triggers speed-to-lead after processing', async () => {
    await POST(makeRequest(validPayload))
    expect(mockTriggerSpeedToLead).toHaveBeenCalledWith(
      expect.objectContaining({
        conversationId: 'conv-1',
        customerId: 'cust-1',
        customerPhone: '+15127569847',
        source: 'angi',
      }),
    )
  })

  it('always returns 200 on unhandled errors', async () => {
    mockLogWebhookEvent.mockRejectedValue(new Error('DB down'))
    const res = await POST(makeRequest(validPayload))
    expect(res.status).toBe(200)
  })
})
