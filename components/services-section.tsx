"use client"

import { ServiceCard } from './service-card'
import { motion } from 'framer-motion'

// Service icons as inline SVGs for better control
const WaterHeaterIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3c0 0-2 2-2 4s2 4 2 4 2-2 2-4-2-4-2-4z" />
    <path d="M8 7c0 0-1.5 1.5-1.5 3s1.5 3 1.5 3" />
    <path d="M16 7c0 0 1.5 1.5 1.5 3s-1.5 3-1.5 3" />
  </svg>
)

const WaterSoftenerIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <path d="M9 12l2 2 4-4" />
  </svg>
)

const WaterFilterIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="4" width="12" height="16" rx="2" />
    <path d="M10 8h4M10 12h4" />
  </svg>
)

const ToiletIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="14" rx="7" ry="4" />
    <path d="M5 14V7a2 2 0 012-2h10a2 2 0 012 2v7" />
    <path d="M9 18v2h6v-2" />
  </svg>
)

const KitchenIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12h18" />
    <path d="M3 12c0 4 2 6 6 6h6c4 0 6-2 6-6" />
    <path d="M12 12V4" />
    <circle cx="8" cy="7" r="1" />
    <circle cx="16" cy="7" r="1" />
  </svg>
)

const BathroomIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12h16" />
    <path d="M4 12c0 4 2 8 8 8s8-4 8-8" />
    <path d="M6 12V6a2 2 0 012-2h0a2 2 0 012 2v0" />
  </svg>
)

const DrainIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v4m0 12v4M2 12h4m12 0h4" />
  </svg>
)

const PipeIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 6h6v4H4z" />
    <path d="M14 14h6v4h-6z" />
    <path d="M10 8h4v2h-4z" />
    <path d="M10 14h4v2h-4z" />
    <path d="M12 10v4" />
  </svg>
)

const ACRepairIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v3m0 12v3M3 12h3m12 0h3" />
    <circle cx="12" cy="12" r="5" />
    <path d="M14.5 9.5l-5 5M9.5 9.5l5 5" />
  </svg>
)

const ACInstallIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="12" rx="2" />
    <path d="M6 8h12M6 12h12" />
    <path d="M8 16v4M16 16v4" />
  </svg>
)

const HeatingRepairIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2c-2 4-4 6-4 9a4 4 0 008 0c0-3-2-5-4-9z" />
    <path d="M12 22v-4M8 20h8" />
  </svg>
)

const HeatingInstallIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="16" rx="2" />
    <path d="M8 22h8M12 18v4" />
    <path d="M8 8h8M8 12h8" />
  </svg>
)

const DuctworkIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 8h8v8H4z" />
    <path d="M12 10h8v4h-8" />
    <path d="M6 8V4M10 8V4" />
  </svg>
)

const HeatPumpIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="6" width="18" height="12" rx="2" />
    <circle cx="12" cy="12" r="3" />
    <path d="M12 6v2M12 16v2M6 12h2M16 12h2" />
  </svg>
)

const services = [
  {
    title: 'Water Heaters',
    description: 'We repair, install, and replace all varieties of water heater, including tankless, tank, and hybrid.',
    image: '/images/water_heater.jpg',
    icon: <WaterHeaterIcon />,
    href: '/service/water-heaters',
  },
  {
    title: 'Water Softeners',
    description: 'Eliminate hard water damage. Protect your pipes, appliances, and enjoy softer skin and cleaner dishes.',
    image: '/images/water-softeners.jpg',
    icon: <WaterSoftenerIcon />,
    href: '/service/water-softeners',
  },
  {
    title: 'Water Filtration',
    description: 'Cleaner, better-tasting water from every tap. Remove chlorine, sediment, and contaminants for your family.',
    image: '/images/kitchen.jpg',
    icon: <WaterFilterIcon />,
    href: '/service/water-filtration',
  },
  {
    title: 'Toilets',
    description: 'We service all brands and types of toilets and keep many in stock for immediate replacement.',
    image: '/images/toilet.jpg',
    icon: <ToiletIcon />,
    href: '/service/toilets',
  },
  {
    title: 'Kitchen Plumbing',
    description: 'Keep your faucets, drains, supply lines, and garbage disposals running smoothly.',
    image: '/images/kitchen.jpg',
    icon: <KitchenIcon />,
    href: '/service/kitchen',
  },
  {
    title: 'Bathroom Plumbing',
    description: 'From faucet repairs to full remodels, we handle all your bathroom plumbing needs.',
    image: '/images/bathroom.jpg',
    icon: <BathroomIcon />,
    href: '/service/bathroom',
  },
  {
    title: 'Drain Clearing',
    description: 'No matter the difficulty of the clog, we carry all the equipment necessary to keep your system flowing smoothly.',
    image: '/images/drain_cleaning.jpg',
    icon: <DrainIcon />,
    href: '/service/clogged-pipes',
  },
  {
    title: 'Pipe Replacement',
    description: 'Expert repair and replacement for your critical main water and sewer lines using modern technology.',
    image: '/images/commercial.png',
    icon: <PipeIcon />,
    href: '/service/water-drain-lines',
  },
  {
    title: 'AC Repair',
    description: 'Fast diagnostics and repair for all AC makes and models. Beat the Central Texas heat with same-day service.',
    image: '/images/hvac/ac-repair.jpg',
    icon: <ACRepairIcon />,
    href: '/service/ac-repair',
  },
  {
    title: 'AC Installation',
    description: 'Properly sized, high-efficiency AC systems installed right the first time for maximum comfort and savings.',
    image: '/images/hvac/ac-installation.jpg',
    icon: <ACInstallIcon />,
    href: '/service/ac-installation',
  },
  {
    title: 'Heating Repair',
    description: 'Expert furnace and heat pump diagnostics to keep your home warm through Hill Country winters.',
    image: '/images/hvac/heating-repair.jpg',
    icon: <HeatingRepairIcon />,
    href: '/service/heating-repair',
  },
  {
    title: 'Heating Installation',
    description: 'New furnace and heat pump installation with proper sizing, energy rebates, and full warranty coverage.',
    image: '/images/hvac/heating-installation.jpg',
    icon: <HeatingInstallIcon />,
    href: '/service/heating-installation',
  },
  {
    title: 'Ductwork',
    description: 'Duct sealing, insulation, and design to eliminate hot spots, reduce energy waste, and improve air quality.',
    image: '/images/hvac/ductwork.jpg',
    icon: <DuctworkIcon />,
    href: '/service/ductwork',
  },
  {
    title: 'Heat Pumps',
    description: 'Energy-efficient heating and cooling in one system—ideal for the Central Texas climate.',
    image: '/images/hvac/heat-pumps.jpg',
    icon: <HeatPumpIcon />,
    href: '/service/heat-pumps',
  },
]

export function ServicesSection() {
  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-white to-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-14 lg:mb-20">
          <motion.p
            className="text-brand-blue text-sm lg:text-base font-semibold uppercase tracking-wider mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Full Service Plumbing & HVAC
          </motion.p>
          <motion.h2
            className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary text-balance"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Complete Plumbing & HVAC Solutions for Home & Business
          </motion.h2>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {services.map((service, index) => (
            <ServiceCard
              key={service.title}
              title={service.title}
              description={service.description}
              image={service.image}
              icon={service.icon}
              href={service.href}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
