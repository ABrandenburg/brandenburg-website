"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronUp } from 'lucide-react'
import type { FAQ } from '@/lib/faqs-data'

interface FAQItemProps {
  faq: FAQ
  isOpen: boolean
  onToggle: () => void
}

function FAQItem({ faq, isOpen, onToggle }: FAQItemProps) {
  return (
    <div className="border-b border-gray-200">
      <button
        onClick={onToggle}
        className="w-full py-6 flex items-start justify-between gap-4 text-left group"
        aria-expanded={isOpen}
      >
        <span className="text-lg font-semibold text-text-primary group-hover:text-brand-blue transition-colors">
          {faq.question}
        </span>
        <ChevronUp
          className={`w-5 h-5 text-text-muted flex-shrink-0 transition-transform duration-200 mt-1 ${
            isOpen ? '' : 'rotate-180'
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
            <p className="pb-6 text-text-muted leading-relaxed whitespace-pre-line">
              {faq.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface FAQAccordionSimpleProps {
  faqs: FAQ[]
  defaultOpenIndex?: number
}

export function FAQAccordionSimple({ faqs, defaultOpenIndex = 0 }: FAQAccordionSimpleProps) {
  const [openIndex, setOpenIndex] = useState<number>(defaultOpenIndex)

  return (
    <div className="divide-y divide-gray-200 border-t border-gray-200">
      {faqs.map((faq, index) => (
        <FAQItem
          key={faq.id}
          faq={faq}
          isOpen={openIndex === index}
          onToggle={() => setOpenIndex(openIndex === index ? -1 : index)}
        />
      ))}
    </div>
  )
}
