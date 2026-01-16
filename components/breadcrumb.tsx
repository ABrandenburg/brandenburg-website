import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-text-muted mb-6 lg:mb-8">
      <Link href="/" className="hover:text-brand-blue transition-colors">
        Home
      </Link>
      {items.map((item, index) => (
        <span key={item.label} className="flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-gray-400" />
          {item.href ? (
            <Link href={item.href} className="hover:text-brand-blue transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-brand-blue font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
