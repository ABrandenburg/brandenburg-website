import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Home, Phone, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="min-h-[60vh] flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          {/* 404 Graphic */}
          <div className="mb-8">
            <span className="text-8xl md:text-9xl font-serif font-bold text-brand-blue/10">404</span>
          </div>

          {/* Heading */}
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-text-primary mb-4">
            Page Not Found
          </h1>

          {/* Description */}
          <p className="text-lg text-text-muted mb-8 max-w-md mx-auto">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. It may have been moved or no longer exists.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="bg-brand-red hover:bg-brand-red/90 text-white">
              <Link href="/" className="inline-flex items-center gap-2">
                <Home className="w-4 h-4" />
                Back to Home
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="tel:512-756-9847" className="inline-flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Call Us
              </Link>
            </Button>
          </div>

          {/* Helpful Links */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-text-muted mb-4">Looking for something specific?</p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link href="/service-area" className="text-brand-blue hover:underline">
                Service Areas
              </Link>
              <span className="text-gray-300">|</span>
              <Link href="/blog" className="text-brand-blue hover:underline">
                Blog
              </Link>
              <span className="text-gray-300">|</span>
              <Link href="/contact" className="text-brand-blue hover:underline">
                Contact Us
              </Link>
              <span className="text-gray-300">|</span>
              <Link href="/frequently-asked-questions" className="text-brand-blue hover:underline">
                FAQ
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
