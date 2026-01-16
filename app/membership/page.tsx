"use client"

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Check, Shield, Clock, Percent, Wrench, Calendar, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { openScheduler } from '@/lib/scheduler'

const membershipFeatures = [
  { text: '15% discount on all services', icon: Percent },
  { text: 'Two-year guarantee on repairs', icon: Shield },
  { text: 'Two-hour arrival window', icon: Clock },
  { text: 'Priority scheduling', icon: Calendar },
  { text: 'Annual whole house plumbing inspection', icon: Home },
  { text: 'Annual water heater flush', icon: Wrench },
  { text: '$20 trip charge ($80 savings)', icon: Check },
]

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
}

export default function MembershipPage() {
  return (
    <>
      <main>
        <PageHeader
          title="Save 15% on Every Service, Forever"
          breadcrumb={[{ label: 'Membership' }]}
          description="Ask your technician about applying your membership to your next service, or call our office to book a membership today!"
          imageSrc="/images/kitchen.jpg"
          imageAlt="Professional plumber providing service"
        />

        {/* Membership Card Section */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-6xl mx-auto">
              {/* Membership Card */}
              <motion.div
                className="bg-brand-blue rounded-2xl p-8 md:p-10 text-white shadow-soft-xl"
                variants={scaleIn}
                initial="initial"
                animate="animate"
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {/* Plan Name */}
                <h2 className="text-2xl md:text-3xl font-serif font-bold mb-6">
                  Maintenance<span className="text-brand-red">+</span>
                </h2>

                {/* Price */}
                <div className="flex items-baseline gap-2 mb-8">
                  <span className="text-6xl md:text-7xl font-bold">$19</span>
                  <span className="text-xl text-white/80">/ month</span>
                </div>

                {/* CTA Button */}
                <Button
                  type="button"
                  onClick={openScheduler}
                  className="w-full bg-white text-brand-blue hover:bg-gray-100 font-semibold text-lg h-14 mb-8 book-button"
                  style={{ backgroundColor: 'white', color: '#324759' }}
                >
                  Get Started
                </Button>

                {/* Features List */}
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-white/70 mb-4">
                    Core Features:
                  </p>
                  <ul className="space-y-4">
                    {membershipFeatures.map((feature, index) => (
                      <motion.li
                        key={index}
                        className="flex items-start gap-3"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.4 + index * 0.08 }}
                      >
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center mt-0.5">
                          <Check className="w-3 h-3 text-white" strokeWidth={3} />
                        </div>
                        <span className="text-white/90">{feature.text}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>

              {/* Image */}
              <motion.div
                className="relative aspect-[4/3] lg:aspect-square rounded-2xl overflow-hidden shadow-soft-lg"
                variants={scaleIn}
                initial="initial"
                animate="animate"
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Image
                  src="/images/kitchen.jpg"
                  alt="Professional plumber providing service"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Benefits Highlight Section */}
        <section className="py-16 md:py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-12"
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-serif text-text-primary mb-4">
                Why Join Maintenance+?
              </h2>
              <p className="text-lg text-text-muted max-w-2xl mx-auto">
                Protect your home and save money with preventive maintenance from the experts you trust.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Benefit 1 */}
              <motion.div
                className="bg-white rounded-xl p-8 shadow-card text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="w-14 h-14 bg-brand-blue/10 rounded-full flex items-center justify-center mx-auto mb-5">
                  <Percent className="w-7 h-7 text-brand-blue" />
                </div>
                <h3 className="text-xl font-serif font-bold text-text-primary mb-3">Save 15% Always</h3>
                <p className="text-text-muted">
                  Every service call, every repair—members always save 15% on the total cost.
                </p>
              </motion.div>

              {/* Benefit 2 */}
              <motion.div
                className="bg-white rounded-xl p-8 shadow-card text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="w-14 h-14 bg-brand-blue/10 rounded-full flex items-center justify-center mx-auto mb-5">
                  <Shield className="w-7 h-7 text-brand-blue" />
                </div>
                <h3 className="text-xl font-serif font-bold text-text-primary mb-3">Peace of Mind</h3>
                <p className="text-text-muted">
                  Two-year guarantee on all repairs gives you confidence in every job we do.
                </p>
              </motion.div>

              {/* Benefit 3 */}
              <motion.div
                className="bg-white rounded-xl p-8 shadow-card text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="w-14 h-14 bg-brand-blue/10 rounded-full flex items-center justify-center mx-auto mb-5">
                  <Clock className="w-7 h-7 text-brand-blue" />
                </div>
                <h3 className="text-xl font-serif font-bold text-text-primary mb-3">Priority Service</h3>
                <p className="text-text-muted">
                  Skip the wait with priority scheduling and guaranteed two-hour arrival windows.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-text-primary mb-4">
                Ready to Join?
              </h2>
              <p className="text-lg text-text-muted mb-8 max-w-xl mx-auto">
                Start saving today with Maintenance+ membership. Call us or book online to get started.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  type="button"
                  onClick={openScheduler}
                  className="bg-brand-red hover:bg-brand-red/90 text-white px-8 py-3 text-lg h-auto book-button"
                >
                  Book Online
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="px-8 py-3 text-lg h-auto"
                >
                  <a href="tel:512-756-9847">(512) 756-9847</a>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  )
}
