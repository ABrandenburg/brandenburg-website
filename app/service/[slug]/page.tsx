import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getServiceBySlug, getAllServiceSlugs } from '@/lib/services-data'
import { getFAQsByServiceSlug } from '@/lib/faqs-data'
import { ServiceHero } from '@/components/service-hero'
import { ServiceDescription } from '@/components/service-description'
import { FAQAccordion } from '@/components/faq-accordion'
import { CTASection } from '@/components/cta-section'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

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

  return (
    <>
      <Header />
      <main>
        <ServiceHero service={service} />
        <ServiceDescription service={service} />
        {faqs.length > 0 && (
          <FAQAccordion 
            faqs={faqs} 
            header={service.faqHeader} 
          />
        )}
        <CTASection serviceName={service.name} />
      </main>
      <Footer />
    </>
  )
}
