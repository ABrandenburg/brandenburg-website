"use client"

import Image from 'next/image'
import Link from 'next/link'
import { Phone, Calendar, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { openScheduler } from '@/lib/scheduler'
import type { Location } from '@/lib/locations-data'

interface LocationHeroProps {
  location: Location
}

export function LocationHero({ location }: LocationHeroProps) {
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
                <Link href="/service-area" className="hover:text-brand-blue transition-colors">Service Area</Link>
                <span>/</span>
                <span className="text-brand-blue font-medium">{location.name}</span>
              </nav>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-brand-blue leading-tight mb-6">
              {location.mainHeaderText}
            </h1>

            {/* Description */}
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              {location.locationBlurb}
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

            {/* Google Rating */}
            <div className="mt-8 flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-gray-600">
                <span className="font-semibold text-gray-900">4.9</span> rating on Google
              </span>
            </div>
          </div>

          {/* Image */}
          <div className="order-1 lg:order-2">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-soft-xl">
              <Image
                src="/images/team-hero.jpg"
                alt={`The Brandenburg Plumbing team serving ${location.name}`}
                fill
                className="object-cover"
                priority
              />
              {/* Overlay Badge */}
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-lg shadow-soft">
                <p className="text-sm font-medium text-brand-blue">
                  Serving {location.name} since 1997
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
