
import { db } from '@/lib/db'
import { submissions } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const revalidate = 0

// Allowed emails for submissions access
const ALLOWED_EMAILS = [
    'adam@brandenburgplumbing.com',
    'lucas@brandenburgplumbing.com',
    'michael@brandenburgplumbing.com',
]

export default async function SubmissionDetailsPage({ params }: { params: { id: string } }) {
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
    const id = parseInt(params.id)
    if (isNaN(id)) notFound()

    const [submission] = await db.select().from(submissions).where(eq(submissions.id, id))

    if (!submission) notFound()

    const payload = submission.payload as any
    const typeLabel = submission.type === 'contact' ? 'Contact Form' :
        submission.type === 'career' ? 'Job Application' : submission.type

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/submissions" className="text-slate-500 hover:text-slate-900 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Submission Details</h1>
                    <p className="text-slate-500">View full details of this {typeLabel.toLowerCase()}.</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Submission Content</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-6">
                            {Object.entries(payload).map(([key, value]) => {
                                // Skip already displayed system fields (shown in sidebar)
                                if (['fullName', 'email', 'phone'].includes(key)) return null

                                // Format key (camelCase to Title Case)
                                const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())

                                // Check if value is long text (like message or cover letter) for better formatting
                                const isLongText = ['message', 'coverLetter', 'experience'].includes(key) || String(value).length > 100

                                return (
                                    <div key={key} className={isLongText ? 'col-span-full' : ''}>
                                        <h3 className="text-sm font-medium text-slate-500 mb-2">{label}</h3>
                                        {isLongText ? (
                                            <div className="p-4 bg-slate-50 rounded-md border border-slate-100 text-slate-800 whitespace-pre-wrap font-sans text-sm leading-relaxed">
                                                {String(value)}
                                            </div>
                                        ) : (
                                            <div className="text-slate-900 font-medium">{String(value)}</div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Meta Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h3 className="text-sm font-medium text-slate-500 mb-1">Type</h3>
                            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${submission.type === 'contact' ? 'border-transparent bg-blue-100 text-blue-800' :
                                    submission.type === 'career' ? 'border-transparent bg-purple-100 text-purple-800' :
                                        'border-transparent bg-slate-100 text-slate-800'
                                }`}>
                                {typeLabel}
                            </span>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-slate-500 mb-1">Date</h3>
                            <div className="text-slate-900">
                                {submission.createdAt ? format(submission.createdAt, 'MMM d, yyyy h:mm a') : 'N/A'}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-slate-500 mb-1">Status</h3>
                            <span className="inline-flex items-center rounded-full border border-transparent bg-slate-100 text-slate-800 px-2.5 py-0.5 text-xs font-semibold uppercase">
                                {submission.status || 'new'}
                            </span>
                        </div>
                        <div className="pt-4 border-t border-slate-100">
                            <h3 className="text-sm font-medium text-slate-500 mb-2">Contact Info</h3>
                            <div className="space-y-1 text-sm">
                                <div className="font-medium text-slate-900">{payload.fullName}</div>
                                <div className="text-slate-600"><a href={`mailto:${payload.email}`} className="hover:underline">{payload.email}</a></div>
                                <div className="text-slate-600"><a href={`tel:${payload.phone}`} className="hover:underline">{payload.phone}</a></div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
