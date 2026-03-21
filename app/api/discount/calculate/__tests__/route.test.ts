import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock ServiceTitan functions
const mockIsConfigured = vi.fn()
const mockGetCapacity = vi.fn()
const mockGetDemoData = vi.fn()
vi.mock('@/lib/servicetitan-discount', () => ({
  isServiceTitanConfigured: (...args: unknown[]) => mockIsConfigured(...args),
  getCapacityWithStatus: (...args: unknown[]) => mockGetCapacity(...args),
  getDemoCapacityData: (...args: unknown[]) => mockGetDemoData(...args),
}))

// Keep real discount calculator
vi.mock('@/lib/discount-calculator', async (importOriginal) => {
  return importOriginal()
})

import { POST } from '../route'

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest('https://example.com/api/discount/calculate', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  mockGetDemoData.mockReturnValue({ status: 'hungry', availabilityPercent: 50 })
})

describe('POST /api/discount/calculate', () => {
  it('validates grossMargin is a positive number', async () => {
    const res = await POST(makeRequest({ grossMargin: 0 }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toContain('positive number')
  })

  it('rejects negative grossMargin', async () => {
    const res = await POST(makeRequest({ grossMargin: -100 }))
    expect(res.status).toBe(400)
  })

  it('rejects non-number grossMargin', async () => {
    const res = await POST(makeRequest({ grossMargin: 'abc' }))
    expect(res.status).toBe(400)
  })

  it('uses demo mode when ServiceTitan not configured', async () => {
    mockIsConfigured.mockReturnValue(false)

    const res = await POST(makeRequest({ grossMargin: 10000 }))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.isDemoMode).toBe(true)
    expect(body.data.grossMargin).toBe(10000)
  })

  it('uses ServiceTitan data when configured', async () => {
    mockIsConfigured.mockReturnValue(true)
    mockGetCapacity.mockResolvedValue({
      data: { status: 'normal', availabilityPercent: 30 },
    })

    const res = await POST(makeRequest({ grossMargin: 10000 }))
    const body = await res.json()

    expect(body.success).toBe(true)
    expect(body.isDemoMode).toBe(false)
    expect(body.data.status).toBe('normal')
  })

  it('falls back to demo on ServiceTitan API error', async () => {
    mockIsConfigured.mockReturnValue(true)
    mockGetCapacity.mockRejectedValue(new Error('API timeout'))

    const res = await POST(makeRequest({ grossMargin: 10000 }))
    const body = await res.json()

    expect(body.success).toBe(true)
    expect(body.isDemoMode).toBe(true)
  })

  it('returns correct discount calculations', async () => {
    mockIsConfigured.mockReturnValue(false)
    mockGetDemoData.mockReturnValue({ status: 'hungry', availabilityPercent: 50 })

    const res = await POST(makeRequest({ grossMargin: 10000 }))
    const body = await res.json()

    // hungry: 30% sacrifice = 3000, standard = min(1500, 1000) = 1000, max = min(3000, 5000) = 3000
    expect(body.data.standardDiscount).toBe(1000)
    expect(body.data.maxDiscount).toBe(3000)
  })
})
