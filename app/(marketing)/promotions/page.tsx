import type { Metadata } from 'next'
import Link from 'next/link'
import { Breadcrumb } from '@/components/breadcrumb'
import { Button } from '@/components/ui/button'
import { Phone, Tag, Calendar } from 'lucide-react'
import { openScheduler } from '@/lib/scheduler'

export const metadata: Metadata = {
  title: 'Current Promotions | Brandenburg Plumbing',
  description: 'Save on plumbing services with current promotions and special offers from Brandenburg Plumbing. Limited time offers available.',
  alternates: {
    canonical: 'https://www.brandenburgplumbing.com/promotions',
  },
  openGraph: {
    title: 'Current Promotions | Brandenburg Plumbing',
    description: 'Save on plumbing services with current promotions and special offers from Brandenburg Plumbing.',
    type: 'website',
    url: 'https://www.brandenburgplumbing.com/promotions',
    images: ['/images/plumber-customer.jpg'],
  },
}

export default function PromotionsPage() {
  return (
    <>
      <main className="bg-white">
        {/* Hero Section */}
        <section className="pt-8 pb-16 md:pt-12 md:pb-24 bg-gradient-to-br from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
            <Breadcrumb items={[{ label: 'Promotions' }]} />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-brand-red/10 text-brand-red px-4 py-2 rounded-full mb-6">
                <Tag className="w-4 h-4" />
                <span className="text-sm font-semibold">Special Offers</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-text-primary mb-6">
                Current Promotions
              </h1>
              <p className="text-lg text-text-muted">
                Take advantage of our current special offers and save on quality plumbing services.
              </p>
            </div>
          </div>
        </section>

        {/* Promotions Grid */}
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Membership Promotion */}
              <div className="bg-brand-blue text-white rounded-2xl p-8 md:p-10">
                <h3 className="text-2xl font-serif font-bold mb-4">
                  Maintenance+ Membership
                </h3>
                <p className="text-white/90 mb-6">
                  Join our membership program and enjoy 15% off all services, priority scheduling,
                  and annual inspections—all for just $19/month.
                </p>
                <div className="flex items-center gap-2 text-white/80 mb-6">
                  <Calendar className="w-5 h-5" />
                  <span>Ongoing offer</span>
                </div>
                <Button
                  asChild
                  className="bg-white text-brand-blue hover:bg-gray-100"
                >
                  <Link href="/membership">Learn More</Link>
                </Button>
              </div>

              {/* Free Estimate */}
              <div className="bg-gray-50 rounded-2xl p-8 md:p-10">
                <h3 className="text-2xl font-serif font-bold text-text-primary mb-4">
                  Free Estimates
                </h3>
                <p className="text-text-muted mb-6">
                  Not sure what&apos;s wrong? We offer free estimates on all plumbing services.
                  No obligation, no pressure—just honest advice.
                </p>
                <div className="flex items-center gap-2 text-text-muted mb-6">
                  <Calendar className="w-5 h-5" />
                  <span>Always available</span>
                </div>
                <Button
                  asChild
                  className="bg-brand-red hover:bg-brand-red/90 text-white"
                >
                  <Link href="tel:512-756-9847" className="inline-flex items-center gap-2">
                    <Phone className="w-5 h-5" />
                    Call for Estimate
                  </Link>
                </Button>
              </div>
            </div>

            {/* Contact for More */}
            <div className="mt-12 text-center">
              <p className="text-text-muted mb-4">
                Ask about additional seasonal promotions and discounts for seniors and military.
              </p>
              <Button
                asChild
                variant="outline"
              >
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-serif text-text-primary mb-4">
              Ready to Save?
            </h2>
            <p className="text-lg text-text-muted mb-8 max-w-xl mx-auto">
              Book your service today and mention any promotion to receive your discount.
            </p>
            <Button
              type="button"
              onClick={openScheduler}
              className="bg-brand-red hover:bg-brand-red/90 text-white px-8 py-3 text-lg h-auto book-button"
            >
              Book Online
            </Button>
          </div>
        </section>
      </main>
    </>
  )
}
