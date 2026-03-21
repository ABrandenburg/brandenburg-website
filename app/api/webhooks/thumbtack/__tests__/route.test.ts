import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const mockLogWebhookEvent = vi.fn().mockResolvedValue('evt-1')
const mockMarkWebhookProcessed = vi.fn()
const mockMarkWebhookFailed = vi.fn()
vi.mock('@/lib/webhooks/log', () => ({
  logWebhookEvent: (...args: unknown[]) => mockLogWebhookEvent(...args),
  markWebhookProcessed: (...args: unknown[]) => mockMarkWebhookProcessed(...args),
  markWebhookFailed: (...args: unknown[]) => mockMarkWebhookFailed(...args),
}))

const mockVerifyThumbtack = vi.fn()
vi.mock('@/lib/webhooks/verify', () => ({
  verifyThumbtackWebhook: (...args: unknown[]) => mockVerifyThumbtack(...args),
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

vi.mock('next/server', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next/server')>()
  return { ...actual, after: vi.fn((fn: () => void) => fn()) }
})

import { POST } from '../route'

function makeRequest(payload: Record<string, unknown>, headers?: Record<string, string>) {
  return new NextRequest('https://example.com/api/webhooks/thumbtack', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: { 'content-type': 'application/json', ...headers },
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  mockVerifyThumbtack.mockReturnValue(true)
  mockIsWebhookDuplicate.mockResolvedValue(false)
  mockIsSuppressed.mockResolvedValue(false)
  mockNormalizePhone.mockReturnValue('+15127569847')
  mockFindOrCreateCustomer.mockResolvedValue({ id: 'cust-1', isNew: true })
  mockCreateConversation.mockResolvedValue('conv-1')
})

const validPayload = {
  leadID: 'tt-lead-123',
  customerPhone: '5127569847',
  customerName: 'Jane Smith',
  customerEmail: 'jane@example.com',
  category: 'Plumbing',
}

describe('POST /api/webhooks/thumbtack', () => {
  it('processes a valid lead', async () => {
    const res = await POST(makeRequest(validPayload))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.conversationId).toBe('conv-1')
  })

  it('verifies HMAC signature when present', async () => {
    mockVerifyThumbtack.mockReturnValue(false)
    const res = await POST(makeRequest(validPayload, {
      'x-thumbtack-signature': 'bad-sig',
    }))

    expect(res.status).toBe(200)
    expect(mockMarkWebhookFailed).toHaveBeenCalledWith('evt-1', 'Signature verification failed')
  })

  it('skips signature check when no signature header', async () => {
    // No signature header — should proceed
    const res = await POST(makeRequest(validPayload))
    const body = await res.json()
    expect(body.conversationId).toBe('conv-1')
  })

  it('detects duplicates', async () => {
    mockIsWebhookDuplicate.mockResolvedValue(true)
    const res = await POST(makeRequest(validPayload))
    const body = await res.json()
    expect(body.duplicate).toBe(true)
  })

  it('handles invalid phone', async () => {
    mockNormalizePhone.mockReturnValue(null)
    const res = await POST(makeRequest(validPayload))
    expect(mockMarkWebhookFailed).toHaveBeenCalledWith('evt-1', 'No valid phone number')
  })

  it('splits customerName into first/last', async () => {
    await POST(makeRequest(validPayload))
    expect(mockFindOrCreateCustomer).toHaveBeenCalledWith(
      expect.objectContaining({
        firstName: 'Jane',
        lastName: 'Smith',
      }),
    )
  })

  it('triggers speed-to-lead', async () => {
    await POST(makeRequest(validPayload))
    expect(mockTriggerSpeedToLead).toHaveBeenCalledWith(
      expect.objectContaining({ source: 'thumbtack' }),
    )
  })
})
