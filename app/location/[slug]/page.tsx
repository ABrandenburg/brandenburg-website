import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { locations, getLocationBySlug, getAllLocationSlugs } from '@/lib/locations-data'
import { getGeneralFAQs } from '@/lib/faqs-data'
import { LocationHero } from '@/components/location-hero'
import { LocationServices } from '@/components/location-services'
import { TrustSection } from '@/components/trust-section'
import { ReviewsCarouselClient } from '@/components/reviews-carousel-client'
import { FAQAccordion } from '@/components/faq-accordion'
import { CTASection } from '@/components/cta-section'
import { generateLocationSchema, generateBreadcrumbSchema } from '@/lib/json-ld'

interface LocationPageProps {
  params: Promise<{ slug: string }>
}

// Generate static params for all locations
export async function generateStaticParams() {
  return getAllLocationSlugs().map((slug) => ({
    slug,
  }))
}

// Generate metadata for each location page
export async function generateMetadata({ params }: LocationPageProps): Promise<Metadata> {
  const { slug } = await params
  const location = getLocationBySlug(slug)

  if (!location) {
    return {
      title: 'Location Not Found',
    }
  }

  return {
    title: location.metaTitle,
    description: location.metaDesc,
    alternates: {
      canonical: `https://www.brandenburgplumbing.com/location/${slug}`,
    },
    openGraph: {
      title: location.metaTitle,
      description: location.metaDesc,
      type: 'website',
      url: `https://www.brandenburgplumbing.com/location/${slug}`,
      images: [
        {
          url: location.locationImage || '/images/service-trucks.jpg',
          width: 1200,
          height: 630,
          alt: `Brandenburg Plumbing serving ${location.name}, TX`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: location.metaTitle,
      description: location.metaDesc,
      images: [location.locationImage || '/images/service-trucks.jpg'],
    },
  }
}

export default async function LocationPage({ params }: LocationPageProps) {
  const { slug } = await params
  const location = getLocationBySlug(slug)

  if (!location) {
    notFound()
  }

  const faqs = getGeneralFAQs(8)

  // JSON-LD
  const locationSchema = generateLocationSchema(location)
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'Locations', item: '/#locations' }, // Or just pointing to home if no locations index
    { name: location.name, item: `/location/${location.slug}` },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(locationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <main>
        <LocationHero location={location} />
        <LocationServices
          locationName={location.name}
          header={location.servicesHeader}
        />
        <TrustSection
          locationName={location.name}
          header={location.trustHeader}
        />
        <ReviewsCarouselClient locationName={location.name} />
        <FAQAccordion
          faqs={faqs}
          header={location.faqHeader}
        />
        <CTASection locationName={location.name} />
      </main>
    </>
  )
}
