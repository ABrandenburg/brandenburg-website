'use client'

import { cn } from '@/lib/utils'
import type { CapacityStatus } from '@/lib/discount-calculator'

interface CapacityStatusBadgeProps {
  status: CapacityStatus
  availabilityPercent: number
  className?: string
}

const statusConfig = {
  hungry: {
    label: 'Hungry',
    bgColor: 'bg-emerald-100',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-200',
    dotColor: 'bg-emerald-500',
  },
  normal: {
    label: 'Normal',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200',
    dotColor: 'bg-amber-500',
  },
  busy: {
    label: 'Busy',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
    dotColor: 'bg-red-500',
  },
}

export function CapacityStatusBadge({ 
  status, 
  availabilityPercent,
  className 
}: CapacityStatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-4 py-2 rounded-full border',
        config.bgColor,
        config.textColor,
        config.borderColor,
        className
      )}
    >
      <span className={cn('w-2 h-2 rounded-full animate-pulse', config.dotColor)} />
      <span className="font-semibold">{config.label}</span>
      <span className="text-sm opacity-80">
        {availabilityPercent.toFixed(1)}% available
      </span>
    </div>
  )
}
