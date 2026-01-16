"use client"

import { motion } from 'framer-motion'
import { Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { openScheduler } from '@/lib/scheduler'

export function BlogCTA() {
  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {/* Headline */}
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary mb-6">
            Schedule Service Instantly
          </h2>

          {/* CTA Button */}
          <Button
            type="button"
            onClick={openScheduler}
            size="lg"
            className="bg-brand-red hover:bg-brand-red/90 text-white shadow-lg hover:shadow-xl text-lg px-8 book-button"
          >
            <Calendar className="w-5 h-5 mr-2" />
            Book Online
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
