import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Eric's Plumbing & Brandenburg Plumbing Have Joined Forces",
  description: "Eric's Plumbing and Brandenburg Plumbing have merged to create the best plumbing service in the Hill Country. Same great service, expanded capabilities.",
  openGraph: {
    title: "Eric's Plumbing & Brandenburg Plumbing Have Joined Forces",
    description: "Two trusted plumbing companies have merged to serve you better.",
    type: 'website',
    images: ['/images/erics-brandenburg-team.jpg'],
  },
}

export default function EricsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
