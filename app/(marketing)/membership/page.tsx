"use client"

import { motion } from 'framer-motion'
import { Check, Shield, Clock, Percent, Wrench, Calendar, Home, Snowflake, Flame, MessageCircle, X, HelpCircle, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/page-header'
import { openScheduler } from '@/lib/scheduler'

const sharedFeatures = [
  { text: '15% discount on all services', icon: Percent },
  { text: '5% discount on all installs', icon: Percent },
  { text: 'Two-year warranty on repairs', icon: Shield },
  { text: 'Two-hour arrival window', icon: Clock },
  { text: 'Priority scheduling', icon: Calendar },
  { text: '$20 trip charge ($80 savings)', icon: Check },
]

const plumbingFeatures = [
  { text: 'Annual whole house plumbing inspection', icon: Home, details: '65-point inspection of your entire plumbing system with photos and status report of all fixtures, pipes, and connections' },
  { text: 'Annual water heater flush', icon: Wrench, details: 'Full flush to remove sediment buildup, extend tank life, and improve efficiency' },
]

const hvacFeatures = [
  { text: 'Annual AC system maintenance (spring)', icon: Snowflake, details: 'Refrigerant check, coil cleaning, condensate drain flush, thermostat calibration, electrical connection inspection' },
  { text: 'Annual heating system maintenance (fall)', icon: Flame, details: 'Filter inspection, thermostat calibration, electrical connection inspection, coil cleaning' },
]

const plans = [
  {
    badge: 'Plumbing',
    name: 'Plumbing Maintenance',
    specificFeatures: plumbingFeatures,
    delay: 0.2,
  },
  {
    badge: 'AC & Heating',
    name: 'AC & Heating Maintenance',
    specificFeatures: hvacFeatures,
    delay: 0.35,
  },
]

const comparisonRows = [
  { feature: 'Trip charge', member: '$20', nonMember: '$100' },
  { feature: 'Service discount', member: '15% off', nonMember: 'None' },
  { feature: 'Install discount', member: '5% off', nonMember: 'None' },
  { feature: 'Repair warranty', member: '2 years', nonMember: '1 year' },
  { feature: 'Arrival window', member: '2 hours', nonMember: '4 hours' },
  { feature: 'Annual maintenance', member: 'Included', nonMember: 'Not included' },
  { feature: 'Priority scheduling', member: 'Yes', nonMember: 'No' },
]

const faqs = [
  {
    question: 'Is there a minimum commitment?',
    answer: 'Memberships must be held for at least 6 months to be eligible for discounts. If a membership is cancelled before 6 months, any discounts received during that period will be charged back.',
  },
  {
    question: 'When does my membership start?',
    answer: 'Your membership is active immediately after sign-up. You can start using your benefits on your very next service call.',
  },
  {
    question: 'Do I need to be home for maintenance visits?',
    answer: 'Yes, someone 18 or older needs to be present for all maintenance visits so our technician can walk you through any findings.',
  },
  {
    question: 'Can I have both plans?',
    answer: 'Absolutely. Many homeowners sign up for both the Plumbing and AC & Heating plans to cover their entire home.',
  },
]

function getSeasonalMessage(): { text: string; icon: typeof Snowflake } {
  const month = new Date().getMonth() // 0-indexed
  if (month >= 2 && month <= 4) {
    // March–May
    return { text: 'Spring AC tune-ups are booking now — join today to secure your spot.', icon: Snowflake }
  } else if (month >= 5 && month <= 7) {
    // June–August
    return { text: "Don't wait for a breakdown — AC memberships keep you cool all summer.", icon: Flame }
  } else if (month >= 8 && month <= 10) {
    // September–November
    return { text: 'Fall heating tune-ups are booking now — join today to secure your spot.', icon: Flame }
  } else {
    // December–February
    return { text: 'Stay warm this winter — heating memberships keep your system running strong.', icon: Snowflake }
  }
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
}

export default function MembershipPage() {
  const seasonal = getSeasonalMessage()
  const SeasonalIcon = seasonal.icon

  return (
    <>
      <main>
        <PageHeader
          title="Save on Every Service, Forever"
          breadcrumb={[{ label: 'Membership' }]}
          description="Choose the plan that fits your home. Ask your technician about applying your membership to your next service, or call our office to get started."
          imageSrc="/images/kitchen.jpg"
          imageAlt="Professional plumber providing service"
        />

        {/* Seasonal Urgency Banner */}
        <section className="bg-brand-red text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <p className="text-center text-sm md:text-base font-medium flex items-center justify-center gap-2">
              <SeasonalIcon className="w-4 h-4 flex-shrink-0" />
              {seasonal.text}
            </p>
          </div>
        </section>

        {/* Membership Cards Section */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {plans.map((plan) => (
                <motion.div
                  key={plan.name}
                  className="bg-brand-blue rounded-2xl p-8 md:p-10 text-white shadow-soft-xl"
                  variants={scaleIn}
                  initial="initial"
                  animate="animate"
                  transition={{ duration: 0.6, delay: plan.delay }}
                >
                  {/* Badge */}
                  <span className="inline-block bg-white/20 text-white text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full mb-4">
                    {plan.badge}
                  </span>

                  {/* Plan Name */}
                  <h2 className="text-2xl md:text-3xl font-serif font-bold mb-6">
                    {plan.name}<span className="text-brand-red">+</span>
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

                  {/* Shared Features */}
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wider text-white/70 mb-4">
                      Core Benefits:
                    </p>
                    <ul className="space-y-4">
                      {sharedFeatures.map((feature, index) => (
                        <motion.li
                          key={index}
                          className="flex items-start gap-3"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: plan.delay + 0.2 + index * 0.08 }}
                        >
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center mt-0.5">
                            <Check className="w-3 h-3 text-white" strokeWidth={3} />
                          </div>
                          <span className="text-white/90">{feature.text}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-white/20 my-6" />

                  {/* Plan-Specific Features */}
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wider text-white/70 mb-4">
                      Annual Maintenance:
                    </p>
                    <ul className="space-y-4">
                      {plan.specificFeatures.map((feature, index) => (
                        <motion.li
                          key={index}
                          className="flex items-start gap-3"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: plan.delay + 0.2 + (sharedFeatures.length + index) * 0.08 }}
                        >
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center mt-0.5">
                            <Check className="w-3 h-3 text-white" strokeWidth={3} />
                          </div>
                          <div>
                            <span className="text-white/90">{feature.text}</span>
                            {'details' in feature && feature.details && (
                              <p className="text-white/50 text-sm mt-1">{feature.details}</p>
                            )}
                          </div>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Member vs Non-Member Comparison */}
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
                Members Save More
              </h2>
              <p className="text-lg text-text-muted max-w-2xl mx-auto">
                See how Maintenance+ membership compares to standard pricing.
              </p>
            </motion.div>

            <motion.div
              className="max-w-2xl mx-auto overflow-hidden rounded-xl border border-gray-200 bg-white shadow-card"
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <table className="w-full">
                <thead>
                  <tr className="bg-brand-blue text-white">
                    <th className="text-left py-4 px-6 font-semibold text-sm"></th>
                    <th className="text-center py-4 px-4 font-semibold text-sm">Member</th>
                    <th className="text-center py-4 px-4 font-semibold text-sm">Non-Member</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, index) => (
                    <tr key={row.feature} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="py-3.5 px-6 text-text-primary font-medium text-sm">{row.feature}</td>
                      <td className="py-3.5 px-4 text-center text-sm font-semibold text-brand-blue">{row.member}</td>
                      <td className="py-3.5 px-4 text-center text-sm text-text-muted">{row.nonMember}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          </div>
        </section>

        {/* Benefits Highlight Section */}
        <section className="py-16 md:py-24 bg-white">
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
                Protect your plumbing and HVAC systems with preventive maintenance from the experts you trust.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Benefit 1 */}
              <motion.div
                className="bg-gray-50 rounded-xl p-8 shadow-card text-center"
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
                className="bg-gray-50 rounded-xl p-8 shadow-card text-center"
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
                  Two-year warranty on all repairs gives you confidence in every job we do.
                </p>
              </motion.div>

              {/* Benefit 3 */}
              <motion.div
                className="bg-gray-50 rounded-xl p-8 shadow-card text-center"
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

        {/* Social Proof */}
        <section className="py-16 md:py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="max-w-3xl mx-auto text-center"
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center justify-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <blockquote className="text-xl md:text-2xl font-serif text-text-primary mb-6 leading-relaxed">
                &ldquo;The membership pays for itself. Between the discounted trip charge and 15% off every repair, we&rsquo;ve saved hundreds this year alone. Plus the annual inspections caught a small leak before it became a big problem.&rdquo;
              </blockquote>
              <p className="text-text-muted font-medium">— Brandenburg Maintenance+ Member, Georgetown TX</p>
            </motion.div>
          </div>
        </section>

        {/* Add-Ons Section */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="max-w-3xl mx-auto bg-brand-blue/5 border border-brand-blue/15 rounded-2xl p-8 md:p-10"
              variants={fadeInUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-brand-blue/10 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-brand-blue" />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-serif font-bold text-text-primary mb-3">
                    Ask Your Technician About Add-Ons
                  </h3>
                  <p className="text-text-muted mb-4">
                    Get more out of your membership with optional add-ons. Your technician can help you choose the right extras for your home during any service visit.
                  </p>
                  <ul className="space-y-2 text-text-muted">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-brand-blue flex-shrink-0" strokeWidth={3} />
                      Filter changes for HVAC systems
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-brand-blue flex-shrink-0" strokeWidth={3} />
                      Coverage for additional systems or units
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* FAQ Section */}
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
                Frequently Asked Questions
              </h2>
            </motion.div>

            <div className="max-w-3xl mx-auto space-y-6">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  className="bg-white rounded-xl p-6 md:p-8 shadow-card"
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <h3 className="text-lg font-semibold text-text-primary mb-2 flex items-start gap-3">
                    <HelpCircle className="w-5 h-5 text-brand-blue flex-shrink-0 mt-0.5" />
                    {faq.question}
                  </h3>
                  <p className="text-text-muted ml-8">{faq.answer}</p>
                </motion.div>
              ))}
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
