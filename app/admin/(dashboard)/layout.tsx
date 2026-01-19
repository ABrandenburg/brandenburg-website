

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { LogOut, LayoutDashboard, FileText, Settings, BookOpen } from 'lucide-react'

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
        <div className="flex h-screen bg-slate-50">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col">
                <div className="p-6 border-b border-slate-800 flex flex-col items-center">
                    <div className="bg-white p-2 rounded w-full flex justify-center mb-4">
                        <Image
                            src="/images/logo.png"
                            alt="Brandenburg Plumbing"
                            width={160}
                            height={40}
                            className="h-8 w-auto"
                            priority
                        />
                    </div>
                    <p className="text-xs text-slate-400 truncate w-full text-center">{user.email}</p>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <Link href="/admin" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors">
                        <LayoutDashboard className="w-5 h-5" />
                        Dashboard
                    </Link>
                    <Link href="/admin/submissions" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors">
                        <FileText className="w-5 h-5" />
                        Submissions
                    </Link>
                    <Link href="/admin/tools" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors">
                        <Settings className="w-5 h-5" />
                        Tools & Automations
                    </Link>
                    <Link href="/admin/training" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors">
                        <BookOpen className="w-5 h-5" />
                        Training
                    </Link>
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <form action={signOut}>
                        <button type="submit" className="flex items-center gap-3 px-3 py-2 w-full text-left text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors">
                            <LogOut className="w-5 h-5" />
                            Sign Out
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
