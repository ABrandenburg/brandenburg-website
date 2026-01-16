import type { Metadata } from 'next'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { FAQAccordionSimple } from '@/components/faq-accordion-simple'
import { PageHeader } from '@/components/page-header'
import { Breadcrumb } from '@/components/breadcrumb'
import { CTASection } from '@/components/cta-section'
import { getGeneralCompanyFAQs } from '@/lib/faqs-data'

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | Brandenburg Plumbing',
  description: 'Find answers to common questions about our plumbing services, pricing, service areas, hours, and more. Brandenburg Plumbing serves the Highland Lakes & North Austin.',
  alternates: {
    canonical: 'https://www.brandenburgplumbing.com/frequently-asked-questions',
  },
  openGraph: {
    title: 'Frequently Asked Questions | Brandenburg Plumbing',
    description: 'Find answers to common questions about our plumbing services, pricing, service areas, and more.',
    type: 'website',
    url: 'https://www.brandenburgplumbing.com/frequently-asked-questions',
    images: ['/images/plumber-customer.jpg'],
  },
}

export default function FAQPage() {
  const faqs = getGeneralCompanyFAQs()

  // Generate FAQPage JSON-LD schema
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Header />
      <main className="bg-white">
        <PageHeader
          title="Frequently Asked Questions"
          breadcrumb={[{ label: 'FAQ' }]}
          description="We're here to answer your questions."
          imageSrc="/images/bathroom.jpg"
          imageAlt="Clean modern bathroom"
        />
        <section className="pt-8 pb-16 md:pt-12 md:pb-24 lg:pb-32">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
            <FAQAccordionSimple faqs={faqs} defaultOpenIndex={0} />
          </div>
        </section>

        {/* CTA Section */}
        <CTASection headline="Still Have Questions?" />
      </main>
      <Footer />
    </>
  )
}
