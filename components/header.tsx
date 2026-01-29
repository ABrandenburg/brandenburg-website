"use client"

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronDown, User, Key, CreditCard, Users } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { getServicesForNav } from '@/lib/services-data'
import { openScheduler } from '@/lib/scheduler'

const aboutLinks = [
  { name: 'Meet Our Team', href: '/meet-team' },
  { name: 'Our Guarantees', href: '/our-guarantees' },
  { name: 'Our History', href: '/about-us' },
  { name: 'FAQ', href: '/frequently-asked-questions' },
]

// Get services from data file
const { left: servicesLeft, right: servicesRight } = getServicesForNav()

const locationsLeft = [
  { name: 'Kingsland', href: '/location/kingsland' },
  { name: 'Cedar Park', href: '/location/cedar-park' },
  { name: 'Round Rock', href: '/location/round-rock' },
  { name: 'Granite Shoals', href: '/location/granite-shoals' },
  { name: 'Marble Falls', href: '/location/marble-falls' },
  { name: 'Georgetown', href: '/location/georgetown' },
]

const locationsRight = [
  { name: 'Burnet', href: '/location/burnet' },
  { name: 'Horseshoe Bay', href: '/location/horseshoe-bay' },
  { name: 'Liberty Hill', href: '/location/liberty-hill' },
  { name: 'Leander', href: '/location/leander' },
  { name: 'Spicewood', href: '/location/spicewood' },
  { name: 'Lampasas', href: '/location/lampasas' },
]

const utilityLinks = [
  { name: 'Customer Portal', href: 'https://brandenburgplumbing.myservicetitan.com/login', icon: User },
  { name: 'Membership', href: '/membership', icon: Key },
  { name: 'Financing', href: '/financing', icon: CreditCard },
  { name: 'Careers', href: '/careers', icon: Users },
]

