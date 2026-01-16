"use client"

import { motion } from 'framer-motion'
import {
  Heart,
  DollarSign,
  Percent,
  Gift,
  Calendar,
  Footprints,
  UtensilsCrossed,
  GraduationCap,
  TrendingUp,
  Scale
} from 'lucide-react'

const benefits = [
  {
    icon: Heart,
    title: 'Health, Vision, Dental, Life Insurance',
    description: 'We want our employees healthy, happy, and free from worry. We provide a generous insurance benefit package tailored to our employees\' specific needs.',
  },
  {
    icon: DollarSign,
    title: 'Competitive Compensation',
    description: 'We know that great people make great companies, and that pay matters. We constantly assess market rates so our employees can be the best paid in their region.',
  },
  {
    icon: Percent,
    title: 'Commission Pay',
    description: 'We strike a careful balance between base salary and commission pay to best compensate our top technicians while not incentivizing unethical sales practices.',
  },
  {
    icon: Gift,
    title: 'Regular Bonuses',
    description: 'We are committed to sharing the fruits of our success with the people who make it possible. As Brandenburg Plumbing grows, we will always be assessing increased bonus structures.',
  },
  {
    icon: Calendar,
    title: 'Paid Time Off',
    description: 'We offer paid vacation, holidays, birthdays, and unlimited sick time for all employees. Your well-being comes first.',
  },
  {
    icon: Footprints,
    title: 'Work Boot Allowance',
    description: 'We want our technicians properly equipped to handle whatever comes their way. If you need proper work boots, we will happily pay the cost up to $150.',
  },
  {
    icon: UtensilsCrossed,
    title: 'On-site Meals and Snacks',
    description: 'Enjoy healthy and filling food on-site in our fully stocked kitchen. Fuel up before heading out on the job.',
  },
  {
    icon: GraduationCap,
    title: 'Ongoing Training',
    description: 'The best plumbing company needs the best plumbers, so we train weekly on the newest technologies and practices to keep our skills sharp.',
  },
  {
    icon: TrendingUp,
    title: 'Career Growth Opportunities',
    description: 'From apprentice to tradesman to journeyman to manager, we ensure there is always room to advance your career with us.',
  },
  {
    icon: Scale,
    title: 'Balanced Work Culture',
    description: 'We strongly believe the best plumbing company invests in the balance between work and rest, competition and teamwork. We value excellence while respecting the needs of each employee.',
  },
]

export function CareersBenefits() {
  return (
    <section id="benefits" className="py-16 lg:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-12 lg:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary mb-4">
            Benefits
          </h2>
          <p className="text-lg text-text-muted">
            We are creating the best place to work through thoughtful benefits designed to increase our financial, physical, and emotional wellbeing for our employees and their loved ones.
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              className="bg-white rounded-xl p-6 lg:p-8 shadow-card hover:shadow-card-hover transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              {/* Icon */}
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <benefit.icon className="w-6 h-6 text-text-primary" />
              </div>

              {/* Content */}
              <h3 className="font-semibold text-lg text-text-primary mb-2">
                {benefit.title}
              </h3>
              <p className="text-text-muted text-sm leading-relaxed">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
