import { describe, it, expect } from 'vitest'
import { jobApplicationSchema } from '../job-application-schema'

// Helper to create a valid base payload
const validBase = {
  fullName: 'John Doe',
  email: 'john@example.com',
  phone: '5127569847',
  zipCode: '78654',
  source: 'Indeed' as const,
}

describe('jobApplicationSchema — base fields', () => {
  it('requires fullName with min 2 chars', () => {
    const result = jobApplicationSchema.safeParse({
      ...validBase,
      fullName: 'A',
      role: 'warehouse',
      canLift50lbs: true,
      hasDriversLicense: true,
    })
    expect(result.success).toBe(false)
  })

  it('requires valid email', () => {
    const result = jobApplicationSchema.safeParse({
      ...validBase,
      email: 'not-an-email',
      role: 'warehouse',
      canLift50lbs: true,
      hasDriversLicense: true,
    })
    expect(result.success).toBe(false)
  })

  it('requires phone with min 10 chars', () => {
    const result = jobApplicationSchema.safeParse({
      ...validBase,
      phone: '12345',
      role: 'warehouse',
      canLift50lbs: true,
      hasDriversLicense: true,
    })
    expect(result.success).toBe(false)
  })

  it('validates zip code against allowlist', () => {
    const result = jobApplicationSchema.safeParse({
      ...validBase,
      zipCode: '99999',
      role: 'warehouse',
      canLift50lbs: true,
      hasDriversLicense: true,
    })
    expect(result.success).toBe(false)
  })

  it('accepts all allowed zip codes', () => {
    const allowedZips = [
      '76550', '78605', '78607', '78609', '78611',
      '78636', '78639', '78642', '78643', '78645',
      '78654', '78657', '78663', '78669', '78672',
    ]
    for (const zip of allowedZips) {
      const result = jobApplicationSchema.safeParse({
        ...validBase,
        zipCode: zip,
        role: 'warehouse',
        canLift50lbs: true,
        hasDriversLicense: true,
      })
      expect(result.success, `zip ${zip} should be valid`).toBe(true)
    }
  })

  it('validates source enum', () => {
    const result = jobApplicationSchema.safeParse({
      ...validBase,
      source: 'LinkedIn',
      role: 'warehouse',
      canLift50lbs: true,
      hasDriversLicense: true,
    })
    expect(result.success).toBe(false)
  })

  it('accepts all valid source values', () => {
    for (const source of ['Indeed', 'Facebook', 'Instagram', 'Referral', 'Truck Wrap', 'Other']) {
      const result = jobApplicationSchema.safeParse({
        ...validBase,
        source,
        role: 'warehouse',
        canLift50lbs: true,
        hasDriversLicense: true,
      })
      expect(result.success, `source "${source}" should be valid`).toBe(true)
    }
  })
})

describe('jobApplicationSchema — technician role', () => {
  const validTech = {
    ...validBase,
    role: 'technician' as const,
    trade: 'Plumbing' as const,
    experienceYears: '5-9' as const,
    hasLicense: false,
    motivation: 'I love plumbing and want to grow',
    mostRecentEmployer: 'Acme Plumbing',
  }

  it('accepts valid technician application', () => {
    const result = jobApplicationSchema.safeParse(validTech)
    expect(result.success).toBe(true)
  })

  it('validates trade enum', () => {
    const result = jobApplicationSchema.safeParse({ ...validTech, trade: 'Carpentry' })
    expect(result.success).toBe(false)
  })

  it('validates experienceYears enum', () => {
    const result = jobApplicationSchema.safeParse({ ...validTech, experienceYears: '15+' })
    expect(result.success).toBe(false)
  })

  it('requires motivation min 10 chars', () => {
    const result = jobApplicationSchema.safeParse({ ...validTech, motivation: 'short' })
    expect(result.success).toBe(false)
  })

  it('requires mostRecentEmployer for experienced candidates (non-apprentice)', () => {
    const result = jobApplicationSchema.safeParse({
      ...validTech,
      experienceYears: '5-9',
      mostRecentEmployer: undefined,
    })
    expect(result.success).toBe(false)
  })

  it('does NOT require mostRecentEmployer for apprentice', () => {
    const result = jobApplicationSchema.safeParse({
      ...validTech,
      experienceYears: '0-1 (Apprentice)',
      mostRecentEmployer: undefined,
    })
    expect(result.success).toBe(true)
  })

  it('requires licenseType when hasLicense is true', () => {
    const result = jobApplicationSchema.safeParse({
      ...validTech,
      hasLicense: true,
      licenseType: undefined,
    })
    expect(result.success).toBe(false)
  })

  it('does not require licenseType when hasLicense is false', () => {
    const result = jobApplicationSchema.safeParse({
      ...validTech,
      hasLicense: false,
      licenseType: undefined,
    })
    expect(result.success).toBe(true)
  })

  it('accepts all trade values', () => {
    for (const trade of ['HVAC', 'Plumbing', 'Electrical', 'General']) {
      const result = jobApplicationSchema.safeParse({ ...validTech, trade })
      expect(result.success, `trade "${trade}" should be valid`).toBe(true)
    }
  })
})

describe('jobApplicationSchema — office role', () => {
  const validOffice = {
    ...validBase,
    role: 'office' as const,
    officeExperience: '3+ Years' as const,
    knownSoftware: true,
    callVolumeComfort: true,
    mostRecentEmployer: 'Acme Corp',
  }

  it('accepts valid office application', () => {
    const result = jobApplicationSchema.safeParse(validOffice)
    expect(result.success).toBe(true)
  })

  it('requires mostRecentEmployer for experienced candidates', () => {
    const result = jobApplicationSchema.safeParse({
      ...validOffice,
      officeExperience: '3+ Years',
      mostRecentEmployer: undefined,
    })
    expect(result.success).toBe(false)
  })

  it('does NOT require mostRecentEmployer for entry level', () => {
    const result = jobApplicationSchema.safeParse({
      ...validOffice,
      officeExperience: 'Entry Level',
      mostRecentEmployer: undefined,
    })
    expect(result.success).toBe(true)
  })

  it('validates officeExperience enum', () => {
    const result = jobApplicationSchema.safeParse({
      ...validOffice,
      officeExperience: '10+ Years',
    })
    expect(result.success).toBe(false)
  })
})

describe('jobApplicationSchema — warehouse role', () => {
  const validWarehouse = {
    ...validBase,
    role: 'warehouse' as const,
    canLift50lbs: true,
    hasDriversLicense: true,
  }

  it('accepts valid warehouse application', () => {
    const result = jobApplicationSchema.safeParse(validWarehouse)
    expect(result.success).toBe(true)
  })

  it('defaults booleans to false', () => {
    const result = jobApplicationSchema.safeParse({
      ...validBase,
      role: 'warehouse',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.canLift50lbs).toBe(false)
      expect(result.data.hasDriversLicense).toBe(false)
    }
  })
})

describe('jobApplicationSchema — discriminated union', () => {
  it('rejects unknown role', () => {
    const result = jobApplicationSchema.safeParse({
      ...validBase,
      role: 'manager',
    })
    expect(result.success).toBe(false)
  })

  it('rejects missing role', () => {
    const result = jobApplicationSchema.safeParse(validBase)
    expect(result.success).toBe(false)
  })
})
