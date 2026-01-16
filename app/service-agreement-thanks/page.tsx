import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle, Phone, Calendar } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Thank You | Brandenburg Plumbing',
  description: 'Thank you for signing up for a service agreement with Brandenburg Plumbing.',
}

export default function ServiceAgreementThanksPage() {
  return (
    <>
      <main className="bg-white">
        <section className="py-24 md:py-32">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-serif text-text-primary mb-6">
              Thank You!
            </h1>
            
            <p className="text-lg text-text-muted mb-8">
              Your service agreement has been received. Welcome to the Brandenburg Plumbing family! 
              We&apos;re committed to providing you with exceptional plumbing services and priority support.
            </p>

            <div className="bg-gray-50 rounded-xl p-8 mb-8 text-left">
              <h2 className="text-xl font-serif font-bold text-text-primary mb-4">What&apos;s Next?</h2>
              <ul className="space-y-3 text-text-muted">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-brand-blue mt-0.5 flex-shrink-0" />
                  <span>You&apos;ll receive a confirmation email with your agreement details</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-brand-blue mt-0.5 flex-shrink-0" />
                  <span>Our team will reach out to schedule your first inspection</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-brand-blue mt-0.5 flex-shrink-0" />
                  <span>Your member benefits are active immediately</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild
                className="bg-brand-blue hover:bg-brand-blue/90 text-white"
              >
                <Link href="/" className="inline-flex items-center gap-2">
                  Return Home
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
              >
                <Link href="tel:512-756-9847" className="inline-flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Call Us
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
