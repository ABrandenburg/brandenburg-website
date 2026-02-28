import { Metadata } from 'next'
import { WeddingQuestionnaireForm } from '@/components/wedding-questionnaire-form'
import { PageHeader } from '@/components/page-header'

export const metadata: Metadata = {
  title: 'Wedding Plumbing Questionnaire | Brandenburg Plumbing',
  description: 'Planning a wedding? Fill out our questionnaire so we can provide the right plumbing services for your venue. Portable restrooms, temporary water lines, and more.',
  alternates: {
    canonical: 'https://www.brandenburgplumbing.com/wedding-questionnaire',
  },
  openGraph: {
    title: 'Wedding Plumbing Questionnaire | Brandenburg Plumbing',
    description: 'Planning a wedding? Fill out our questionnaire so we can provide the right plumbing services for your venue.',
    type: 'website',
    url: 'https://www.brandenburgplumbing.com/wedding-questionnaire',
  },
}

export default function WeddingQuestionnairePage() {
  return (
    <main className="bg-white">
      <PageHeader
        title="Wedding Questionnaire"
        breadcrumb={[{ label: 'Wedding Questionnaire' }]}
        description="Tell us about your upcoming wedding so we can help ensure your venue's plumbing is ready for the big day."
        imageSrc="/images/plumber-customer.jpg"
        imageAlt="Plumber helping customer"
      />
      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <WeddingQuestionnaireForm />
        </div>
      </section>
    </main>
  )
}
