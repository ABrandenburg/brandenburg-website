import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getServiceBySlug, getAllServiceSlugs } from '@/lib/services-data'
import { getFAQsByServiceSlug } from '@/lib/faqs-data'
import { ServiceHero } from '@/components/service-hero'
import { ServiceDescription } from '@/components/service-description'
import { VideoSection } from '@/components/video-section'
import { fetchYouTubeVideosInfo } from '@/lib/youtube-utils'
import { FAQAccordion } from '@/components/faq-accordion'
import { CTASection } from '@/components/cta-section'
import { ServiceAreasList } from '@/components/service-areas-list'
import { generateServiceSchema, generateBreadcrumbSchema } from '@/lib/json-ld'

interface ServicePageProps {
  params: Promise<{ slug: string }>
}

// Generate static params for all services
export async function generateStaticParams() {
  return getAllServiceSlugs().map((slug) => ({
    slug,
  }))
}

// Generate metadata for each service page
export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { slug } = await params
  const service = getServiceBySlug(slug)

  if (!service) {
    return {
      title: 'Service Not Found',
    }
  }

  return {
    title: service.metaTitle,
    description: service.metaDesc,
    alternates: {
      canonical: `https://www.brandenburgplumbing.com/service/${slug}`,
    },
    openGraph: {
      title: service.metaTitle,
      description: service.metaDesc,
      type: 'website',
      url: `https://www.brandenburgplumbing.com/service/${slug}`,
      images: [
        {
          url: service.image,
          width: 1200,
          height: 630,
          alt: `${service.name} services by Brandenburg Plumbing`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: service.metaTitle,
      description: service.metaDesc,
      images: [service.image],
    },
  }
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { slug } = await params
  const service = getServiceBySlug(slug)

  if (!service) {
    notFound()
  }

  // Get FAQs for this service
  const faqs = getFAQsByServiceSlug(slug)

  // Fetch video info if service has videos
  const videos = service.videos ? await fetchYouTubeVideosInfo(service.videos) : []

  // JSON-LD
  const serviceSchema = generateServiceSchema(service)
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'Services', item: '/#services' },
    { name: service.name, item: `/service/${service.slug}` },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <main>
        <ServiceHero service={service} />
        <ServiceDescription service={service} />
        {videos.length > 0 && (
          <VideoSection videos={videos} serviceName={service.name} />
        )}
        {faqs.length > 0 && (
          <FAQAccordion
            faqs={faqs}
            header={service.faqHeader}
          />
        )}
        <ServiceAreasList />
        <CTASection serviceName={service.name} />
      </main>
    </>
  )
}
