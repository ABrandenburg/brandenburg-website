"use client"

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Phone, Calendar, Clock, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { openScheduler } from '@/lib/scheduler'

interface CTASectionProps {
  locationName?: string
  serviceName?: string
  headline?: string
}

export function CTASection({ locationName, serviceName, headline: customHeadline }: CTASectionProps) {
  const headline = customHeadline
    ? customHeadline
    : serviceName
      ? `Need ${serviceName} Service?`
      : locationName
        ? `Ready to Schedule Service in ${locationName}?`
        : 'Ready to Schedule Service?'
  return (
    <section className="py-16 lg:py-24 bg-brand-blue relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full mb-6">
            <Clock className="w-5 h-5 text-white" />
            <span className="text-white font-medium text-sm">24/7 Emergency Service Available</span>
          </div>

          {/* Headline */}
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            {headline}
          </h2>

          {/* Subheadline */}
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Our expert plumbers are standing by to help. Get upfront pricing with no hidden fees.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button
              asChild
              size="lg"
              className="bg-brand-red hover:bg-brand-red/90 text-white shadow-lg hover:shadow-xl text-lg px-8"
            >
              <Link href="tel:512-756-7654" className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                <span>(512) 756-7654</span>
              </Link>
            </Button>
            <Button
              type="button"
              onClick={openScheduler}
              variant="outline"
              size="lg"
              className="bg-transparent border-white text-white hover:bg-white hover:text-brand-blue text-lg px-8 book-button flex items-center gap-2"
            >
              <Calendar className="w-5 h-5" />
              <span>Book Online</span>
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-6 text-white/80">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span className="text-sm">Licensed & Insured</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
              </svg>
              <span className="text-sm">100% Satisfaction Guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
              <span className="text-sm">Upfront Pricing</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
