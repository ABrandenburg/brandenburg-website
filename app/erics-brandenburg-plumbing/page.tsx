"use client"

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronUp } from 'lucide-react'
import { openScheduler } from '@/lib/scheduler'

// FAQ data specific to the merger
const mergerFaqs = [
  {
    id: 'warranty',
    question: 'Will my existing warranty or service agreement still be honored?',
    answer: 'Absolutely. All existing warranties and service agreements with both Eric\'s Plumbing and Brandenburg Plumbing will be fully honored by our new combined company.',
  },
  {
    id: 'service-call',
    question: 'Who should I call for service?',
    answer: 'For a seamless transition, you can continue to call the same phone number you have always used for both Eric\'s Plumbing and Brandenburg Plumbing. Our phone systems will be integrated to ensure your call is routed to our combined customer service team.',
  },
  {
    id: 'pricing',
    question: 'Will your pricing change?',
    answer: 'We remain committed to providing fair and transparent pricing. Our goal is to continue offering the same great value you have come to expect from both companies. Any future pricing adjustments will be communicated clearly and will reflect our dedication to providing top-quality service.',
  },
  {
    id: 'technicians',
    question: 'Will the same technicians still be coming to my home?',
    answer: 'Yes! You will continue to see the same qualified and friendly technicians from both Eric\'s and Brandenburg\'s teams. Our combined team is excited to continue serving you.',
  },
  {
    id: 'billing',
    question: 'How will I be billed and pay?',
    answer: 'You will be billed and pay electronically using the same software as you did prior.',
  },
  {
    id: 'company-name',
    question: 'What will the new company be called?',
    answer: 'For clarity, the Eric\'s Plumbing brand will be rolled into the Brandenburg Plumbing brand, resulting in one combined company called Brandenburg Plumbing.',
  },
]

interface FAQItemProps {
  faq: typeof mergerFaqs[0]
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
        <span className="text-base font-semibold text-text-primary group-hover:text-brand-blue transition-colors">
          {faq.question}
        </span>
        <ChevronUp
          className={`w-5 h-5 text-text-muted flex-shrink-0 transition-transform duration-200 mt-0.5 ${isOpen ? '' : 'rotate-180'
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
            <p className="pb-6 text-text-muted leading-relaxed">
              {faq.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function EricsBrandenburgPlumbingPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number>(0)

  return (
    <>
      <main>
        {/* Hero Section */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Title */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-[56px] font-bold text-text-primary text-center mb-16 lg:mb-20 leading-tight max-w-4xl mx-auto">
              Eric&apos;s Plumbing and Brandenburg Plumbing Have Joined Forces
            </h1>

            {/* Two Column Layout */}
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
              {/* Left Column - Content */}
              <div>
                <p className="text-text-primary leading-relaxed mb-6">
                  We are thrilled to announce that Eric&apos;s Plumbing and Brandenburg Plumbing are teaming up to create the best plumbing service company in the Hill Country.
                </p>

                <p className="text-text-primary leading-relaxed mb-8">
                  This decision was driven by a shared vision: to provide our customers with an unparalleled plumbing service. By combining our resources and expertise, we can now offer you:
                </p>

                {/* Bullet Points */}
                <ul className="space-y-6">
                  <li>
                    <p className="text-text-primary">
                      <strong className="font-semibold">8am - 9pm, 7 Days per Week Service:</strong>{' '}
                      More technicians on the road means faster response times for your plumbing emergencies and more flexible scheduling for your planned projects.
                    </p>
                  </li>
                  <li>
                    <p className="text-text-primary">
                      <strong className="font-semibold">A Deeper Bench of Expertise:</strong>{' '}
                      With a larger team of highly skilled and licensed plumbers, we have a greater depth of knowledge to tackle even the most complex plumbing challenges. From routine repairs and maintenance to large-scale installations and emergency services, our combined experience is your advantage.
                    </p>
                  </li>
                  <li>
                    <p className="text-text-primary">
                      <strong className="font-semibold">The Same Friendly Faces You Trust:</strong>{' '}
                      While our name may be evolving, our commitment to personal, friendly service remains the same. You will still see the familiar, trusted technicians you&apos;ve come to know and rely on from both Eric&apos;s and Brandenburg.
                    </p>
                  </li>
                </ul>
              </div>

              {/* Right Column - Image */}
              <div className="lg:pl-4">
                <div className="rounded-lg overflow-hidden">
                  <Image
                    src="/images/erics-brandenburg-team.jpg"
                    alt="Eric's Plumbing and Brandenburg Plumbing team members"
                    width={600}
                    height={450}
                    className="w-full h-auto object-cover"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-24">
              {/* Left Column - Header */}
              <div>
                <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">
                  We&apos;re here to answer your questions.
                </p>
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary">
                  Frequently Asked Questions
                </h2>
              </div>

              {/* Right Column - FAQ Accordion */}
              <div className="border-t border-gray-200">
                {mergerFaqs.map((faq, index) => (
                  <FAQItem
                    key={faq.id}
                    faq={faq}
                    isOpen={openFaqIndex === index}
                    onToggle={() => setOpenFaqIndex(openFaqIndex === index ? -1 : index)}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary mb-8">
              Schedule Service Instantly
            </h2>
            <Button
              type="button"
              onClick={openScheduler}
              className="bg-brand-red hover:bg-brand-red/90 text-white px-8 py-3 h-auto text-base font-medium rounded-md book-button"
            >
              Book Online
            </Button>
          </div>
        </section>
      </main>
    </>
  )
}
