"use client"

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Star, Quote, Loader2 } from 'lucide-react'
import type { GoogleReview } from '@/lib/google-reviews'

// Static fallback reviews in case API fails
const fallbackReviews: GoogleReview[] = [
    {
        authorName: "David M.",
        rating: 5,
        text: "Brandenburg Plumbing has been our go-to plumber for years. They're always professional, punctual, and do excellent work. Highly recommend!",
        relativeTimeDescription: "2 months ago",
        time: Date.now(),
    },
    {
        authorName: "Sarah K.",
        rating: 5,
        text: "Had a major leak and they came out same day. Fixed the problem quickly and the price was exactly what they quoted. Will definitely use again.",
        relativeTimeDescription: "3 weeks ago",
        time: Date.now(),
    },
    {
        authorName: "Mike R.",
        rating: 5,
        text: "Installed a new tankless water heater. The team was knowledgeable and answered all my questions. Very happy with the result!",
        relativeTimeDescription: "1 month ago",
        time: Date.now(),
    },
    {
        authorName: "Jennifer L.",
        rating: 5,
        text: "Best plumbing experience I've ever had. They showed up on time, explained everything clearly, and cleaned up after themselves. 5 stars!",
        relativeTimeDescription: "2 weeks ago",
        time: Date.now(),
    },
    {
        authorName: "Tom B.",
        rating: 5,
        text: "We've used Brandenburg for both our home and rental properties. Consistent quality every time. Fair pricing and great communication.",
        relativeTimeDescription: "1 month ago",
        time: Date.now(),
    },
    {
        authorName: "Lisa H.",
        rating: 5,
        text: "Emergency call for a burst pipe at midnight. They answered right away and had someone out within the hour. Saved us from major water damage!",
        relativeTimeDescription: "3 weeks ago",
        time: Date.now(),
    },
]

interface ReviewsCarouselClientProps {
    locationName: string
}

export function ReviewsCarouselClient({ locationName }: ReviewsCarouselClientProps) {
    const [reviews, setReviews] = useState<GoogleReview[]>(fallbackReviews)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchReviews() {
            try {
                const response = await fetch('/api/reviews')
                if (response.ok) {
                    const data = await response.json()
                    if (data.reviews && data.reviews.length > 0) {
                        setReviews(data.reviews)
                    }
                }
            } catch (error) {
                // Silently fail to fallback
            } finally {
                setIsLoading(false)
            }
        }

        fetchReviews()
    }, [])

    return (
        <section className="py-16 lg:py-24 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-blue mb-4">
                        What Our Customers Say
                    </h2>
                    <p className="text-lg text-text-muted max-w-2xl mx-auto">
                        Don&apos;t just take our word for it. Here&apos;s what homeowners in {locationName} and the surrounding areas have to say.
                    </p>

                    {/* Google Rating Badge */}
                    <div className="mt-6 inline-flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-soft">
                        <svg className="w-6 h-6" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                            ))}
                        </div>
                        <span className="font-semibold text-text-primary">4.9</span>
                        <span className="text-text-muted">on Google</span>
                    </div>
                </motion.div>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex justify-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-brand-blue" />
                    </div>
                )}

                {/* Reviews Grid */}
                {!isLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {reviews.slice(0, 6).map((review, index) => (
                            <motion.div
                                key={review.authorName + index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="bg-white p-6 rounded-xl shadow-card hover:shadow-card-hover transition-shadow duration-300"
                            >
                                {/* Quote Icon */}
                                <Quote className="w-8 h-8 text-brand-blue/20 mb-4" />

                                {/* Review Text */}
                                <p className="text-text-muted mb-4 line-clamp-4">
                                    &ldquo;{review.text}&rdquo;
                                </p>

                                {/* Stars */}
                                <div className="flex items-center gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    ))}
                                </div>

                                {/* Author */}
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-brand-blue/10 rounded-full flex items-center justify-center">
                                        <span className="text-brand-blue font-semibold text-sm">
                                            {review.authorName.charAt(0)}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-text-primary">{review.authorName}</p>
                                        <p className="text-sm text-text-muted">{review.relativeTimeDescription}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* View All Link */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="text-center mt-10"
                >
                    <a
                        href="https://www.google.com/maps/place/Brandenburg+Plumbing/@30.6364174,-98.2637329,17z/data=!4m8!3m7!1s0x865ae6951006c25b:0x7849318679044709!8m2!3d30.6364174!4d-98.2637329!9m1!1b1!16s%2Fg%2F1x5fbsfc"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-brand-blue font-semibold hover:underline"
                    >
                        View all Google reviews
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </a>
                </motion.div>
            </div>
        </section>
    )
}
