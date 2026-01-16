import type { Metadata } from 'next'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { TeamGrid } from '@/components/team-grid'
import { PageHeader } from '@/components/page-header'
import { CTASection } from '@/components/cta-section'

export const metadata: Metadata = {
  title: 'Meet Our Team | Brandenburg Plumbing',
  description: 'Meet the talented team at Brandenburg Plumbing. Our experienced plumbers and staff are dedicated to providing excellent service to the Highland Lakes & North Austin.',
  alternates: {
    canonical: 'https://www.brandenburgplumbing.com/meet-team',
  },
  openGraph: {
    title: 'Meet Our Team | Brandenburg Plumbing',
    description: 'Meet the talented team at Brandenburg Plumbing. Our experienced plumbers and staff are dedicated to providing excellent service to the Highland Lakes & North Austin.',
    type: 'website',
    url: 'https://www.brandenburgplumbing.com/meet-team',
    images: ['/images/team-photo.jpg'],
  },
}

export default function TeamPage() {
  return (
    <>
      <Header />
      <main>
        <PageHeader
          title="Meet Our Team"
          breadcrumb={[{ label: 'Meet the Team' }]}
          description="Meet the talented team at Brandenburg Plumbing. Our experienced plumbers and staff are dedicated to providing excellent service to the Highland Lakes & North Austin."
          imageSrc="/images/team-photo.jpg"
          imageAlt="The Brandenburg Plumbing Team"
        />
        <TeamGrid />

        {/* CTA Section */}
        <CTASection headline="Let Us Help You Today" />
      </main>
      <Footer />
    </>
  )
}
