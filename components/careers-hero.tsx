"use client"

import Image from 'next/image'
import { motion } from 'framer-motion'

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

export function CareersHero() {
  return (
    <section className="relative bg-gradient-to-b from-gray-50 to-white py-16 lg:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-center">
          {/* Left Images */}
          <motion.div
            className="hidden lg:flex flex-col gap-4"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-lg ml-auto w-4/5">
              <Image
                src="/images/team-photo.jpg"
                alt="Brandenburg Plumbing team"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 25vw"
              />
            </div>
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-lg w-4/5">
              <Image
                src="/images/service-trucks.jpg"
                alt="Brandenburg service trucks"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 25vw"
              />
            </div>
          </motion.div>

          {/* Center Content */}
          <motion.div
            className="text-center lg:col-span-1"
            variants={fadeIn}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary mb-6">
              We Are Hiring!
            </h1>
            <p className="text-lg text-text-muted max-w-md mx-auto">
              Our employees are the most important piece of our business. Knowing that, we strive to create the best possible place to work.
            </p>
          </motion.div>

          {/* Right Images */}
          <motion.div
            className="hidden lg:flex flex-col gap-4"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-lg w-4/5">
              <Image
                src="/images/plumber-customer.jpg"
                alt="Plumber helping customer"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 25vw"
              />
            </div>
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-lg ml-auto w-4/5">
              <Image
                src="/images/water_heater.jpg"
                alt="Plumber working on water heater"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 25vw"
              />
            </div>
          </motion.div>

          {/* Mobile Images */}
          <motion.div
            className="lg:hidden grid grid-cols-2 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="relative aspect-square rounded-xl overflow-hidden shadow-lg">
              <Image
                src="/images/team-photo.jpg"
                alt="Brandenburg Plumbing team"
                fill
                className="object-cover"
                sizes="50vw"
              />
            </div>
            <div className="relative aspect-square rounded-xl overflow-hidden shadow-lg">
              <Image
                src="/images/plumber-customer.jpg"
                alt="Plumber helping customer"
                fill
                className="object-cover"
                sizes="50vw"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
