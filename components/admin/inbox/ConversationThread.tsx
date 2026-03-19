'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient as createBrowserClient } from '@/lib/supabase/client'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageBubble } from './MessageBubble'
import { MessageComposer } from './MessageComposer'
import { ChannelBadge } from './ChannelBadge'
import { formatPhoneDisplay } from '@/lib/webhooks/phone'
import type { Contact } from './InboxLayout'

interface Message {
    id: string
    direction: string
    sender: string
    channel: string
    body: string
    delivery_status: string
    created_at: string
    metadata: any
}

interface ConversationThreadProps {
    contact: Contact
    conversationId: string
}

export function ConversationThread({ contact, conversationId }: ConversationThreadProps) {
    const [messages, setMessages] = useState<Message[]>([])
    const [loading, setLoading] = useState(true)
    const scrollRef = useRef<HTMLDivElement>(null)
    const bottomRef = useRef<HTMLDivElement>(null)

    const displayName = [contact.first_name, contact.last_name].filter(Boolean).join(' ')
        || formatPhoneDisplay(contact.phone_e164)

    // Load messages
    useEffect(() => {
        async function loadMessages() {
            setLoading(true)
            const supabase = createBrowserClient()

            const { data } = await supabase
                .from('messages')
                .select('id, direction, sender, channel, body, delivery_status, created_at, metadata')
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: true })

            setMessages(data || [])
            setLoading(false)
        }

        loadMessages()
    }, [conversationId])

    // Scroll to bottom on new messages
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // Subscribe to new messages for this conversation
    useEffect(() => {
        const supabase = createBrowserClient()

        const channel = supabase
            .channel(`thread-${conversationId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversationId}`,
                },
                (payload: any) => {
                    const newMsg = payload.new as Message
                    setMessages(prev => {
                        // Avoid duplicates
                        if (prev.some(m => m.id === newMsg.id)) return prev
                        return [...prev, newMsg]
                    })
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversationId}`,
                },
                (payload: any) => {
                    const updated = payload.new as Message
                    setMessages(prev =>
                        prev.map(m => m.id === updated.id ? { ...m, ...updated } : m)
                    )
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [conversationId])

    const handleSendMessage = async (body: string) => {
        const supabase = createBrowserClient()

        // Optimistic update
        const optimisticMsg: Message = {
            id: `opt-${Date.now()}`,
            direction: 'outbound',
            sender: 'staff',
            channel: 'sms',
            body,
            delivery_status: 'queued',
            created_at: new Date().toISOString(),
            metadata: {},
        }
        setMessages(prev => [...prev, optimisticMsg])

        // Send via API
        try {
            const response = await fetch('/api/inbox/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    conversationId,
                    customerId: contact.id,
                    phoneE164: contact.phone_e164,
                    body,
                }),
            })

            if (!response.ok) {
                console.error('Failed to send message')
            }
        } catch (error) {
            console.error('Send error:', error)
        }
    }

    return (
        <div className="flex flex-col h-full">
            {/* Thread header */}
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                    <div>
                        <h2 className="text-sm font-semibold text-slate-900">{displayName}</h2>
                        <p className="text-xs text-slate-500">{formatPhoneDisplay(contact.phone_e164)}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {contact.conversation?.source && (
                        <ChannelBadge channel={contact.conversation.source} size="md" />
                    )}
                    {contact.conversation?.ai_enabled && (
                        <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                            AI Active
                        </span>
                    )}
                </div>
            </div>

            {/* Messages */}
            <ScrollArea ref={scrollRef} className="flex-1 bg-slate-50">
                <div className="p-4 space-y-3 min-h-full flex flex-col justify-end">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <p className="text-sm text-slate-400">Loading messages...</p>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex items-center justify-center py-8">
                            <p className="text-sm text-slate-400">No messages yet</p>
                        </div>
                    ) : (
                        messages.map(msg => (
                            <MessageBubble key={msg.id} message={msg} />
                        ))
                    )}
                    <div ref={bottomRef} />
                </div>
            </ScrollArea>

            {/* Composer */}
            <MessageComposer onSend={handleSendMessage} />
        </div>
    )
}
