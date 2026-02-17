import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Financing Options | Brandenburg Plumbing',
  description: 'Simple, no-fuss financing for plumbing and HVAC services. Get approved in minutes with flexible payment options and fair interest rates.',
  openGraph: {
    title: 'Financing Options | Brandenburg Plumbing',
    description: 'Simple, no-fuss financing for plumbing and HVAC services. Monthly payments with flexible terms.',
    type: 'website',
    images: ['/images/plumber-customer.jpg'],
  },
}

export default function FinancingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
