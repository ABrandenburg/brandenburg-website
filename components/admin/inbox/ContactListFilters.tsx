'use client'

import { cn } from '@/lib/utils'

export interface FilterState {
    status: string | null
    source: string | null
}

interface ContactListFiltersProps {
    filters: FilterState
    onChange: (filters: FilterState) => void
}

const STATUS_OPTIONS = [
    { value: null, label: 'All' },
    { value: 'new', label: 'New' },
    { value: 'ai_active', label: 'AI Active' },
    { value: 'qualifying', label: 'Qualified' },
    { value: 'booked', label: 'Booked' },
    { value: 'closed_lost', label: 'Lost' },
]

const SOURCE_OPTIONS = [
    { value: null, label: 'All Sources' },
    { value: 'angi', label: 'Angi' },
    { value: 'thumbtack', label: 'Thumbtack' },
    { value: 'lsa', label: 'Google LSA' },
    { value: 'website', label: 'Website' },
    { value: 'inbound_sms', label: 'SMS' },
]

export function ContactListFilters({ filters, onChange }: ContactListFiltersProps) {
    return (
        <div className="px-3 py-2 border-b border-slate-200 space-y-2">
            {/* Status pills */}
            <div className="flex gap-1 flex-wrap">
                {STATUS_OPTIONS.map(opt => (
                    <button
                        key={opt.value || 'all'}
                        onClick={() => onChange({ ...filters, status: opt.value })}
                        className={cn(
                            'px-2 py-0.5 text-[11px] rounded-full transition-colors',
                            filters.status === opt.value
                                ? 'bg-slate-900 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        )}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>

            {/* Source dropdown */}
            <select
                value={filters.source || ''}
                onChange={(e) => onChange({ ...filters, source: e.target.value || null })}
                className="w-full h-7 text-[11px] rounded border border-slate-200 bg-white px-2 text-slate-600"
            >
                {SOURCE_OPTIONS.map(opt => (
                    <option key={opt.value || 'all'} value={opt.value || ''}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>
    )
}
