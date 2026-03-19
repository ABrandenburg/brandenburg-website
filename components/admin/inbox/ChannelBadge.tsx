import { cn } from '@/lib/utils'

interface ChannelBadgeProps {
    channel: string
    size?: 'sm' | 'md'
}

const CHANNEL_CONFIG: Record<string, { label: string; className: string }> = {
    sms: { label: 'SMS', className: 'bg-green-100 text-green-700' },
    rcs: { label: 'RCS', className: 'bg-teal-100 text-teal-700' },
    email: { label: 'Email', className: 'bg-purple-100 text-purple-700' },
    angi: { label: 'Angi', className: 'bg-orange-100 text-orange-700' },
    angi_lead: { label: 'Angi', className: 'bg-orange-100 text-orange-700' },
    thumbtack: { label: 'Thumbtack', className: 'bg-blue-100 text-blue-700' },
    thumbtack_lead: { label: 'Thumbtack', className: 'bg-blue-100 text-blue-700' },
    lsa: { label: 'Google LSA', className: 'bg-red-100 text-red-700' },
    lsa_lead: { label: 'Google LSA', className: 'bg-red-100 text-red-700' },
    website: { label: 'Website', className: 'bg-indigo-100 text-indigo-700' },
    website_form: { label: 'Website', className: 'bg-indigo-100 text-indigo-700' },
    inbound_sms: { label: 'Inbound', className: 'bg-slate-100 text-slate-700' },
    drip: { label: 'Drip', className: 'bg-amber-100 text-amber-700' },
}

export function ChannelBadge({ channel, size = 'sm' }: ChannelBadgeProps) {
    const config = CHANNEL_CONFIG[channel] || { label: channel, className: 'bg-slate-100 text-slate-600' }

    return (
        <span className={cn(
            'inline-flex items-center rounded-full font-medium',
            size === 'sm' ? 'px-1.5 py-0 text-[10px]' : 'px-2 py-0.5 text-xs',
            config.className
        )}>
            {config.label}
        </span>
    )
}
