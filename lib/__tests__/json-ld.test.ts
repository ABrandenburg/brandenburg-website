import { describe, it, expect } from 'vitest'
import {
  generateServiceSchema,
  generateLocationSchema,
  generateBreadcrumbSchema,
  generateJobPostingSchema,
} from '../json-ld'
import type { Service } from '../services-data'
import type { Location } from '../locations-data'
import type { JobListing } from '../jobs-data'

const mockPlumbingService: Service = {
  name: 'Water Heater Repair',
  slug: 'water-heaters',
  servicesHeader: 'Water Heater Services',
  metaTitle: 'Water Heater Repair & Installation',
  metaDesc: 'Professional water heater repair and installation services.',
  trustHeader: 'Trust Us',
  locationBlurb: 'We serve the area.',
  serviceSubheading: 'Expert water heater services',
  faqHeader: 'Water Heater FAQs',
  faqIds: ['faq-1'],
  image: '/images/water_heater.jpg',
  icon: 'wrench',
}

const mockHvacService: Service = {
  name: 'AC Repair',
  slug: 'ac-repair',
  servicesHeader: 'AC Services',
  metaTitle: 'AC Repair & Maintenance',
  metaDesc: 'Professional AC repair services.',
  trustHeader: 'Trust Us',
  locationBlurb: 'We serve the area.',
  serviceSubheading: 'Expert AC services',
  faqHeader: 'AC FAQs',
  faqIds: ['faq-2'],
  image: '/images/ac.jpg',
  icon: 'snowflake',
}

const mockLocation: Location = {
  name: 'Marble Falls',
  slug: 'marble-falls',
  mainHeaderText: 'Marble Falls Plumbing',
  locationBlurb: 'Serving Marble Falls.',
  servicesHeader: 'Our Services',
  faqHeader: 'FAQs',
  trustHeader: 'Trust Us',
  metaTitle: 'Marble Falls Plumbing',
  metaDesc: 'Best plumbing in Marble Falls.',
}

const mockJob: JobListing = {
  id: 'test-job',
  title: 'Licensed Plumber',
  slug: 'licensed-plumber',
  description: 'Join our team as a licensed plumber.',
  responsibilities: ['Fix pipes', 'Install fixtures'],
  qualifications: ['5 years experience', 'TX license'],
  employmentType: 'FULL_TIME',
  experienceRequirements: '5 years',
  salaryRange: { min: 25, max: 45, unit: 'HOUR' },
  datePosted: '2025-01-15',
  validThrough: '2025-12-31',
  formRole: 'technician',
  formTrade: 'Plumbing',
}

describe('generateServiceSchema', () => {
  it('returns schema.org Service type', () => {
    const schema = generateServiceSchema(mockPlumbingService)
    expect(schema['@context']).toBe('https://schema.org')
    expect(schema['@type']).toBe('Service')
  })

  it('uses PlumbingService provider for non-HVAC services', () => {
    const schema = generateServiceSchema(mockPlumbingService)
    expect(schema.provider['@type']).toBe('PlumbingService')
  })

  it('uses HVACBusiness provider for HVAC services', () => {
    const schema = generateServiceSchema(mockHvacService)
    expect(schema.provider['@type']).toBe('HVACBusiness')
  })

  it('detects all HVAC slugs', () => {
    const hvacSlugs = ['ac-repair', 'ac-installation', 'heating-repair', 'heating-installation', 'ductwork', 'heat-pumps']
    for (const slug of hvacSlugs) {
      const schema = generateServiceSchema({ ...mockPlumbingService, slug })
      expect(schema.provider['@type'], `${slug} should be HVACBusiness`).toBe('HVACBusiness')
    }
  })

  it('includes service name and description', () => {
    const schema = generateServiceSchema(mockPlumbingService)
    expect(schema.name).toBe('Water Heater Repair')
    expect(schema.description).toBe(mockPlumbingService.metaDesc)
  })

  it('builds correct URL', () => {
    const schema = generateServiceSchema(mockPlumbingService)
    expect(schema.url).toBe('https://www.brandenburgplumbing.com/service/water-heaters')
  })

  it('builds correct image URL', () => {
    const schema = generateServiceSchema(mockPlumbingService)
    expect(schema.image).toBe('https://www.brandenburgplumbing.com/images/water_heater.jpg')
  })

  it('includes provider details', () => {
    const schema = generateServiceSchema(mockPlumbingService)
    expect(schema.provider.name).toBe('Brandenburg Plumbing')
    expect(schema.provider.telephone).toBe('+1-512-756-9847')
    expect(schema.provider.priceRange).toBe('$$')
  })
})

