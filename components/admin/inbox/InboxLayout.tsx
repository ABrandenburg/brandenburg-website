'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient as createBrowserClient } from '@/lib/supabase/client'
import { ContactList } from './ContactList'
import { ConversationThread } from './ConversationThread'
import { CustomerDetailsPanel } from './CustomerDetailsPanel'

export interface Contact {
    id: string
    phone_e164: string
    first_name: string | null
    last_name: string | null
    email: string | null
    source: string | null
    last_message_at: string | null
    unread_count: number
    created_at: string
    lastMessage: {
        body: string
        sender: string
        created_at: string
        channel: string
    } | null
    conversation: {
        id: string
        status: string
        source: string | null
        ai_enabled: boolean
    } | null
}

interface InboxLayoutProps {
    initialContacts: Contact[]
}

export function InboxLayout({ initialContacts }: InboxLayoutProps) {
    const [contacts, setContacts] = useState<Contact[]>(initialContacts)
    const [selectedContactId, setSelectedContactId] = useState<string | null>(null)
    const [showDetails, setShowDetails] = useState(true)

    const selectedContact = contacts.find(c => c.id === selectedContactId) || null

    // Supabase Realtime subscriptions
    useEffect(() => {
        const supabase = createBrowserClient()

        // Subscribe to new messages
        const messagesChannel = supabase
            .channel('inbox-messages')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages' },
                (payload: any) => {
                    const newMsg = payload.new as any

                    setContacts(prev => {
                        const updated = prev.map(c => {
                            if (c.id === newMsg.customer_id) {
                                return {
                                    ...c,
                                    last_message_at: newMsg.created_at,
                                    unread_count: newMsg.direction === 'inbound'
                                        ? c.unread_count + 1
                                        : c.unread_count,
                                    lastMessage: {
                                        body: newMsg.body,
                                        sender: newMsg.sender,
                                        created_at: newMsg.created_at,
                                        channel: newMsg.channel,
                                    },
                                }
                            }
                            return c
                        })

                        // Sort by most recent message
                        return updated.sort((a, b) => {
                            const aTime = a.last_message_at ? new Date(a.last_message_at).getTime() : 0
                            const bTime = b.last_message_at ? new Date(b.last_message_at).getTime() : 0
                            return bTime - aTime
                        })
                    })
                }
            )
            .subscribe()

        // Subscribe to customer updates
        const customersChannel = supabase
            .channel('inbox-customers')
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'customers' },
                (payload: any) => {
                    const updated = payload.new as any
                    setContacts(prev =>
                        prev.map(c => c.id === updated.id ? { ...c, ...updated } : c)
                    )
                }
            )
            .subscribe()

        // Subscribe to new conversations (new leads)
        const conversationsChannel = supabase
            .channel('inbox-conversations')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'conversations' },
                async (payload: any) => {
                    const newConvo = payload.new as any
                    // Fetch the customer data for this new conversation
                    const { data: customer } = await supabase
                        .from('customers')
                        .select('*')
                        .eq('id', newConvo.customer_id)
                        .single()

                    if (customer) {
                        setContacts(prev => {
                            // Check if customer already exists in list
                            const exists = prev.some(c => c.id === customer.id)
                            if (exists) {
                                return prev.map(c =>
                                    c.id === customer.id
                                        ? { ...c, conversation: newConvo }
                                        : c
                                )
                            }
                            // Add new contact to top of list
                            return [{
                                ...customer,
                                lastMessage: null,
                                conversation: newConvo,
                            }, ...prev]
                        })
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(messagesChannel)
            supabase.removeChannel(customersChannel)
            supabase.removeChannel(conversationsChannel)
        }
    }, [])

    const handleSelectContact = useCallback((contactId: string) => {
        setSelectedContactId(contactId)

        // Reset unread count
        const supabase = createBrowserClient()
        supabase
            .from('customers')
            .update({ unread_count: 0 })
            .eq('id', contactId)
            .then(() => {
                setContacts(prev =>
                    prev.map(c =>
                        c.id === contactId ? { ...c, unread_count: 0 } : c
                    )
                )
            })
    }, [])

    return (
        <div className="flex h-full bg-white">
            {/* Left: Contact List */}
            <ContactList
                contacts={contacts}
                selectedContactId={selectedContactId}
                onSelectContact={handleSelectContact}
            />

            {/* Center: Conversation Thread */}
            <div className="flex-1 flex flex-col min-w-0 border-x border-slate-200">
                {selectedContact && selectedContact.conversation ? (
                    <ConversationThread
                        contact={selectedContact}
                        conversationId={selectedContact.conversation.id}
                    />
                ) : (
                    <div className="flex-1 flex items-center justify-center bg-slate-50">
                        <div className="text-center">
                            <p className="text-slate-500 text-sm">
                                {contacts.length === 0
                                    ? 'No conversations yet'
                                    : 'Select a conversation to view'}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Right: Customer Details */}
            {showDetails && selectedContact && (
                <CustomerDetailsPanel
                    contact={selectedContact}
                    onClose={() => setShowDetails(false)}
                />
            )}

            {/* Show details toggle when hidden */}
            {!showDetails && selectedContact && (
                <button
                    onClick={() => setShowDetails(true)}
                    className="absolute right-4 top-4 text-xs text-slate-500 hover:text-slate-800"
                >
                    Show details
                </button>
            )}
        </div>
    )
}
