import type { Metadata } from 'next'
import { HistorySection } from '@/components/history-section'
import { getHistorySections } from '@/lib/history-data'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Our Family History | Brandenburg Plumbing',
  description: 'Discover the multi-generational legacy of Brandenburg Plumbing, from our great-grandpa\'s Chicago roots to serving the Highland Lakes today.',
}

export default function AboutPage() {
  const historySections = getHistorySections()

  return (
    <>
      <main className="bg-white">
        {/* Page Title */}
        <section className="pt-16 md:pt-24 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-text-primary text-center">
              Our Family History
            </h1>
          </div>
        </section>

        {/* History Sections */}
        {historySections.map((section) => (
          <HistorySection key={section.id} section={section} />
        ))}

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
    </>
  )
}
