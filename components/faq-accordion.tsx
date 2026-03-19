"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import type { FAQ } from '@/lib/faqs-data'

interface FAQAccordionProps {
  faqs: FAQ[]
  header: string
}

function FAQItem({ faq, isOpen, onToggle }: { faq: FAQ; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-gray-200 last:border-0">
      <button
        onClick={onToggle}
        className="w-full py-5 flex items-start justify-between gap-4 text-left group"
      >
        <span className="font-semibold text-gray-900 group-hover:text-brand-blue transition-colors">
          {faq.question}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-brand-blue' : ''
          }`}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-gray-600 leading-relaxed">
              {faq.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function FAQAccordion({ faqs, header }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number>(0)

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-blue mb-4">
            {header}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find answers to common plumbing and HVAC questions from our expert team.
          </p>
        </div>

        {/* FAQ List */}
        <div className="bg-gray-50 rounded-2xl p-6 sm:p-8">
          {faqs.map((faq, index) => (
            <FAQItem
              key={faq.id}
              faq={faq}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? -1 : index)}
            />
          ))}
        </div>

        {/* Contact CTA */}
        <div className="text-center mt-8">
          <p className="text-gray-600">
            Have a question that&apos;s not listed here?{' '}
            <a href="tel:512-756-9847" className="text-brand-blue font-semibold hover:underline">
              Give us a call
            </a>{' '}
            and we&apos;ll be happy to help.
          </p>
        </div>
      </div>
    </section>
  )
}
