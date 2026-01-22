"use client"

import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { openScheduler } from '@/lib/scheduler'

const valueProps = [
  '24/7 Same Day Service',
  'Fully Licensed & Insured',
  'Lifetime Labor Guarantee',
]

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

const fadeInRight = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
}

const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
}

export function Hero() {
  return (
    <section className="relative bg-gradient-to-b from-gray-50/50 to-white py-12 lg:py-20 overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgb(0,0,0,0.015)_1px,transparent_0)] [background-size:32px_32px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="order-2 lg:order-1">
            {/* Subheadline */}
            <motion.p
              className="text-text-muted text-sm lg:text-base font-medium uppercase tracking-widest mb-4"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Three Generations of Brandenburg Family Expertise
            </motion.p>

            {/* Main Headline */}
            <motion.h1
              className="font-serif text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-bold text-text-primary leading-[1.1] mb-8 text-balance"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Highland Lakes Plumbing Problems? We've Been Solving Them for 27 Years.
            </motion.h1>

            {/* Value Props */}
            <motion.div
              className="flex flex-col gap-3 mb-8"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {valueProps.map((prop, index) => (
                <motion.div
                  key={prop}
                  className="flex items-center gap-3 text-text-primary"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                >
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-brand-blue" strokeWidth={3} />
                  </div>
                  <span className="text-base font-medium">{prop}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 mb-8"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Button
                type="button"
                size="lg"
                onClick={openScheduler}
                className="w-full sm:w-auto px-8 py-6 text-base shadow-button hover:shadow-button-hover hover:-translate-y-0.5 hover:scale-[1.02] active:translate-y-0 active:scale-100 transition-all duration-300"
              >
                Book Online
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full sm:w-auto px-8 py-6 text-base border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:scale-[1.02] transition-all duration-300"
              >
                <Link href="tel:512-756-9847">
                  (512) 756-9847
                </Link>
              </Button>
            </motion.div>

            {/* Google Rating - Enhanced Card */}
            <motion.div
              className="relative overflow-hidden inline-flex flex-col items-center bg-white rounded-2xl px-8 py-6 shadow-soft-md border border-gray-100"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              {/* Shimmer Effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent skew-x-12 z-10 pointer-events-none"
                initial={{ x: '-100%' }}
                animate={{ x: '200%' }}
                transition={{ duration: 1.5, delay: 1.5, ease: "easeInOut" }}
              />
              {/* Google Logo */}
              <svg className="w-7 h-7 mb-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>

              {/* Rating */}
              <div className="flex items-center gap-2.5 mb-1">
                <span className="text-2xl font-bold text-text-primary">4.9</span>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <motion.svg
                      key={i}
                      className="w-5 h-5 text-amber-400 fill-current"
                      viewBox="0 0 20 20"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.8 + i * 0.05 }}
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </motion.svg>
                  ))}
                </div>
              </div>

              {/* Reviews Count */}
              <p className="text-sm text-text-muted font-medium">639 reviews</p>
            </motion.div>
          </div>

          {/* Right Column - Images */}
          <div className="order-1 lg:order-2">
            <div className="grid grid-cols-2 gap-4">
              {/* Left Column - Two smaller stacked images */}
              <div className="flex flex-col gap-4">
                <motion.div
                  className="relative aspect-square rounded-xl overflow-hidden shadow-soft"
                  variants={scaleIn}
                  initial="initial"
                  animate="animate"
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <Image
                    src="/images/home-hero-team.jpg"
                    alt="Brandenburg Plumbing team"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 50vw, 25vw"
                  />
                </motion.div>

                <motion.div
                  className="relative aspect-square rounded-xl overflow-hidden shadow-soft"
                  variants={scaleIn}
                  initial="initial"
                  animate="animate"
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <Image
                    src="/images/home-hero-truck.jpg"
                    alt="Brandenburg service trucks"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 50vw, 25vw"
                  />
                </motion.div>
              </div>

              {/* Right Column - Main vertical image */}
              <motion.div
                className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-soft-lg"
                variants={scaleIn}
                initial="initial"
                animate="animate"
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Image
                  src="/images/home-hero-main.avif"
                  alt="Brandenburg plumber consulting with customer"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  priority
                />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-gray-50 pointer-events-none" />
    </section>
  )
}
