import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { InboxLayout } from '@/components/admin/inbox/InboxLayout'

export const metadata = {
    title: 'Inbox - Brandenburg Admin',
}

export default async function InboxPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/admin/login')
    }

    // Fetch initial contacts with their latest message
    const { data: customers } = await supabase
        .from('customers')
        .select(`
            id,
            phone_e164,
            first_name,
            last_name,
            email,
            source,
            last_message_at,
            unread_count,
            created_at
        `)
        .order('last_message_at', { ascending: false, nullsFirst: false })
        .limit(50)

    // Fetch latest message preview for each customer
    const customersWithPreview = await Promise.all(
        (customers || []).map(async (customer) => {
            const { data: latestMessage } = await supabase
                .from('messages')
                .select('body, sender, created_at, channel')
                .eq('customer_id', customer.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle()

            // Get their latest conversation status
            const { data: latestConvo } = await supabase
                .from('conversations')
                .select('id, status, source, ai_enabled')
                .eq('customer_id', customer.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle()

            return {
                ...customer,
                lastMessage: latestMessage,
                conversation: latestConvo,
            }
        })
    )

    return <InboxLayout initialContacts={customersWithPreview} />
}
