import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/admin/Sidebar'
import { AdminProvider } from '@/lib/admin-context'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/admin/login')
    }

    const signOut = async () => {
        'use server'
        const supabase = createClient()
        await supabase.auth.signOut()
        redirect('/admin/login')
    }

    return (
        <AdminProvider>
            <div className="flex h-screen bg-slate-50">
                {/* Sidebar */}
                <Sidebar userEmail={user.email} signOutAction={signOut} />

                {/* Main Content */}
                <main className="flex-1 overflow-auto">
                    <div className="p-8">
                        {children}
                    </div>
                </main>
            </div>
        </AdminProvider>
    )
}
