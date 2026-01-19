import type { Metadata } from 'next'
import { HistorySection } from '@/components/history-section'
import { Breadcrumb } from '@/components/breadcrumb'
import { CTASection } from '@/components/cta-section'
import { PageHeader } from '@/components/page-header'
import { getHistorySections } from '@/lib/history-data'

export const metadata: Metadata = {
  title: 'Our Family History | Brandenburg Plumbing',
  description: 'Discover the multi-generational legacy of Brandenburg Plumbing, from our great-grandpa\'s Chicago roots to serving the Highland Lakes today.',
  alternates: {
    canonical: 'https://www.brandenburgplumbing.com/about-us',
  },
  openGraph: {
    title: 'Our Family History | Brandenburg Plumbing',
    description: 'Discover the multi-generational legacy of Brandenburg Plumbing, from our great-grandpa\'s Chicago roots to serving the Highland Lakes today.',
    type: 'website',
    url: 'https://www.brandenburgplumbing.com/about-us',
    images: ['/images/history/troy-digging.jpeg'],
  },
}

export default function AboutPage() {
  const historySections = getHistorySections()

  return (
    <>
      <main className="bg-white">
        <PageHeader
          title="Our Family History"
          breadcrumb={[{ label: 'Our History' }]}
          imageSrc="/images/home-hero-team.jpg"
          imageAlt="The Brandenburg Plumbing Team"
        />

        {/* History Sections */}
        {historySections.map((section) => (
          <HistorySection key={section.id} section={section} />
        ))}

        {/* CTA Section */}
        <CTASection headline="Continue the Legacy With Us" />
      </main>
    </>
  )
}
