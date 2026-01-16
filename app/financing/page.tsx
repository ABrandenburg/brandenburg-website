"use client"

import Link from 'next/link'
import { Phone } from 'lucide-react'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
}

export default function FinancingPage() {
  return (
    <>
      <main>
        <PageHeader
          title="Simple, no-fuss financing"
          breadcrumb={[{ label: 'Financing' }]}
          description="With approved credit, you'll gain access to monthly payments, fair interest rates, and flexible terms. 85% of financing decisions are made instantly, with most of the rest of the applications decided within 15 minutes."
          imageSrc="/images/plumber-customer.jpg"
          imageAlt="Friendly consultation for financing options"
          ctaText="Call to Apply"
          ctaLink="tel:512-756-9847"
        />
      </main>
    </>
  )
}
