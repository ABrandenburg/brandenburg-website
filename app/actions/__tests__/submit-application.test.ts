import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock db
const mockDbInsert = vi.fn().mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) })
vi.mock('@/lib/db', () => ({
  db: { insert: (...args: unknown[]) => mockDbInsert(...args) },
}))

vi.mock('@/lib/schema', () => ({
  submissions: 'submissions_table',
}))

// Mock Resend
const { mockEmailSend } = vi.hoisted(() => ({
  mockEmailSend: vi.fn().mockReturnValue({ catch: vi.fn() }),
}))
vi.mock('resend', () => ({
  Resend: class MockResend {
    emails = { send: mockEmailSend }
  },
}))

import { submitApplication } from '../submit-application'

beforeEach(() => {
  vi.clearAllMocks()
  mockDbInsert.mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) })
})

const validTechApplication = {
  fullName: 'John Doe',
  email: 'john@example.com',
  phone: '5127569847',
  zipCode: '78654',
  source: 'Indeed' as const,
  role: 'technician' as const,
  trade: 'Plumbing' as const,
  experienceYears: '5-9' as const,
  hasLicense: true,
  licenseType: 'Journeyman',
  motivation: 'I love plumbing and want to grow my career',
  mostRecentEmployer: 'Acme Plumbing',
}

const validWarehouseApplication = {
  fullName: 'Jane Smith',
  email: 'jane@example.com',
  phone: '5127569847',
  zipCode: '78611',
  source: 'Facebook' as const,
  role: 'warehouse' as const,
  canLift50lbs: true,
  hasDriversLicense: true,
}

describe('submitApplication', () => {
  it('processes valid technician application', async () => {
    const result = await submitApplication(validTechApplication)
    expect(result.success).toBe(true)
    expect(mockDbInsert).toHaveBeenCalled()
  })

  it('processes valid warehouse application', async () => {
    const result = await submitApplication(validWarehouseApplication)
    expect(result.success).toBe(true)
  })

  it('silently succeeds for honeypot spam', async () => {
    const result = await submitApplication({
      ...validTechApplication,
      website_url: 'http://spam.com',
    })
    expect(result.success).toBe(true)
    expect(mockDbInsert).not.toHaveBeenCalled()
  })

  it('rejects invalid schema data', async () => {
    const result = await submitApplication({
      ...validTechApplication,
      email: 'not-an-email',
    })
    expect(result.success).toBe(false)
    expect(result.error).toContain('Invalid')
  })

  it('rejects invalid zip code', async () => {
    const result = await submitApplication({
      ...validTechApplication,
      zipCode: '99999',
    })
    expect(result.success).toBe(false)
  })

  it('returns error on database failure', async () => {
    mockDbInsert.mockReturnValue({
      values: vi.fn().mockRejectedValue(new Error('DB error')),
    })

    const result = await submitApplication(validTechApplication)
    expect(result.success).toBe(false)
    expect(result.error).toContain('went wrong')
  })

  it('sends notification email', async () => {
    await submitApplication(validTechApplication)
    expect(mockEmailSend).toHaveBeenCalledTimes(1)
    const emailArgs = mockEmailSend.mock.calls[0][0]
    expect(emailArgs.subject).toContain('TECHNICIAN')
    expect(emailArgs.subject).toContain('John Doe')
  })

  it('includes role-specific content in email', async () => {
    await submitApplication(validWarehouseApplication)
    const emailArgs = mockEmailSend.mock.calls[0][0]
    expect(emailArgs.html).toContain('WAREHOUSE')
    expect(emailArgs.html).toContain('Can Lift 50lbs')
  })
})
