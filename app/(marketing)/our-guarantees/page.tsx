import type { Metadata } from 'next'
import { GuaranteesGrid } from '@/components/guarantees-grid'
import { PageHeader } from '@/components/page-header'
import { CTASection } from '@/components/cta-section'

export const metadata: Metadata = {
  title: 'Our Guarantees | Brandenburg Plumbing',
  description: 'Our promises to you: 100% satisfaction guarantee, lifetime labor warranty, 24/7 service, and price matching. We stand behind our work.',
  alternates: {
    canonical: 'https://www.brandenburgplumbing.com/our-guarantees',
  },
  openGraph: {
    title: 'Our Guarantees | Brandenburg Plumbing',
    description: 'Our promises to you: 100% satisfaction guarantee, lifetime labor warranty, 24/7 service, and price matching.',
    type: 'website',
    url: 'https://www.brandenburgplumbing.com/our-guarantees',
    images: ['/images/plumber-customer.jpg'],
  },
}

export default function GuaranteesPage() {
  return (
    <>
      <main>
        <PageHeader
          title="Our Guarantees"
          breadcrumb={[{ label: 'Our Guarantees' }]}
          description="Our promises to you: 100% satisfaction guarantee, lifetime labor warranty, 24/7 service, and price matching. We stand behind our work."
          imageSrc="/images/plumber-customer.jpg"
          imageAlt="Brandenburg Plumbing Guarantee"
        />
        <GuaranteesGrid />

        {/* CTA Section */}
        <CTASection headline="Experience Our Guarantee" />
      </main>
    </>
  )
}
