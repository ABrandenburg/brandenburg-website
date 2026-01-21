
import { db } from '@/lib/db'
import { submissions } from '@/lib/schema'
import { desc } from 'drizzle-orm'
import { SubmissionsList } from '@/components/admin/submissions-list'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const revalidate = 0 // Disable cache for this page

// Allowed emails for submissions access
const ALLOWED_EMAILS = [
    'adam@brandenburgplumbing.com',
    'lucas@brandenburgplumbing.com',
    'michael@brandenburgplumbing.com',
]

export default async function SubmissionsPage() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Check if user is authenticated
    if (!user) {
        redirect('/admin/login')
    }

    // Check if user's email is in the allowed list
    if (!user.email || !ALLOWED_EMAILS.includes(user.email.toLowerCase())) {
        redirect('/admin?error=unauthorized')
    }

    let data
    let dbError: string | null = null
    try {
        data = await db.select().from(submissions).orderBy(desc(submissions.createdAt))
    } catch (error: any) {
        console.error('Database query error:', error)
        dbError = error.message || 'Failed to load submissions'
        data = []
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Submissions</h1>
                <p className="text-slate-500">View and manage all form submissions.</p>
            </div>

            {dbError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 text-sm">
                        <strong>Database Error:</strong> {dbError}
                    </p>
                    <p className="text-red-600 text-xs mt-2">
                        Check that <code className="bg-red-100 px-1 rounded">POSTGRES_URL</code> (Vercel Supabase integration) or <code className="bg-red-100 px-1 rounded">DATABASE_URL</code> is set correctly.
                    </p>
                    {dbError.includes('permission') || dbError.includes('policy') && (
                        <p className="text-red-600 text-xs mt-2">
                            If using RLS, ensure the connection has proper permissions or use a service role connection.
                        </p>
                    )}
                </div>
            )}

            <SubmissionsList data={data} />
        </div>
    )
}
