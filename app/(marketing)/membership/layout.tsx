import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Maintenance+ Membership Plans | Brandenburg Plumbing',
  description: 'Choose Plumbing or AC & Heating Maintenance+ for $19/month. Get 15% off all services, 5% off installs, priority scheduling, two-year repair guarantee, and annual maintenance.',
  openGraph: {
    title: 'Maintenance+ Membership Plans | Brandenburg Plumbing',
    description: 'Choose Plumbing or AC & Heating Maintenance+ for $19/month. Get 15% off all services, 5% off installs, priority scheduling, and more.',
    type: 'website',
    images: ['/images/kitchen.jpg'],
  },
}

export default function MembershipLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
