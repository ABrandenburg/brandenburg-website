"use client"

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface LocationServicesProps {
  locationName: string
  header: string
}

const services = [
  {
    name: "Water Heaters",
    description: "Installation, repair, and maintenance for tank and tankless water heaters.",
    href: "/service/water-heaters",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="5" y="2" width="14" height="20" rx="2" />
        <circle cx="12" cy="15" r="3" />
        <line x1="12" y1="6" x2="12" y2="9" />
      </svg>
    ),
  },
  {
    name: "Drain Cleaning",
    description: "Professional drain clearing for clogs, backups, and slow drains.",
    href: "/service/clogged-pipes",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2v6m0 0c-4 0-6 2-6 4v10h12V12c0-2-2-4-6-4z" />
        <path d="M9 14h6M9 18h6" />
      </svg>
    ),
  },
  {
    name: "Bathroom Plumbing",
    description: "Faucets, showers, tubs, and complete bathroom remodels.",
    href: "/service/bathroom",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 12h16v4a4 4 0 01-4 4H8a4 4 0 01-4-4v-4z" />
        <path d="M6 12V8a2 2 0 012-2h8a2 2 0 012 2v4" />
        <circle cx="12" cy="15" r="1.5" />
      </svg>
    ),
  },
  {
    name: "Kitchen Plumbing",
    description: "Sinks, garbage disposals, dishwashers, and kitchen remodels.",
    href: "/service/kitchen",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="8" width="18" height="12" rx="2" />
        <path d="M7 8V6a2 2 0 012-2h6a2 2 0 012 2v2" />
        <line x1="12" y1="12" x2="12" y2="16" />
      </svg>
    ),
  },
  {
    name: "Toilets",
    description: "Repairs, replacements, and installation of new toilets.",
    href: "/service/toilets",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <ellipse cx="12" cy="14" rx="6" ry="3" />
        <path d="M6 14v3a6 3 0 0012 0v-3" />
        <rect x="9" y="4" width="6" height="10" rx="1" />
      </svg>
    ),
  },
  {
    name: "Water Treatment",
    description: "Water softeners, filtration systems, and water quality solutions.",
    href: "/service/water-softeners",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2C9 7 6 10 6 14a6 6 0 1012 0c0-4-3-7-6-12z" />
        <path d="M12 19v-3M10 17h4" />
      </svg>
    ),
  },
]

export function LocationServices({ locationName, header }: LocationServicesProps) {
  return (
    <section className="py-16 lg:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-blue mb-4">
            {header}
          </h2>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            From routine maintenance to emergency repairs, our licensed plumbers handle it all.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link
                href={service.href}
                className="block group bg-white p-6 rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300"
              >
                {/* Icon */}
                <div className="w-14 h-14 bg-brand-blue/10 rounded-xl flex items-center justify-center text-brand-blue mb-4 group-hover:bg-brand-blue group-hover:text-white transition-colors duration-300">
                  {service.icon}
                </div>

                {/* Content */}
                <h3 className="font-semibold text-lg text-text-primary mb-2 group-hover:text-brand-blue transition-colors">
                  {service.name}
                </h3>
                <p className="text-text-muted text-sm mb-4">
                  {service.description}
                </p>

                {/* Link */}
                <span className="inline-flex items-center gap-2 text-brand-blue font-medium text-sm">
                  Learn more
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-10"
        >
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-brand-blue text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-blue/90 transition-colors"
          >
            Contact Us
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
