"use client"

import Link from 'next/link'
import { Phone, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { openScheduler } from '@/lib/scheduler'

export function HomeCTASection() {
  return (
    <section className="py-16 lg:py-24 bg-brand-blue">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Headline */}
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
          Family-Owned Service You Can Count On - Day or Night
        </h2>

        {/* Subheadline */}
        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          Our expert plumbers are standing by 24/7. Schedule your repair today and get upfront pricing with no hidden fees.
        </p>

        {/* CTAs */}
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
