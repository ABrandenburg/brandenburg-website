'use client'

import { useState } from 'react'
import { createClient as createBrowserClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { ChannelBadge } from './ChannelBadge'
import { formatPhoneDisplay } from '@/lib/webhooks/phone'
import { X, Phone, Mail, MapPin, Bot, BotOff, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Contact } from './InboxLayout'

interface CustomerDetailsPanelProps {
    contact: Contact
    onClose: () => void
}

const STATUS_OPTIONS = [
    { value: 'new', label: 'New' },
    { value: 'ai_active', label: 'AI Active' },
    { value: 'qualifying', label: 'Qualifying' },
    { value: 'booking', label: 'Booking' },
    { value: 'booked', label: 'Booked' },
    { value: 'closed_won', label: 'Closed Won' },
    { value: 'closed_lost', label: 'Closed Lost' },
]

export function CustomerDetailsPanel({ contact, onClose }: CustomerDetailsPanelProps) {
    const [aiEnabled, setAiEnabled] = useState(contact.conversation?.ai_enabled ?? true)
    const [status, setStatus] = useState(contact.conversation?.status || 'new')
    const [sections, setSections] = useState({
        contact: true,
        status: true,
        ai: true,
        actions: false,
    })

    const displayName = [contact.first_name, contact.last_name].filter(Boolean).join(' ')
        || 'Unknown'

    const toggleSection = (key: keyof typeof sections) => {
        setSections(prev => ({ ...prev, [key]: !prev[key] }))
    }

    const updateConversationField = async (field: string, value: any) => {
        if (!contact.conversation?.id) return
        const supabase = createBrowserClient()
        await supabase
            .from('conversations')
            .update({ [field]: value })
            .eq('id', contact.conversation.id)
    }

    const handleStatusChange = async (newStatus: string) => {
        setStatus(newStatus)
        await updateConversationField('status', newStatus)
    }

    const handleToggleAi = async () => {
        const newValue = !aiEnabled
        setAiEnabled(newValue)
        await updateConversationField('ai_enabled', newValue)
    }

    return (
        <div className="w-80 bg-white border-l border-slate-200 flex flex-col hidden xl:flex">
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">Details</h3>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                    <X className="h-4 w-4" />
                </button>
            </div>

            <div className="flex-1 overflow-auto">
                {/* Contact Info */}
                <Section
                    title="Contact Info"
                    isOpen={sections.contact}
                    onToggle={() => toggleSection('contact')}
                >
                    <div className="space-y-2.5">
                        <div className="text-center mb-3">
                            <p className="font-semibold text-slate-900">{displayName}</p>
                            {contact.source && (
                                <ChannelBadge channel={contact.source} size="md" />
                            )}
                        </div>

                        <InfoRow icon={Phone} label="Phone" value={formatPhoneDisplay(contact.phone_e164)} />
                        {contact.email && (
                            <InfoRow icon={Mail} label="Email" value={contact.email} />
                        )}
                    </div>
                </Section>

                {/* Status */}
                <Section
                    title="Status"
                    isOpen={sections.status}
                    onToggle={() => toggleSection('status')}
                >
                    <select
                        value={status}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        className="w-full h-8 text-sm rounded border border-slate-200 bg-white px-2"
                    >
                        {STATUS_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </Section>

                {/* AI Control */}
                <Section
                    title="AI Control"
                    isOpen={sections.ai}
                    onToggle={() => toggleSection('ai')}
                >
                    <div className="space-y-3">
                        <button
                            onClick={handleToggleAi}
                            className={cn(
                                'w-full flex items-center justify-between px-3 py-2 rounded-lg border text-sm transition-colors',
                                aiEnabled
                                    ? 'border-blue-200 bg-blue-50 text-blue-700'
                                    : 'border-slate-200 bg-slate-50 text-slate-600'
                            )}
                        >
                            <span className="flex items-center gap-2">
                                {aiEnabled ? <Bot className="h-4 w-4" /> : <BotOff className="h-4 w-4" />}
                                {aiEnabled ? 'AI Enabled' : 'AI Disabled'}
                            </span>
                            <span className={cn(
                                'h-5 w-9 rounded-full relative transition-colors',
                                aiEnabled ? 'bg-blue-500' : 'bg-slate-300'
                            )}>
                                <span className={cn(
                                    'absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform',
                                    aiEnabled ? 'left-4' : 'left-0.5'
                                )} />
                            </span>
                        </button>
                        <p className="text-[11px] text-slate-500">
                            {aiEnabled
                                ? 'Chris (AI) is responding to this customer. Sending a manual message will disable AI.'
                                : 'AI responses disabled. Only staff messages will be sent.'}
                        </p>
                    </div>
                </Section>

                {/* Quick Actions */}
                <Section
                    title="Quick Actions"
                    isOpen={sections.actions}
                    onToggle={() => toggleSection('actions')}
                >
                    <div className="space-y-2">
                        <ActionButton
                            label="Mark as Booked"
                            onClick={() => handleStatusChange('booked')}
                        />
                        <ActionButton
                            label="Send Review Request"
                            onClick={() => {/* TODO: trigger review drip */}}
                        />
                        <ActionButton
                            label="Add to Suppression"
                            onClick={async () => {
                                const supabase = createBrowserClient()
                                await supabase.from('suppression_list').upsert({
                                    phone_e164: contact.phone_e164,
                                    reason: 'manual',
                                    source: 'admin_inbox',
                                }, { onConflict: 'phone_e164' })
                            }}
                            variant="destructive"
                        />
                    </div>
                </Section>
            </div>
        </div>
    )
}

function Section({
    title,
    isOpen,
    onToggle,
    children,
}: {
    title: string
    isOpen: boolean
    onToggle: () => void
    children: React.ReactNode
}) {
    return (
        <div className="border-b border-slate-100">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:bg-slate-50"
            >
                {title}
                {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </button>
            {isOpen && (
                <div className="px-4 pb-3">
                    {children}
                </div>
            )}
        </div>
    )
}

function InfoRow({
    icon: Icon,
    label,
    value,
}: {
    icon: any
    label: string
    value: string
}) {
    return (
        <div className="flex items-center gap-2 text-sm">
            <Icon className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
            <span className="text-slate-500 flex-shrink-0">{label}:</span>
            <span className="text-slate-900 truncate">{value}</span>
        </div>
    )
}

function ActionButton({
    label,
    onClick,
    variant = 'default',
}: {
    label: string
    onClick: () => void
    variant?: 'default' | 'destructive'
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                'w-full text-left px-3 py-2 text-sm rounded-lg border transition-colors',
                variant === 'destructive'
                    ? 'border-red-200 text-red-600 hover:bg-red-50'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
            )}
        >
            {label}
        </button>
    )
}
