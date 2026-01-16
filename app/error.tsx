'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { RefreshCw, Home, Phone } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <>
      <Header />
      <main className="min-h-[60vh] flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          {/* Error Icon */}
          <div className="mb-8">
            <div className="w-20 h-20 bg-brand-red/10 rounded-full flex items-center justify-center mx-auto">
              <span className="text-4xl">⚠️</span>
            </div>
          </div>

          {/* Heading */}
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-text-primary mb-4">
            Something Went Wrong
          </h1>

          {/* Description */}
          <p className="text-lg text-text-muted mb-8 max-w-md mx-auto">
            We apologize for the inconvenience. Please try again or contact us if the problem persists.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={reset}
              className="bg-brand-red hover:bg-brand-red/90 text-white inline-flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
            <Button asChild variant="outline">
              <Link href="/" className="inline-flex items-center gap-2">
                <Home className="w-4 h-4" />
                Back to Home
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="tel:512-756-7654" className="inline-flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Call Us
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
