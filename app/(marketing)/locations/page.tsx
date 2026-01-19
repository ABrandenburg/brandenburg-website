import { Metadata } from 'next'
import Link from 'next/link'
import { locations } from '@/lib/locations-data'
import { MapPin, ArrowRight, Phone } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Service Areas | Brandenburg Plumbing',
  description: 'Brandenburg Plumbing proudly serves Burnet County and the Texas Hill Country, including Burnet, Marble Falls, Cedar Park, Georgetown, and more.',
}

export default function LocationsPage() {
  return (
    <>
      <main className="bg-white">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-gray-50 to-white pt-8 pb-16 lg:pt-12 lg:pb-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
              <Link href="/" className="hover:text-brand-blue transition-colors">Home</Link>
              <span>/</span>
              <span className="text-brand-blue font-medium">Locations</span>
            </nav>

            <div className="text-center max-w-3xl mx-auto mb-12">
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-brand-blue mb-6">
                Serving the Texas Hill Country
              </h1>
              <p className="text-lg text-gray-600">
                Since 1997, Brandenburg Plumbing has been the trusted choice for homeowners and businesses
                throughout Burnet County and the surrounding areas. Find your city below.
              </p>
            </div>

            {/* Locations Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {locations.map((location) => (
                <Link
                  key={location.slug}
                  href={`/locations/${location.slug}`}
                  className="group bg-white p-6 rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-brand-blue/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-brand-blue transition-colors">
                      <MapPin className="w-6 h-6 text-brand-blue group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-semibold text-lg text-gray-900 mb-1 group-hover:text-brand-blue transition-colors">
                        {location.name}, TX
                      </h2>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {location.locationBlurb}
                      </p>
                      <span className="inline-flex items-center gap-1 text-brand-blue font-medium text-sm">
                        View services
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Call CTA */}
            <div className="mt-12 text-center">
              <p className="text-gray-600 mb-4">
                Don&apos;t see your city? We may still serve your area.
              </p>
              <a
                href="tel:512-756-9847"
                className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                <Phone className="w-5 h-5" />
                Call (512) 756-9847
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
