"use client"

import Image from 'next/image'
import Link from 'next/link'
import { Phone, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { openScheduler } from '@/lib/scheduler'

export function HvacHero() {
  return (
    <section className="relative bg-gradient-to-br from-gray-50 to-white pt-8 pb-16 lg:pt-12 lg:pb-24 overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="order-2 lg:order-1">
            {/* Breadcrumb */}
            <div className="mb-4">
              <nav className="flex items-center gap-2 text-sm text-gray-500">
                <Link href="/" className="hover:text-brand-blue transition-colors">Home</Link>
                <span>/</span>
                <span className="text-brand-blue font-medium">HVAC Services</span>
              </nav>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-brand-blue leading-tight mb-6">
              Your Trusted Local HVAC Company in the Highland Lakes & North Austin
            </h1>

            {/* Description */}
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              From emergency AC repair to complete system installations, Brandenburg Plumbing delivers reliable heating and air conditioning services backed by 27+ years of experience. Licensed, insured, and committed to your comfort.
            </p>

            {/* Value Props */}
            <p className="text-sm font-medium text-gray-600 mb-8">
              Licensed &amp; insured · Same-day service · Upfront pricing
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                size="lg"
                className="bg-brand-red hover:bg-brand-red/90 text-white shadow-button hover:shadow-button-hover"
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
                className="border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white book-button flex items-center gap-2"
              >
                <Calendar className="w-5 h-5" />
                <span>Book Online</span>
              </Button>
            </div>
          </div>

          {/* Image */}
          <div className="order-1 lg:order-2">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-soft-xl">
              <Image
                src="/images/hvac/ac-repair.jpg"
                alt="Brandenburg Plumbing HVAC technician servicing an air conditioning unit"
                fill
                className="object-cover"
                priority
              />
              {/* Overlay Badge */}
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-lg shadow-soft">
                <p className="text-sm font-medium text-brand-blue">
                  TACLA21988C Licensed
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
