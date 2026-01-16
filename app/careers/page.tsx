import { Metadata } from 'next'
import { CareersForm } from '@/components/careers-form'
import { CareersBenefits } from '@/components/careers-benefits'
import { Breadcrumb } from '@/components/breadcrumb'

export const metadata: Metadata = {
  title: 'Careers | Join Our Team | Brandenburg Plumbing',
  description: 'Join the Brandenburg Plumbing team! We offer competitive pay, excellent benefits, and career growth opportunities. Apply today for plumbing and support positions.',
  alternates: {
    canonical: 'https://www.brandenburgplumbing.com/careers',
  },
  openGraph: {
    title: 'Careers | Join Our Team | Brandenburg Plumbing',
    description: 'Join the Brandenburg Plumbing team! We offer competitive pay, excellent benefits, and career growth opportunities.',
    type: 'website',
    url: 'https://www.brandenburgplumbing.com/careers',
    images: ['/images/team-photo.jpg'],
  },
}

export default function CareersPage() {
  return (
    <>
      <main className="bg-white">
        <PageHeader
          title="Join Our Team"
          breadcrumb={[{ label: 'Careers' }]}
          description="We offer competitive pay, excellent benefits, and career growth opportunities."
          imageSrc="/images/Selects/full_team.jpg"
          imageAlt="Brandenburg Plumbing Team"
          ctaText="See Benefits"
          ctaLink="#benefits"
        />



        {/* Application Form */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-text-primary mb-4">
                Apply Now
              </h2>
              <p className="text-text-muted text-lg">
                Ready to join our team? Fill out the form below and we&apos;ll be in touch.
              </p>
            </div>
            <CareersForm />
          </div>
        </section>

        {/* Benefits Section */}
        <CareersBenefits />
      </main>
    </>
  )
}
