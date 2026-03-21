import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Supabase with fine-grained control
const mockMaybeSingle = vi.fn()
const mockSingle = vi.fn()
const mockChain = {
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  gte: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  single: mockSingle,
  maybeSingle: mockMaybeSingle,
}
const mockFrom = vi.fn().mockReturnValue(mockChain)

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({ from: mockFrom })),
}))

import {
  isWebhookDuplicate,
  isRecentLeadFromPhone,
  isSuppressed,
  findOrCreateCustomer,
  createConversation,
} from '../dedup'

beforeEach(() => {
  vi.unstubAllEnvs()
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-key')

  mockFrom.mockClear()
  mockMaybeSingle.mockReset()
  mockSingle.mockReset()

  // Reset chain mocks
  for (const method of ['select', 'insert', 'update', 'eq', 'gte', 'order', 'limit']) {
    (mockChain as Record<string, ReturnType<typeof vi.fn>>)[method].mockReturnValue(mockChain)
  }
})

describe('isWebhookDuplicate', () => {
  it('returns true when webhook was already processed', async () => {
    mockMaybeSingle.mockResolvedValue({ data: { id: 'evt-1' } })
    const result = await isWebhookDuplicate('angi', 'lead-123')
    expect(result).toBe(true)
  })

  it('returns false when no matching event found', async () => {
    mockMaybeSingle.mockResolvedValue({ data: null })
    const result = await isWebhookDuplicate('angi', 'lead-456')
    expect(result).toBe(false)
  })

  it('queries webhook_events table', async () => {
    mockMaybeSingle.mockResolvedValue({ data: null })
    await isWebhookDuplicate('thumbtack', 'key-789')
    expect(mockFrom).toHaveBeenCalledWith('webhook_events')
  })
})

describe('isSuppressed', () => {
  it('returns true when phone is on suppression list', async () => {
    mockMaybeSingle.mockResolvedValue({ data: { id: 'sup-1' } })
    const result = await isSuppressed('+15127569847')
    expect(result).toBe(true)
  })

  it('returns false when phone is not suppressed', async () => {
    mockMaybeSingle.mockResolvedValue({ data: null })
    const result = await isSuppressed('+15127569847')
    expect(result).toBe(false)
  })

  it('queries suppression_list table', async () => {
    mockMaybeSingle.mockResolvedValue({ data: null })
    await isSuppressed('+15127569847')
    expect(mockFrom).toHaveBeenCalledWith('suppression_list')
  })
})

describe('isRecentLeadFromPhone', () => {
  it('returns isDuplicate true when recent conversation exists', async () => {
    // First query: find customer by phone
    mockMaybeSingle.mockResolvedValueOnce({ data: { id: 'cust-1' } })
    // Second query: find recent conversation
    mockMaybeSingle.mockResolvedValueOnce({ data: { id: 'conv-1', customer_id: 'cust-1' } })

    const result = await isRecentLeadFromPhone('+15127569847')
    expect(result.isDuplicate).toBe(true)
    expect(result.existingConversationId).toBe('conv-1')
  })

  it('returns isDuplicate false when no recent conversation', async () => {
    // Customer found but no recent conversation
    mockMaybeSingle.mockResolvedValueOnce({ data: { id: 'cust-1' } })
    mockMaybeSingle.mockResolvedValueOnce({ data: null })

    const result = await isRecentLeadFromPhone('+15127569847')
    expect(result.isDuplicate).toBe(false)
    expect(result.existingConversationId).toBeUndefined()
  })

  it('returns isDuplicate false when customer not found', async () => {
    mockMaybeSingle.mockResolvedValueOnce({ data: null })
    mockMaybeSingle.mockResolvedValueOnce({ data: null })

    const result = await isRecentLeadFromPhone('+15127569847')
    expect(result.isDuplicate).toBe(false)
  })
})

describe('findOrCreateCustomer', () => {
  it('returns existing customer and updates with new info', async () => {
    // Customer found
    mockMaybeSingle.mockResolvedValueOnce({ data: { id: 'cust-1' } })
    // Update succeeds (no return needed)

    const result = await findOrCreateCustomer({
      phoneE164: '+15127569847',
      firstName: 'John',
      email: 'john@example.com',
    })

    expect(result.id).toBe('cust-1')
    expect(result.isNew).toBe(false)
  })

  it('creates new customer when not found', async () => {
    // No existing customer
    mockMaybeSingle.mockResolvedValueOnce({ data: null })
    // Insert returns new ID
    mockSingle.mockResolvedValueOnce({ data: { id: 'new-cust' }, error: null })

    const result = await findOrCreateCustomer({
      phoneE164: '+15127569847',
      firstName: 'Jane',
    })

    expect(result.id).toBe('new-cust')
    expect(result.isNew).toBe(true)
  })

  it('throws when insert fails', async () => {
    mockMaybeSingle.mockResolvedValueOnce({ data: null })
    mockSingle.mockResolvedValueOnce({ data: null, error: { message: 'duplicate key' } })

    await expect(findOrCreateCustomer({ phoneE164: '+15127569847' }))
      .rejects.toThrow('Failed to create customer')
  })

  it('does not update when no new fields provided', async () => {
    // Clear any state from prior tests
    mockChain.update.mockClear()
    mockMaybeSingle.mockResolvedValueOnce({ data: { id: 'cust-1' } })

    const result = await findOrCreateCustomer({ phoneE164: '+15127569847' })
    expect(result.id).toBe('cust-1')
    // No update call since no new info
    expect(mockChain.update).not.toHaveBeenCalled()
  })
})

describe('createConversation', () => {
  it('creates conversation and returns ID', async () => {
    mockSingle.mockResolvedValue({ data: { id: 'conv-new' }, error: null })

    const result = await createConversation({
      customerId: 'cust-1',
      source: 'angi',
      serviceType: 'water heater repair',
    })

    expect(result).toBe('conv-new')
    expect(mockFrom).toHaveBeenCalledWith('conversations')
  })

  it('throws when insert fails', async () => {
    mockSingle.mockResolvedValue({ data: null, error: { message: 'insert failed' } })

    await expect(createConversation({
      customerId: 'cust-1',
      source: 'angi',
    })).rejects.toThrow('Failed to create conversation')
  })
})
