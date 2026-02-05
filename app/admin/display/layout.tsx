import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { AdminProvider } from '@/lib/admin-context'

export default async function DisplayLayout({
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
            <div className="min-h-screen bg-slate-50">
                {/* Minimal header - hidden in fullscreen via CSS */}
                <header className="bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between fullscreen:hidden">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-slate-600">
                            Scorecard Display
                        </span>
                        <span className="text-xs text-slate-400">
                            {user.email}
                        </span>
                    </div>
                    <form action={signOut}>
                        <button
                            type="submit"
                            className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </form>
                </header>

                {/* Main Content - Full width, no sidebar */}
                <main>
                    {children}
                </main>
            </div>
        </AdminProvider>
    )
}
