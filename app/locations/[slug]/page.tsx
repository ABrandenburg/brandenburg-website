import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { locations, getLocationBySlug, getAllLocationSlugs } from '@/lib/locations-data'
import { getGeneralFAQs } from '@/lib/faqs-data'
import { fetchGoogleReviews } from '@/lib/google-reviews'
import { LocationHero } from '@/components/location-hero'
import { LocationServices } from '@/components/location-services'
import { TrustSection } from '@/components/trust-section'
import { ReviewsCarousel } from '@/components/reviews-carousel'
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

  // Fetch reviews and FAQs
  const reviews = await fetchGoogleReviews()
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
        {reviews && reviews.length > 0 && (
          <ReviewsCarousel 
            reviews={reviews} 
            locationName={location.name} 
          />
        )}
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
