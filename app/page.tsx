import type { Metadata } from 'next'
import { Header } from '@/components/header'
import { Hero } from '@/components/hero'
import { ServicesSection } from '@/components/services-section'
import { HomeTrustSection } from '@/components/home-trust-section'
import { HomeReviewsSection } from '@/components/home-reviews-section'
import { BrandLogos } from '@/components/brand-logos'
import { HomeCTASection } from '@/components/home-cta-section'
import { Footer } from '@/components/footer'

export const metadata: Metadata = {
  title: 'Plumbing Repair, Replace, and Install Service | Brandenburg Plumbing',
  description: 'Expert Highland Lakes & North Austin plumbers you can trust. 24/7 same day service, fully licensed & insured, lifetime labor guarantee. Serving Burnet County since 1997.',
  alternates: {
    canonical: 'https://www.brandenburgplumbing.com',
  },
  openGraph: {
    title: 'Brandenburg Plumbing | Expert Highland Lakes & North Austin Plumbers',
    description: 'Expert Highland Lakes & North Austin plumbers you can trust. 24/7 same day service, fully licensed & insured, lifetime labor guarantee.',
    url: 'https://www.brandenburgplumbing.com',
    type: 'website',
    images: [
      {
        url: '/images/team-photo.jpg',
        width: 1200,
        height: 630,
        alt: 'Brandenburg Plumbing Team',
      },
    ],
  },
}

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <HomeTrustSection />
        <ServicesSection />
        <HomeReviewsSection />
        <BrandLogos />
        <HomeCTASection />
      </main>
      <Footer />
    </>
  )
}
