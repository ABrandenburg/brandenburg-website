import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Maintenance+ Membership | Brandenburg Plumbing',
  description: 'Join our Maintenance+ membership for $19/month. Get 15% off all services, priority scheduling, two-year repair guarantee, and annual inspections.',
  openGraph: {
    title: 'Maintenance+ Membership | Brandenburg Plumbing',
    description: 'Join our Maintenance+ membership for $19/month. Get 15% off all services, priority scheduling, and more.',
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