// Service icons
const ServiceIcon = ({ type }: { type: string }) => {
  const iconClass = "w-5 h-5"
  switch (type) {
    case 'drain':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="3" />
          <circle cx="12" cy="5" r="1.5" />
          <circle cx="12" cy="19" r="1.5" />
          <circle cx="5" cy="12" r="1.5" />
          <circle cx="19" cy="12" r="1.5" />
        </svg>
      )
    case 'toilet':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <ellipse cx="12" cy="14" rx="7" ry="4" />
          <path d="M5 14V8a2 2 0 012-2h10a2 2 0 012 2v6" />
        </svg>
      )
    case 'bathroom':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <rect x="4" y="4" width="16" height="16" rx="2" />
        </svg>
      )
    case 'kitchen':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2v8M8 6h8M9 10v12h6V10" />
        </svg>
      )
    case 'filter':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="M8 12h8M8 8h8M8 16h8" />
        </svg>
      )
    case 'emergency':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      )
    case 'waterlines':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="6" width="16" height="4" />
          <rect x="4" y="14" width="16" height="4" />
        </svg>
      )
    case 'pipes':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="4" width="6" height="6" />
          <rect x="14" y="14" width="6" height="6" />
          <path d="M10 7h4v10h-4" />
        </svg>
      )
    case 'heater':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M8 14s1.5-2 4-2 4 2 4 2" />
          <path d="M8 10s1.5-2 4-2 4 2 4 2" />
          <path d="M8 18s1.5-2 4-2 4 2 4 2" />
        </svg>
      )
    case 'softener':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="6" y="4" width="12" height="16" rx="2" />
          <path d="M10 8h4M10 12h4" />
        </svg>
      )
    case 'commercial':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="6" width="16" height="14" />
          <path d="M8 6V4h8v2M8 14h8M8 10h8" />
        </svg>
      )
    default:
      return null
  }
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  return (
    <>
      {/* Top Banner */}
      <div className="bg-brand-blue text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-10 text-sm">
            {/* Left - Utility Links */}
            <div className="hidden md:flex items-center gap-6">
              {utilityLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
                >
                  <link.icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              ))}
            </div>

            {/* Right - Emergency Service */}
            <div className="flex-1 md:flex-none text-center md:text-right">
              <span className="text-white/90">24/7 Call Answering & Emergency Service</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white border-b border-gray-200 relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <Image
                src="/images/logo.png"
                alt="Brandenburg Plumbing"
                width={160}
                height={40}
                className="h-7 w-auto"
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
              {/* About Us Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setActiveDropdown('about')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button className="flex items-center gap-1 text-[15px] font-normal text-text-primary hover:text-text-muted transition-colors py-4">
                  About Us
                  <ChevronDown className="w-4 h-4" />
                </button>
                {activeDropdown === 'about' && (
                  <div className="absolute top-full left-0 pt-2">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="bg-white rounded-lg shadow-lg border border-gray-100 py-4 px-2 min-w-[200px]"
                    >
                      {aboutLinks.map((link) => (
                        <Link
                          key={link.name}
                          href={link.href}
                          className="block px-4 py-2.5 text-[15px] text-text-primary hover:bg-gray-50 hover:text-brand-blue hover:translate-x-1 rounded-md transition-all duration-200"
                        >
                          {link.name}
                        </Link>
                      ))}
                    </motion.div>
                  </div>
                )}
              </div>

              {/* Services Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setActiveDropdown('services')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button className="flex items-center gap-1 text-[15px] font-normal text-text-primary hover:text-text-muted transition-colors py-4">
                  Services
                  <ChevronDown className="w-4 h-4" />
                </button>
                {activeDropdown === 'services' && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="bg-white rounded-lg shadow-lg border border-gray-100 p-6 min-w-[500px]"
                    >
                      <div className="grid grid-cols-2 gap-x-8 gap-y-1">
                        {/* Left Column */}
                        <div className="space-y-1">
                          {servicesLeft.map((service) => (
                            <Link
                              key={service.slug}
                              href={`/service/${service.slug}`}
                              className="group flex items-center gap-3 px-2 py-2.5 text-[15px] text-text-primary hover:bg-gray-50 hover:translate-x-1 rounded-md transition-all duration-200"
                            >
                              <div className="w-10 h-10 shrink-0 bg-text-primary rounded-full flex items-center justify-center text-white group-hover:scale-110 group-hover:bg-brand-blue transition-all duration-300">
                                <ServiceIcon type={service.icon} />
                              </div>
                              <span className="group-hover:text-brand-blue transition-colors">{service.name}</span>
                            </Link>
                          ))}
                        </div>
                        {/* Right Column */}
                        <div className="space-y-1">
                          {servicesRight.map((service) => (
                            <Link
                              key={service.slug}
                              href={`/service/${service.slug}`}
                              className="group flex items-center gap-3 px-2 py-2.5 text-[15px] text-text-primary hover:bg-gray-50 hover:translate-x-1 rounded-md transition-all duration-200"
                            >
                              <div className="w-10 h-10 shrink-0 bg-text-primary rounded-full flex items-center justify-center text-white group-hover:scale-110 group-hover:bg-brand-blue transition-all duration-300">
                                <ServiceIcon type={service.icon} />
                              </div>
                              <span className="group-hover:text-brand-blue transition-colors">{service.name}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                      <div className="mt-6 pt-4 border-t border-gray-100">
                        <p className="text-sm text-text-muted">
                          Serving the Highland Lakes & North Austin with expert plumbing, gas, and sewer services since 1997.
                        </p>
                      </div>
                    </motion.div>
                  </div>
                )}
              </div>

              {/* Locations Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setActiveDropdown('locations')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button className="flex items-center gap-1 text-[15px] font-normal text-text-primary hover:text-text-muted transition-colors py-4">
                  Locations
                  <ChevronDown className="w-4 h-4" />
                </button>
                {activeDropdown === 'locations' && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="bg-white rounded-lg shadow-lg border border-gray-100 py-4 px-2 min-w-[320px]"
                    >
                      <div className="grid grid-cols-2 gap-x-4">
                        {/* Left Column */}
                        <div>
                          {locationsLeft.map((location) => (
                            <Link
                              key={location.name}
                              href={location.href}
                              className="block px-4 py-2.5 text-[15px] text-text-primary hover:bg-gray-50 hover:text-brand-blue hover:translate-x-1 rounded-md transition-all duration-200"
                            >
                              {location.name}
                            </Link>
                          ))}
                        </div>
                        {/* Right Column */}
                        <div>
                          {locationsRight.map((location) => (
                            <Link
                              key={location.name}
                              href={location.href}
                              className="block px-4 py-2.5 text-[15px] text-text-primary hover:bg-gray-50 hover:text-brand-blue hover:translate-x-1 rounded-md transition-all duration-200"
                            >
                              {location.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <Link
                          href="/service-area"
                          className="block px-4 py-2 text-[15px] font-medium text-brand-blue hover:bg-gray-50 rounded-md transition-colors"
                        >
                          View All Locations →
                        </Link>
                      </div>
                    </motion.div>
                  </div>
                )}
              </div>

              {/* Regular Links */}
              <Link
                href="/blog"
                className="text-[15px] font-normal text-text-primary hover:text-text-muted transition-colors"
              >
                Blogs
              </Link>
              <Link
                href="/contact"
                className="text-[15px] font-normal text-text-primary hover:text-text-muted transition-colors"
              >
                Contact Us
              </Link>
            </nav>

            {/* Right side actions */}
            <div className="hidden lg:flex items-center gap-4">
              {/* Phone Number */}
              <Link
                href="tel:512-756-9847"
                className="text-[15px] font-normal text-text-primary hover:text-text-muted transition-colors"
              >
                (512) 756-9847
              </Link>

              {/* Book Online Button */}
              <Button
                type="button"
                onClick={openScheduler}
                className="bg-brand-red hover:bg-brand-red/90 text-white px-6 h-10 shadow-none book-button"
              >
                Book Online
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 text-text-primary"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="lg:hidden border-t border-gray-200 bg-white overflow-hidden"
            >
              <div className="px-4 py-4 space-y-2">
                <div className="py-2">
                  <p className="font-medium text-text-primary mb-2">About Us</p>
                  {aboutLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      className="block py-2 pl-4 text-sm text-text-muted hover:text-brand-blue hover:translate-x-1 transition-all"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
                <div className="py-2 border-t border-gray-100">
                  <p className="font-medium text-text-primary mb-2">Services</p>
                  {[...servicesLeft, ...servicesRight].map((service) => (
                    <Link
                      key={service.slug}
                      href={`/service/${service.slug}`}
                      className="block py-2 pl-4 text-sm text-text-muted hover:text-brand-blue hover:translate-x-1 transition-all"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {service.name}
                    </Link>
                  ))}
                </div>
                <div className="py-2 border-t border-gray-100">
                  <p className="font-medium text-text-primary mb-2">Locations</p>
                  {[...locationsLeft, ...locationsRight].map((location) => (
                    <Link
                      key={location.name}
                      href={location.href}
                      className="block py-2 pl-4 text-sm text-text-muted hover:text-brand-blue hover:translate-x-1 transition-all"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {location.name}
                    </Link>
                  ))}
                </div>
                <div className="py-2 border-t border-gray-100">
                  <p className="font-medium text-text-primary mb-2">Resources</p>
                  {utilityLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      className="flex items-center gap-2 py-2 pl-4 text-sm text-text-muted hover:text-brand-blue hover:translate-x-1 transition-all"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <link.icon className="w-4 h-4" />
                      <span>{link.name}</span>
                    </Link>
                  ))}
                </div>
                <Link
                  href="/blog"
                  className="block py-3 text-base text-text-primary border-t border-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Blogs
                </Link>
                <Link
                  href="/contact"
                  className="block py-3 text-base text-text-primary border-t border-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact Us
                </Link>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  )
}
