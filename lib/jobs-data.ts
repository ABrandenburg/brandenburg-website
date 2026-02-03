export interface JobListing {
  id: string
  title: string
  slug: string
  description: string
  responsibilities: string[]
  qualifications: string[]
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACTOR'
  experienceRequirements?: string
  salaryRange: {
    min: number
    max: number
    unit: 'HOUR' | 'YEAR'
  }
  datePosted: string // ISO date
  validThrough?: string // ISO date (optional expiration)
  // Maps to the careers form fields
  formRole: 'technician' | 'office' | 'warehouse'
  formTrade?: 'HVAC' | 'Plumbing' | 'Electrical' | 'General'
  formExperience?: '0-1 (Apprentice)' | '2-4' | '5-9' | '10+'
}

export const jobListings: JobListing[] = [
  {
    id: 'licensed-plumber',
    title: 'Licensed Residential Service Plumber',
    slug: 'licensed-residential-service-plumber',
    description: 'Join Brandenburg Plumbing as a Licensed Residential Service Plumber. We are looking for experienced, licensed plumbers to provide exceptional service to homeowners throughout the Highland Lakes and North Austin area. You will diagnose and repair plumbing issues, install new fixtures, and ensure customer satisfaction on every job.',
    responsibilities: [
      'Diagnose and repair residential plumbing issues including leaks, clogs, and pipe damage',
      'Install, maintain, and repair water heaters, garbage disposals, and other plumbing fixtures',
      'Perform drain cleaning and sewer line repairs',
      'Provide accurate estimates and communicate clearly with customers',
      'Maintain a clean and organized work vehicle',
      'Document work completed and parts used in ServiceTitan',
      'Mentor apprentice plumbers when assigned',
    ],
    qualifications: [
      'Valid Texas Journeyman or Master Plumber license required',
      'Minimum 5 years of residential service plumbing experience',
      'Strong diagnostic and problem-solving skills',
      'Excellent customer service and communication abilities',
      'Valid driver\'s license with clean driving record',
      'Ability to work independently and manage time effectively',
      'Physical ability to lift 50+ lbs and work in various conditions',
    ],
    employmentType: 'FULL_TIME',
    experienceRequirements: 'Minimum 5 years residential service plumbing experience',
    salaryRange: {
      min: 90000,
      max: 140000,
      unit: 'YEAR',
    },
    datePosted: '2026-02-01',
    formRole: 'technician',
    formTrade: 'Plumbing',
    formExperience: '5-9',
  },
  {
    id: 'apprentice-plumber',
    title: 'Apprentice Plumber',
    slug: 'apprentice-plumber',
    description: 'Start your plumbing career with Brandenburg Plumbing! We are seeking motivated individuals to join our team as Apprentice Plumbers. You will work alongside experienced licensed plumbers, learning the trade while earning competitive pay. This is an excellent opportunity to build a rewarding career in the skilled trades.',
    responsibilities: [
      'Assist licensed plumbers with residential service calls',
      'Learn to diagnose and repair common plumbing issues',
      'Help with installation of plumbing fixtures and water heaters',
      'Maintain clean job sites and organized work vehicles',
      'Attend training sessions and pursue plumbing education',
      'Develop customer service skills through direct interaction',
      'Handle tools, materials, and equipment safely',
    ],
    qualifications: [
      'High school diploma or GED required',
      'Strong interest in learning the plumbing trade',
      'Mechanical aptitude and willingness to learn',
      'Reliable transportation to job sites',
      'Valid driver\'s license',
      'Ability to lift 50+ lbs and work in various conditions',
      'Good communication skills and professional attitude',
      'No prior plumbing experience required - we will train you!',
    ],
    employmentType: 'FULL_TIME',
    experienceRequirements: 'No experience required - entry level position',
    salaryRange: {
      min: 20,
      max: 24,
      unit: 'HOUR',
    },
    datePosted: '2026-02-01',
    formRole: 'technician',
    formTrade: 'Plumbing',
    formExperience: '0-1 (Apprentice)',
  },
  {
    id: 'hvac-technician',
    title: 'Certified HVAC Technician',
    slug: 'certified-hvac-technician',
    description: 'Brandenburg Plumbing is expanding our HVAC services and seeking Certified HVAC Technicians to join our growing team. You will service, repair, and install residential heating and cooling systems throughout the Highland Lakes and North Austin area. We offer competitive pay, excellent benefits, and a supportive team environment.',
    responsibilities: [
      'Diagnose and repair residential HVAC systems including AC units, furnaces, and heat pumps',
      'Perform routine maintenance and tune-ups on heating and cooling equipment',
      'Install new HVAC systems and replace aging equipment',
      'Troubleshoot electrical and mechanical issues',
      'Provide accurate estimates and explain repairs to customers',
      'Maintain proper refrigerant handling and EPA compliance',
      'Document all work in ServiceTitan and maintain service records',
    ],
    qualifications: [
      'EPA 608 Universal Certification required',
      'HVAC certification from accredited program or equivalent experience',
      'Minimum 3 years of residential HVAC service experience',
      'Strong electrical and mechanical troubleshooting skills',
      'Valid driver\'s license with clean driving record',
      'Excellent customer service and communication abilities',
      'Ability to work in extreme temperatures and confined spaces',
      'Physical ability to lift 50+ lbs and climb ladders',
    ],
    employmentType: 'FULL_TIME',
    experienceRequirements: 'Minimum 3 years residential HVAC service experience',
    salaryRange: {
      min: 90000,
      max: 140000,
      unit: 'YEAR',
    },
    datePosted: '2026-02-01',
    formRole: 'technician',
    formTrade: 'HVAC',
    formExperience: '5-9',
  },
]

// Helper to get a job by slug
export function getJobBySlug(slug: string): JobListing | undefined {
  return jobListings.find((job) => job.slug === slug)
}

// Helper to get a job by ID
export function getJobById(id: string): JobListing | undefined {
  return jobListings.find((job) => job.id === id)
}

// Get all active job listings (could filter by validThrough date in the future)
export function getActiveJobListings(): JobListing[] {
  const now = new Date().toISOString().split('T')[0]
  return jobListings.filter((job) => !job.validThrough || job.validThrough >= now)
}
