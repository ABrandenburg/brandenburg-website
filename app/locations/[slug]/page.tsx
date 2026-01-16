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
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

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
    openGraph: {
      title: location.metaTitle,
      description: location.metaDesc,
      type: 'website',
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

  return (
    <>
      <Header />
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
      <Footer />
    </>
  )
}
