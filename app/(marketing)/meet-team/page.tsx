import type { Metadata } from 'next'
import { TeamGrid } from '@/components/team-grid'
import { CTASection } from '@/components/cta-section'
import { PageHeader } from '@/components/page-header'

export const metadata: Metadata = {
  title: 'Meet Our Team | Brandenburg Plumbing',
  description: 'Meet the talented team at Brandenburg Plumbing. Our experienced plumbing and HVAC technicians are dedicated to providing excellent service to the Highland Lakes & North Austin.',
  alternates: {
    canonical: 'https://www.brandenburgplumbing.com/meet-team',
  },
  openGraph: {
    title: 'Meet Our Team | Brandenburg Plumbing',
    description: 'Meet the talented team at Brandenburg Plumbing. Our experienced plumbing and HVAC technicians are dedicated to providing excellent service to the Highland Lakes & North Austin.',
    type: 'website',
    url: 'https://www.brandenburgplumbing.com/meet-team',
    images: ['/images/team-photo.jpg'],
  },
}

export default function TeamPage() {
  return (
    <>
      <main>
        <PageHeader
          title="Meet Our Team"
          breadcrumb={[{ label: 'Meet the Team' }]}
          description="Meet the talented team at Brandenburg Plumbing. Our experienced plumbing and HVAC technicians are dedicated to providing excellent service in the Highland Lakes & North Austin."
          imageSrc="/images/team-photo.jpg"
          imageAlt="The Brandenburg Plumbing Team"
        />
        <TeamGrid />

        {/* CTA Section */}
        <CTASection headline="Let Us Help You Today" />
      </main>
    </>
  )
}
