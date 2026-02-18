"use client"

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { Service } from '@/lib/services-data'

interface HvacServicesGridProps {
  services: Service[]
}

const serviceDescriptions: Record<string, string> = {
  'ac-repair': 'Fast diagnostics and repair for all AC makes and models. Beat the Central Texas heat with same-day service.',
  'ac-installation': 'Properly sized, high-efficiency AC systems installed right the first time for maximum comfort and savings.',
  'heating-repair': 'Expert furnace and heat pump diagnostics to keep your home warm through Hill Country winters.',
  'heating-installation': 'New furnace and heat pump installation with proper sizing, energy rebates, and full warranty coverage.',
  'ductwork': 'Duct sealing, insulation, and design to eliminate hot spots, reduce energy waste, and improve air quality.',
  'heat-pumps': 'Energy-efficient heating and cooling in one system — ideal for the Central Texas climate.',
}

export function HvacServicesGrid({ services }: HvacServicesGridProps) {
  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <p className="text-brand-blue text-sm lg:text-base font-semibold uppercase tracking-wider mb-4">
            Complete HVAC Solutions
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary text-balance">
            Our Heating & Air Conditioning Services
          </h2>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: [0.25, 0.1, 0.25, 1],
              }}
            >
              <Link
                href={`/service/${service.slug}`}
                className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-card hover:shadow-card-hover hover:-translate-y-2 transition-all duration-400"
              >
                <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
                  <Image
                    src={service.image}
                    alt={service.name}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                <div className="p-6">
                  <h3 className="font-serif text-xl lg:text-2xl font-bold text-text-primary mb-2">
                    {service.name}
                  </h3>
                  <p className="text-text-muted text-sm lg:text-base leading-relaxed mb-4 line-clamp-2">
                    {serviceDescriptions[service.slug] || service.serviceSubheading}
                  </p>
                  <div className="flex items-center gap-2 text-brand-blue font-medium text-sm">
                    <span className="relative">
                      Learn More
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-blue/30 group-hover:w-full transition-all duration-300" />
                    </span>
                    <ArrowRight className="w-4 h-4 transition-all duration-300 group-hover:translate-x-2" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
