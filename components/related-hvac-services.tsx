"use client"

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getHvacServices } from '@/lib/services-data'

interface RelatedHvacServicesProps {
  currentSlug: string
}

const serviceIcons: Record<string, React.ReactNode> = {
  'ac-repair': (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v3m0 12v3M3 12h3m12 0h3" />
      <circle cx="12" cy="12" r="5" />
      <path d="M14.5 9.5l-5 5M9.5 9.5l5 5" />
    </svg>
  ),
  'ac-installation': (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="12" rx="2" />
      <path d="M6 8h12M6 12h12" />
      <path d="M8 16v4M16 16v4" />
    </svg>
  ),
  'heating-repair': (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2c-2 4-4 6-4 9a4 4 0 008 0c0-3-2-5-4-9z" />
      <path d="M12 22v-4M8 20h8" />
    </svg>
  ),
  'heating-installation': (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="16" rx="2" />
      <path d="M8 22h8M12 18v4" />
      <path d="M8 8h8M8 12h8" />
    </svg>
  ),
  'ductwork': (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 8h8v8H4z" />
      <path d="M12 10h8v4h-8" />
      <path d="M6 8V4M10 8V4" />
    </svg>
  ),
  'heat-pumps': (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 6v2M12 16v2M6 12h2M16 12h2" />
    </svg>
  ),
}

const serviceDescriptions: Record<string, string> = {
  'ac-repair': 'Fast diagnostics and same-day AC repair for all makes and models.',
  'ac-installation': 'Properly sized, high-efficiency AC systems installed right.',
  'heating-repair': 'Expert furnace and heat pump diagnostics and repair.',
  'heating-installation': 'New furnace and heat pump installation with full warranty.',
  'ductwork': 'Duct sealing, insulation, and design for better comfort.',
  'heat-pumps': 'Energy-efficient heating and cooling in one system.',
}

export function RelatedHvacServices({ currentSlug }: RelatedHvacServicesProps) {
  const allHvacServices = getHvacServices()
  const relatedServices = allHvacServices.filter((s) => s.slug !== currentSlug)

  return (
    <section className="py-16 lg:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-blue mb-4">
            Our Other HVAC Services
          </h2>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            We offer a full range of heating and air conditioning services to keep your home comfortable year-round.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {relatedServices.map((service, index) => (
            <motion.div
              key={service.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
            >
              <Link
                href={`/service/${service.slug}`}
                className="group block bg-white rounded-xl p-5 border border-gray-100 shadow-soft hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-brand-blue/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-brand-blue/20 transition-colors">
                  <div className="text-brand-blue">
                    {serviceIcons[service.slug]}
                  </div>
                </div>
                <h3 className="font-semibold text-text-primary mb-2 group-hover:text-brand-blue transition-colors">
                  {service.name}
                </h3>
                <p className="text-sm text-text-muted mb-3 line-clamp-2">
                  {serviceDescriptions[service.slug]}
                </p>
                <div className="flex items-center gap-1 text-brand-blue text-sm font-medium">
                  <span>Learn More</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Link to main HVAC page */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="text-center mt-8"
        >
          <Link
            href="/hvac"
            className="inline-flex items-center gap-2 text-brand-blue font-medium hover:underline"
          >
            View All HVAC Services
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
