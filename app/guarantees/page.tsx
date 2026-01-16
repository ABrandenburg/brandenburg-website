import type { Metadata } from 'next'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { GuaranteesHero } from '@/components/guarantees-hero'
import { GuaranteesGrid } from '@/components/guarantees-grid'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Our Guarantees | Brandenburg Plumbing',
  description: 'Our promises to you: 100% satisfaction guarantee, lifetime labor warranty, 24/7 service, and price matching. We stand behind our work.',
}

export default function GuaranteesPage() {
  return (
    <>
      <Header />
      <main>
        <GuaranteesHero />
        <GuaranteesGrid />

        {/* Simple CTA Section */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-text-primary mb-8">
              Schedule Service Instantly
            </h2>
            <Button 
              className="bg-brand-red hover:bg-brand-red/90 text-white px-8 py-3 text-lg h-auto"
            >
              Book Online
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
