import { Guarantee } from '@/lib/guarantees-data'

// Icon components for each guarantee type
function SatisfactionIcon() {
  return (
    <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="6" y="6" width="36" height="30" rx="2" />
      <path d="M6 14h36" />
      <path d="M14 22h12" />
      <path d="M14 28h20" />
      <path d="M30 36v6l6-3-6-3z" fill="currentColor" />
    </svg>
  )
}

function LifetimeIcon() {
  return (
    <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M24 4l-8 8h6v12h4V12h6l-8-8z" fill="currentColor" stroke="none" />
      <rect x="10" y="24" width="28" height="20" rx="2" />
      <path d="M18 32h12" />
      <path d="M18 38h8" />
    </svg>
  )
}

function ShowUpIcon() {
  return (
    <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
      {/* Truck body */}
      <rect x="4" y="20" width="24" height="16" rx="1" />
      {/* Truck cab */}
      <path d="M28 24h10l6 8v4H28V24z" />
      {/* Wheels */}
      <circle cx="12" cy="38" r="4" fill="currentColor" />
      <circle cx="38" cy="38" r="4" fill="currentColor" />
      {/* Window */}
      <rect x="32" y="26" width="8" height="6" rx="1" fill="none" />
    </svg>
  )
}

function PriceMatchIcon() {
  return (
    <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 8v32l8-6 8 6 8-6 8 6V8H8z" />
      <path d="M16 18h16" />
      <path d="M16 26h12" />
      <path d="M16 34h8" />
    </svg>
  )
}

const iconMap = {
  satisfaction: SatisfactionIcon,
  lifetime: LifetimeIcon,
  showup: ShowUpIcon,
  pricematch: PriceMatchIcon,
}

interface GuaranteeCardProps {
  guarantee: Guarantee
}

export function GuaranteeCard({ guarantee }: GuaranteeCardProps) {
  const IconComponent = iconMap[guarantee.icon]

  return (
    <article className="bg-white p-6 md:p-8 h-full">
      {/* Icon */}
      <div className="text-text-primary mb-6">
        <IconComponent />
      </div>

      {/* Title */}
      <h3 className="text-xl md:text-2xl font-serif text-text-primary mb-4">
        {guarantee.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-text-muted leading-relaxed mb-4">
        {guarantee.description}
      </p>

      {/* Additional Note */}
      {guarantee.additionalNote && (
        <p className="text-sm text-text-muted leading-relaxed whitespace-pre-line">
          {guarantee.additionalNote}
        </p>
      )}
    </article>
  )
}
