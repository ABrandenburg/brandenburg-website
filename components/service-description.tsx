import Image from 'next/image'
import type { Service } from '@/lib/services-data'

interface ServiceDescriptionProps {
  service: Service
}

const stats = [
  { value: "27+", label: "Years in Business" },
  { value: "10,000+", label: "Jobs Completed" },
  { value: "15+", label: "Team Members" },
  { value: "4.9★", label: "Google Rating" },
]

const reasons = [
  {
    title: "Family-Owned Since 1997",
    description: "Founded right here in Burnet County, we've been serving our neighbors for over 27 years.",
  },
  {
    title: "Upfront Pricing",
    description: "No surprises. We provide detailed estimates before any work begins so you know exactly what to expect.",
  },
  {
    title: "Licensed & Insured",
    description: "Our team is fully licensed, bonded, and insured for your protection and peace of mind.",
  },
  {
    title: "Satisfaction Guaranteed",
    description: "We stand behind our work with a 100% satisfaction guarantee on every job we complete.",
  },
]

export function ServiceDescription({ service }: ServiceDescriptionProps) {
  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-blue mb-4">
            {service.trustHeader}
          </h2>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            {service.locationBlurb}
          </p>
        </div>

        {/* Stats Row — simple inline treatment, no icons */}
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-16">
          {stats.map((stat, index) => (
            <div key={stat.label} className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-brand-blue">{stat.value}</span>
              <span className="text-sm text-text-muted">{stat.label}</span>
              {index < stats.length - 1 && (
                <span className="hidden sm:inline text-gray-300 ml-6">&middot;</span>
              )}
            </div>
          ))}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-soft-lg">
              <Image
                src={service.slug === 'commercial' ? '/images/service-trucks.jpg' : '/images/team-photo.jpg'}
                alt="Brandenburg Plumbing team"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Reasons */}
          <div className="space-y-6">
            {reasons.map((reason) => (
              <div key={reason.title}>
                <h3 className="font-semibold text-lg text-text-primary mb-1">
                  {reason.title}
                </h3>
                <p className="text-text-muted">
                  {reason.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
