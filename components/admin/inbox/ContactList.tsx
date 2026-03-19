'use client'

import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ContactListItem } from './ContactListItem'
import { ContactListFilters, type FilterState } from './ContactListFilters'
import { Search } from 'lucide-react'
import type { Contact } from './InboxLayout'

interface ContactListProps {
    contacts: Contact[]
    selectedContactId: string | null
    onSelectContact: (id: string) => void
}

export function ContactList({ contacts, selectedContactId, onSelectContact }: ContactListProps) {
    const [search, setSearch] = useState('')
    const [filters, setFilters] = useState<FilterState>({
        status: null,
        source: null,
    })

    const filteredContacts = useMemo(() => {
        let result = contacts

        // Search filter
        if (search) {
            const q = search.toLowerCase()
            result = result.filter(c => {
                const name = [c.first_name, c.last_name].filter(Boolean).join(' ').toLowerCase()
                const phone = c.phone_e164 || ''
                const preview = c.lastMessage?.body?.toLowerCase() || ''
                return name.includes(q) || phone.includes(q) || preview.includes(q)
            })
        }

        // Status filter
        if (filters.status) {
            result = result.filter(c => c.conversation?.status === filters.status)
        }

        // Source filter
        if (filters.source) {
            result = result.filter(c =>
                c.source === filters.source || c.conversation?.source === filters.source
            )
        }

        return result
    }, [contacts, search, filters])

    return (
        <div className="w-80 flex flex-col bg-white border-r border-slate-200">
            {/* Search */}
            <div className="p-3 border-b border-slate-200">
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search contacts..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8 h-8 text-sm"
                    />
                </div>
            </div>

            {/* Filters */}
            <ContactListFilters filters={filters} onChange={setFilters} />

            {/* Contact List */}
            <ScrollArea className="flex-1">
                <div className="py-1">
                    {filteredContacts.length === 0 ? (
                        <p className="text-center text-slate-400 text-sm py-8">No contacts found</p>
                    ) : (
                        filteredContacts.map(contact => (
                            <ContactListItem
                                key={contact.id}
                                contact={contact}
                                isSelected={contact.id === selectedContactId}
                                onClick={() => onSelectContact(contact.id)}
                            />
                        ))
                    )}
                </div>
            </ScrollArea>
        </div>
    )
}
