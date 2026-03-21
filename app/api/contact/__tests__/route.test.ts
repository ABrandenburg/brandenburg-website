import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock dependencies
const mockDbInsert = vi.fn().mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) })
vi.mock('@/lib/db', () => ({
  db: { insert: (...args: unknown[]) => mockDbInsert(...args) },
}))

vi.mock('@/lib/schema', () => ({
  submissions: 'submissions_table',
}))

const { mockEmailSend } = vi.hoisted(() => ({
  mockEmailSend: vi.fn().mockReturnValue({ catch: vi.fn() }),
}))
vi.mock('resend', () => ({
  Resend: class MockResend {
    emails = { send: mockEmailSend }
  },
}))

import { POST } from '../route'

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest('https://example.com/api/contact', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  mockDbInsert.mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) })
})

const validBody = {
  fullName: 'John Doe',
  email: 'john@example.com',
  phone: '5127569847',
  message: 'I need a plumber ASAP',
}

describe('POST /api/contact', () => {
  it('processes valid submission successfully', async () => {
    const res = await POST(makeRequest(validBody))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.message).toBe('Email sent successfully')
  })

  it('silently succeeds for honeypot spam', async () => {
    const res = await POST(makeRequest({
      ...validBody,
      website_url: 'http://spam.com', // honeypot field filled
    }))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.message).toBe('Email sent successfully')
    // DB should NOT be called for spam
    expect(mockDbInsert).not.toHaveBeenCalled()
  })

  it('rejects missing required fields', async () => {
    const res = await POST(makeRequest({ fullName: 'John' }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toContain('required')
  })

  it('rejects invalid email format', async () => {
    const res = await POST(makeRequest({
      ...validBody,
      email: 'not-an-email',
    }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toContain('email')
  })

  it('returns 500 on database error', async () => {
    mockDbInsert.mockReturnValue({
      values: vi.fn().mockRejectedValue(new Error('DB error')),
    })

    const res = await POST(makeRequest(validBody))
    expect(res.status).toBe(500)
  })

  it('sends notification and auto-reply emails', async () => {
    await POST(makeRequest(validBody))
    // Two email sends: notification + auto-reply
    expect(mockEmailSend).toHaveBeenCalledTimes(2)
  })
})
