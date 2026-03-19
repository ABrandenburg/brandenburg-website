"use client"

import Link from 'next/link'
import { Phone, Calendar } from 'lucide-react'
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
      ? serviceName.toLowerCase().includes('service')
        ? `Need ${serviceName}?`
        : `Need ${serviceName} Service?`
      : locationName
        ? `Ready to Schedule Service in ${locationName}?`
        : 'Ready to Schedule Service?'
  return (
    <section className="py-16 lg:py-24 bg-brand-blue">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
          {headline}
        </h2>
        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          Our expert technicians are standing by to help. Get upfront pricing with no hidden fees.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            asChild
            size="lg"
            className="bg-brand-red hover:bg-brand-red/90 text-white shadow-lg hover:shadow-xl text-lg px-8"
          >
            <Link href="tel:512-756-9847" className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              <span>(512) 756-9847</span>
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
      </div>
    </section>
  )
}
