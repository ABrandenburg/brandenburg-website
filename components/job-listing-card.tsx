'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, MapPin, DollarSign, Clock, Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { JobListing } from '@/lib/jobs-data'
import { cn } from '@/lib/utils'

interface JobListingCardProps {
  job: JobListing
  onApply?: (jobId: string) => void
}

export function JobListingCard({ job, onApply }: JobListingCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const formatSalary = (salary: JobListing['salaryRange']) => {
    if (salary.unit === 'HOUR') {
      return `$${salary.min} - $${salary.max}/hr`
    }
    return `$${salary.min.toLocaleString()} - $${salary.max.toLocaleString()}/yr`
  }

  const handleApply = () => {
    if (onApply) {
      onApply(job.id)
    } else {
      // Scroll to form with job parameter
      const formSection = document.getElementById('application-form')
      if (formSection) {
        // Update URL with job parameter
        const url = new URL(window.location.href)
        url.searchParams.set('job', job.id)
        window.history.replaceState({}, '', url.toString())
        
        formSection.scrollIntoView({ behavior: 'smooth' })
        
        // Dispatch custom event for form to pick up
        window.dispatchEvent(new CustomEvent('job-selected', { detail: { jobId: job.id } }))
      }
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
          <div>
            <h3 className="font-serif text-xl font-bold text-text-primary mb-2">
              {job.title}
            </h3>
            <div className="flex flex-wrap gap-3 text-sm text-text-muted">
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                Marble Falls, TX
              </span>
              <span className="inline-flex items-center gap-1">
                <Briefcase className="w-4 h-4" />
                {job.employmentType === 'FULL_TIME' ? 'Full-Time' : job.employmentType}
              </span>
              <span className="inline-flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                {formatSalary(job.salaryRange)}
              </span>
            </div>
          </div>
          <Button onClick={handleApply} className="shrink-0">
            Apply Now
          </Button>
        </div>

        {/* Description */}
        <p className="text-text-muted mb-4">
          {job.description}
        </p>

        {/* Expandable Details */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-1 text-primary font-medium hover:text-primary/80 transition-colors"
        >
          {isExpanded ? 'Hide Details' : 'View Details'}
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
            {/* Responsibilities */}
            <div>
              <h4 className="font-semibold text-text-primary mb-2">Responsibilities</h4>
              <ul className="list-disc list-inside space-y-1 text-text-muted text-sm">
                {job.responsibilities.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Qualifications */}
            <div>
              <h4 className="font-semibold text-text-primary mb-2">Qualifications</h4>
              <ul className="list-disc list-inside space-y-1 text-text-muted text-sm">
                {job.qualifications.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Experience */}
            {job.experienceRequirements && (
              <div>
                <h4 className="font-semibold text-text-primary mb-2">Experience</h4>
                <p className="text-text-muted text-sm">{job.experienceRequirements}</p>
              </div>
            )}

            {/* Apply Button at bottom of expanded section */}
            <div className="pt-2">
              <Button onClick={handleApply} size="lg" className="w-full sm:w-auto">
                Apply for This Position
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
