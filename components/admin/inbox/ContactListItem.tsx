'use client'

import { Avatar } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { ChannelBadge } from './ChannelBadge'
import type { Contact } from './InboxLayout'

interface ContactListItemProps {
    contact: Contact
    isSelected: boolean
    onClick: () => void
}

function formatTime(dateStr: string | null): string {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = diff / (1000 * 60 * 60)

    if (hours < 1) return `${Math.max(1, Math.round(diff / (1000 * 60)))}m`
    if (hours < 24) return `${Math.round(hours)}h`
    if (hours < 48) return 'Yesterday'
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function truncate(str: string, len: number): string {
    if (str.length <= len) return str
    return str.slice(0, len) + '...'
}

export function ContactListItem({ contact, isSelected, onClick }: ContactListItemProps) {
    const name = [contact.first_name, contact.last_name].filter(Boolean).join(' ')
    const displayName = name || contact.phone_e164
    const preview = contact.lastMessage?.body || 'No messages yet'
    const isAiMessage = contact.lastMessage?.sender === 'ai_chris'
    const hasUnread = contact.unread_count > 0

    return (
        <button
            onClick={onClick}
            className={cn(
                'w-full text-left px-3 py-2.5 flex items-start gap-3 transition-colors hover:bg-slate-50',
                isSelected && 'bg-blue-50 hover:bg-blue-50',
                hasUnread && !isSelected && 'bg-blue-50/30'
            )}
        >
            <Avatar name={displayName} size="md" />

            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <span className={cn(
                        'text-sm truncate',
                        hasUnread ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'
                    )}>
                        {displayName}
                    </span>
                    <span className="text-xs text-slate-400 flex-shrink-0">
                        {formatTime(contact.last_message_at || contact.created_at)}
                    </span>
                </div>

                <div className="flex items-center gap-1.5 mt-0.5">
                    {isAiMessage && (
                        <span className="text-xs text-blue-500 flex-shrink-0">AI</span>
                    )}
                    <p className={cn(
                        'text-xs truncate',
                        hasUnread ? 'text-slate-700 font-medium' : 'text-slate-500'
                    )}>
                        {truncate(preview, 60)}
                    </p>
                </div>

                <div className="flex items-center gap-1.5 mt-1">
                    {contact.conversation?.source && (
                        <ChannelBadge channel={contact.conversation.source} size="sm" />
                    )}
                    {contact.conversation?.status && (
                        <StatusDot status={contact.conversation.status} />
                    )}
                    {hasUnread && (
                        <span className="ml-auto bg-blue-500 text-white text-[10px] font-bold rounded-full h-4 min-w-[16px] flex items-center justify-center px-1">
                            {contact.unread_count}
                        </span>
                    )}
                </div>
            </div>
        </button>
    )
}

function StatusDot({ status }: { status: string }) {
    const colors: Record<string, string> = {
        new: 'bg-green-500',
        ai_active: 'bg-blue-500',
        qualifying: 'bg-yellow-500',
        booking: 'bg-purple-500',
        booked: 'bg-emerald-500',
        closed_won: 'bg-emerald-700',
        closed_lost: 'bg-slate-400',
    }

    const labels: Record<string, string> = {
        new: 'New',
        ai_active: 'AI Active',
        qualifying: 'Qualifying',
        booking: 'Booking',
        booked: 'Booked',
        closed_won: 'Won',
        closed_lost: 'Lost',
    }

    return (
        <span className="flex items-center gap-1 text-[10px] text-slate-500">
            <span className={cn('h-1.5 w-1.5 rounded-full', colors[status] || 'bg-slate-300')} />
            {labels[status] || status}
        </span>
    )
}
