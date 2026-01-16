"use client"

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Shield, Award, Users, Clock } from 'lucide-react'

const stats = [
  { icon: Shield, value: "27+", label: "Years in Business" },
  { icon: Award, value: "10,000+", label: "Jobs Completed" },
  { icon: Users, value: "15+", label: "Team Members" },
  { icon: Clock, value: "24/7", label: "Emergency Service" },
]

const reasons = [
  {
    title: "Family-Owned Since 1997",
    description: "Founded right here in Burnet County, we've been serving our neighbors for over 27 years.",
  },
  {
    title: "Upfront Pricing",
    description: "No surprises. We provide detailed estimates before any work begins so you know exactly what to expect.",
  },
  {
    title: "Licensed & Insured",
    description: "Our team is fully licensed, bonded, and insured for your protection and peace of mind.",
  },
  {
    title: "Satisfaction Guaranteed",
    description: "We stand behind our work with a 100% satisfaction guarantee on every job we complete.",
  },
]

export function HomeTrustSection() {
  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="text-brand-blue text-sm lg:text-base font-semibold uppercase tracking-wider mb-4">
            Why Choose Us
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary mb-4">
            The Highland Lakes & North Austin&apos;s Most Trusted Plumbers
          </h2>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            When you choose Brandenburg Plumbing, you&apos;re choosing a team that treats your home like our own.
          </p>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="text-center p-6 bg-gray-50 rounded-xl"
            >
              <stat.icon className="w-8 h-8 text-brand-blue mx-auto mb-3" />
              <p className="text-3xl font-bold text-brand-blue mb-1">{stat.value}</p>
              <p className="text-sm text-text-muted">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-soft-lg">
              <Image
                src="/images/team-photo.jpg"
                alt="Brandenburg Plumbing team"
                fill
                className="object-cover"
              />
            </div>
          </motion.div>

          {/* Reasons */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-6"
          >
            {reasons.map((reason, index) => (
              <div key={reason.title} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-brand-blue/10 rounded-full flex items-center justify-center">
                  <span className="text-brand-blue font-bold text-sm">{index + 1}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-text-primary mb-1">
                    {reason.title}
                  </h3>
                  <p className="text-text-muted">
                    {reason.description}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
