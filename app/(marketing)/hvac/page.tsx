import { Metadata } from 'next'
import { getHvacServices } from '@/lib/services-data'
import { getFAQsByServiceSlug } from '@/lib/faqs-data'
import { HvacHero } from '@/components/hvac-hero'
import { HvacServicesGrid } from '@/components/hvac-services-grid'
import { ServiceDescription } from '@/components/service-description'
import { FAQAccordion } from '@/components/faq-accordion'
import { ServiceAreasList } from '@/components/service-areas-list'
import { CTASection } from '@/components/cta-section'
import { generateBreadcrumbSchema } from '@/lib/json-ld'

export const metadata: Metadata = {
  title: 'HVAC Services - Air Conditioning & Heating',
  description:
    'Licensed HVAC company serving the Highland Lakes & North Austin. AC repair, heating installation, heat pumps, and ductwork. Family-owned since 1997. Call (512) 756-9847.',
  alternates: {
    canonical: 'https://www.brandenburgplumbing.com/hvac',
  },
  openGraph: {
    title: 'HVAC Services - Air Conditioning & Heating | Brandenburg Plumbing',
    description:
      'Licensed HVAC company serving the Highland Lakes & North Austin. AC repair, heating installation, heat pumps, and ductwork. Family-owned since 1997.',
    type: 'website',
    url: 'https://www.brandenburgplumbing.com/hvac',
    images: [
      {
        url: '/images/hvac/ac-repair.jpg',
        width: 1200,
        height: 630,
        alt: 'Brandenburg Plumbing HVAC Services',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HVAC Services - Air Conditioning & Heating | Brandenburg Plumbing',
    description:
      'Licensed HVAC company serving the Highland Lakes & North Austin. AC repair, heating installation, heat pumps, and ductwork.',
    images: ['/images/hvac/ac-repair.jpg'],
  },
}

export default function HvacPage() {
  const hvacServices = getHvacServices()

  // Gather a mix of HVAC FAQs (first 2 from each service)
  const hvacFaqs = hvacServices.flatMap((service) =>
    getFAQsByServiceSlug(service.slug).slice(0, 2)
  )

  const hvacBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'HVACBusiness',
    name: 'Brandenburg Plumbing',
    description:
      'Licensed HVAC company serving the Highland Lakes & North Austin with AC repair, heating installation, heat pumps, ductwork, and more. Family-owned since 1997.',
    url: 'https://www.brandenburgplumbing.com/hvac',
    telephone: '+1-512-756-9847',
    image: 'https://www.brandenburgplumbing.com/images/hvac/ac-repair.jpg',
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '320 North Ridge Road',
      addressLocality: 'Marble Falls',
      addressRegion: 'TX',
      postalCode: '78654',
      addressCountry: 'US',
    },
    areaServed: {
      '@type': 'Place',
      name: 'Highland Lakes & North Austin, Texas',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'HVAC Services',
      itemListElement: hvacServices.map((service) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: service.name,
          url: `https://www.brandenburgplumbing.com/service/${service.slug}`,
        },
      })),
    },
  }

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'HVAC Services', item: '/hvac' },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(hvacBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <main>
        <HvacHero />
        <HvacServicesGrid services={hvacServices} />
        <ServiceDescription
          service={{
            name: 'HVAC',
            slug: 'hvac',
            servicesHeader: '',
            metaTitle: '',
            metaDesc: '',
            trustHeader: 'Why Homeowners Trust Us for Heating & Air Conditioning',
            locationBlurb:
              'Providing best-in-class HVAC services in the Highland Lakes & North Austin. Licensed, insured, and backed by 27+ years of experience.',
            serviceSubheading: '',
            faqHeader: '',
            faqIds: [],
            image: '/images/hvac/ac-repair.jpg',
            icon: 'ac-repair',
          }}
        />
        {hvacFaqs.length > 0 && (
          <FAQAccordion
            faqs={hvacFaqs}
            header="Common HVAC Questions"
          />
        )}
        <ServiceAreasList />
        <CTASection headline="Need HVAC Service?" />
      </main>
    </>
  )
}
