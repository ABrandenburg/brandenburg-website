"use client"

import Link from 'next/link'
import { locations } from '@/lib/locations-data'

export function ServiceAreasList() {
    return (
        <section className="py-12 bg-white border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-serif font-bold text-brand-blue mb-2">
                        Proudly Serving the Highland Lakes & North Austin
                    </h2>
                    <p className="text-text-muted">
                        Our expert plumbing and HVAC technicians are available in these communities:
                    </p>
                </div>

                <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 max-w-4xl mx-auto">
                    {locations.map((location) => (
                        <Link
                            key={location.slug}
                            href={`/location/${location.slug}`}
                            className="text-text-primary hover:text-brand-blue font-medium transition-colors border-b border-transparent hover:border-brand-blue/30 pb-0.5"
                        >
                            {location.name}
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}
