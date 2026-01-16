import { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { ContactForm } from '@/components/contact-form'
import { MessageSquare, Phone, MapPin } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contact Us | Brandenburg Plumbing',
  description: 'Contact Brandenburg Plumbing for all your plumbing needs. Available 24/7 for emergency service. Serving the Highland Lakes & North Austin.',
  alternates: {
    canonical: 'https://www.brandenburgplumbing.com/contact',
  },
  openGraph: {
    title: 'Contact Us | Brandenburg Plumbing',
    description: 'Contact Brandenburg Plumbing for all your plumbing needs. Available 24/7 for emergency service.',
    type: 'website',
    url: 'https://www.brandenburgplumbing.com/contact',
    images: ['/images/plumber-customer.jpg'],
  },
}

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="bg-white">
        <PageHeader
          title="Contact Us"
          breadcrumb={[{ label: 'Contact' }]}
          description="Have a plumbing question or ready to schedule? We typically respond within 2 hours during business hours."
          imageSrc="/images/plumber-customer.jpg"
          imageAlt="Plumber helping customer"
        />
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
              {/* Left Column - Contact Info */}
              <div>
                <div className="space-y-6">
                  {/* Email */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-5 h-5 text-text-primary" />
                    </div>
                    <div>
                      <Link
                        href="mailto:service@brandenburgplumbing.com"
                        className="text-text-primary hover:text-brand-blue transition-colors"
                      >
                        service@brandenburgplumbing.com
                      </Link>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-text-primary" />
                    </div>
                    <div>
                      <Link
                        href="tel:737-251-5017"
                        className="text-text-primary hover:text-brand-blue transition-colors"
                      >
                        (737) 251-5017
                      </Link>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-text-primary" />
                    </div>
                    <div className="text-text-primary">
                      <p>320 North Ridge Rd.</p>
                      <p>Bldg. 2 Unit B</p>
                      <p>Marble Falls, TX 78654</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Form */}
              <div>
                <ContactForm />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
