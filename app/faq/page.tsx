import type { Metadata } from 'next'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { FAQAccordionSimple } from '@/components/faq-accordion-simple'
import { getGeneralCompanyFAQs } from '@/lib/faqs-data'

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | Brandenburg Plumbing',
  description: 'Find answers to common questions about our plumbing services, pricing, service areas, hours, and more. Brandenburg Plumbing serves the Highland Lakes and North Austin areas.',
}

export default function FAQPage() {
  const faqs = getGeneralCompanyFAQs()

  return (
    <>
      <Header />
      <main className="bg-white">
        <section className="py-16 md:py-24 lg:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
              {/* Left Column - Title */}
              <div className="lg:col-span-4">
                <div className="lg:sticky lg:top-32">
                  <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-4">
                    We&apos;re here to answer your questions.
                  </p>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-text-primary leading-tight">
                    Frequently Asked Questions
                  </h1>
                </div>
              </div>

              {/* Right Column - FAQs */}
              <div className="lg:col-span-8">
                <FAQAccordionSimple faqs={faqs} defaultOpenIndex={0} />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