describe('generateLocationSchema', () => {
  it('returns HomeAndConstructionBusiness type', () => {
    const schema = generateLocationSchema(mockLocation)
    expect(schema['@type']).toBe('HomeAndConstructionBusiness')
  })

  it('includes location name in business name', () => {
    const schema = generateLocationSchema(mockLocation)
    expect(schema.name).toBe('Brandenburg Plumbing - Marble Falls')
  })

  it('builds correct URL', () => {
    const schema = generateLocationSchema(mockLocation)
    expect(schema.url).toBe('https://www.brandenburgplumbing.com/location/marble-falls')
  })

  it('uses default image when locationImage not provided', () => {
    const schema = generateLocationSchema(mockLocation)
    expect(schema.image).toBe('https://www.brandenburgplumbing.com/images/service-trucks.jpg')
  })

  it('uses provided locationImage with full URL', () => {
    const schema = generateLocationSchema({
      ...mockLocation,
      locationImage: 'https://cdn.example.com/img.jpg',
    })
    expect(schema.image).toBe('https://cdn.example.com/img.jpg')
  })

  it('prepends domain to relative locationImage', () => {
    const schema = generateLocationSchema({
      ...mockLocation,
      locationImage: '/images/marble-falls.jpg',
    })
    expect(schema.image).toBe('https://www.brandenburgplumbing.com/images/marble-falls.jpg')
  })

  it('includes area served', () => {
    const schema = generateLocationSchema(mockLocation)
    expect(schema.areaServed.name).toBe('Marble Falls')
    expect(schema.areaServed['@type']).toBe('City')
  })
})

describe('generateBreadcrumbSchema', () => {
  it('returns BreadcrumbList type', () => {
    const schema = generateBreadcrumbSchema([{ name: 'Home', item: '/' }])
    expect(schema['@type']).toBe('BreadcrumbList')
  })

  it('assigns positions starting at 1', () => {
    const schema = generateBreadcrumbSchema([
      { name: 'Home', item: '/' },
      { name: 'Services', item: '/services' },
    ])
    expect(schema.itemListElement[0].position).toBe(1)
    expect(schema.itemListElement[1].position).toBe(2)
  })

  it('prepends domain to relative URLs', () => {
    const schema = generateBreadcrumbSchema([
      { name: 'Services', item: '/services' },
    ])
    expect(schema.itemListElement[0].item).toBe('https://www.brandenburgplumbing.com/services')
  })

  it('preserves absolute URLs', () => {
    const schema = generateBreadcrumbSchema([
      { name: 'External', item: 'https://example.com' },
    ])
    expect(schema.itemListElement[0].item).toBe('https://example.com')
  })

  it('handles empty array', () => {
    const schema = generateBreadcrumbSchema([])
    expect(schema.itemListElement).toEqual([])
  })
})

describe('generateJobPostingSchema', () => {
  it('returns JobPosting type', () => {
    const schema = generateJobPostingSchema(mockJob)
    expect(schema['@type']).toBe('JobPosting')
  })

  it('includes title and description', () => {
    const schema = generateJobPostingSchema(mockJob)
    expect(schema.title).toBe('Licensed Plumber')
    expect(schema.description).toBe(mockJob.description)
  })

  it('includes salary range', () => {
    const schema = generateJobPostingSchema(mockJob)
    expect(schema.baseSalary.value.minValue).toBe(25)
    expect(schema.baseSalary.value.maxValue).toBe(45)
    expect(schema.baseSalary.value.unitText).toBe('HOUR')
  })

  it('includes validThrough when provided', () => {
    const schema = generateJobPostingSchema(mockJob)
    expect(schema.validThrough).toBe('2025-12-31')
  })

  it('omits validThrough when not provided', () => {
    const schema = generateJobPostingSchema({ ...mockJob, validThrough: undefined })
    expect(schema).not.toHaveProperty('validThrough')
  })

  it('joins responsibilities and qualifications with periods', () => {
    const schema = generateJobPostingSchema(mockJob)
    expect(schema.responsibilities).toBe('Fix pipes. Install fixtures')
    expect(schema.qualifications).toBe('5 years experience. TX license')
  })

  it('includes job location in Marble Falls', () => {
    const schema = generateJobPostingSchema(mockJob)
    expect(schema.jobLocation.address.addressLocality).toBe('Marble Falls')
    expect(schema.jobLocation.address.postalCode).toBe('78654')
  })

  it('sets directApply to true', () => {
    const schema = generateJobPostingSchema(mockJob)
    expect(schema.directApply).toBe(true)
  })
})
