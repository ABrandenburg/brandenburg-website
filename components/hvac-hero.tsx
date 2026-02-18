"use client"

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Phone, Calendar, Shield, Clock, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { openScheduler } from '@/lib/scheduler'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const valueProps = [
  { icon: Shield, text: "Licensed & Insured" },
  { icon: Clock, text: "Same-Day Service" },
  { icon: CheckCircle, text: "Upfront Pricing" },
]

export function HvacHero() {
  return (
    <section className="relative bg-gradient-to-br from-gray-50 to-white pt-8 pb-16 lg:pt-12 lg:pb-24 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23324759' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            initial="initial"
            animate="animate"
            variants={stagger}
            className="order-2 lg:order-1"
          >
            {/* Breadcrumb */}
            <motion.div variants={fadeInUp} className="mb-4">
              <nav className="flex items-center gap-2 text-sm text-gray-500">
                <Link href="/" className="hover:text-brand-blue transition-colors">Home</Link>
                <span>/</span>
                <span className="text-brand-blue font-medium">HVAC Services</span>
              </nav>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              variants={fadeInUp}
              className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-brand-blue leading-tight mb-6"
            >
              Your Trusted Local HVAC Company in the Highland Lakes & North Austin
            </motion.h1>

            {/* Description */}
            <motion.p
              variants={fadeInUp}
              className="text-lg text-gray-600 mb-8 leading-relaxed"
            >
              From emergency AC repair to complete system installations, Brandenburg Plumbing delivers reliable heating and air conditioning services backed by 27+ years of experience. Licensed, insured, and committed to your comfort.
            </motion.p>

            {/* Value Props */}
            <motion.div variants={fadeInUp} className="flex flex-wrap gap-4 mb-8">
              {valueProps.map((prop) => (
                <div
                  key={prop.text}
                  className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-soft border border-gray-100"
                >
                  <prop.icon className="w-5 h-5 text-brand-blue" />
                  <span className="text-sm font-medium text-gray-700">{prop.text}</span>
                </div>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                size="lg"
                className="bg-brand-red hover:bg-brand-red/90 text-white shadow-button hover:shadow-button-hover"
              >
                <Link href="tel:512-756-9847" className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  <span>(512) 756-9847</span>
                </Link>
              </Button>
              <Button
                type="button"
                onClick={openScheduler}
                variant="outline"
                size="lg"
                className="border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white book-button flex items-center gap-2"
              >
                <Calendar className="w-5 h-5" />
                <span>Book Online</span>
              </Button>
            </motion.div>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="order-1 lg:order-2"
          >
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-soft-xl">
              <Image
                src="/images/hvac/ac-repair.jpg"
                alt="Brandenburg Plumbing HVAC technician servicing an air conditioning unit"
                fill
                className="object-cover"
                priority
              />
              {/* Overlay Badge */}
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-lg shadow-soft">
                <p className="text-sm font-medium text-brand-blue">
                  TACLA21988C Licensed
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
