
import { db } from '@/lib/db'
import { submissions } from '@/lib/schema'
import { desc } from 'drizzle-orm'
import { SubmissionsList } from '@/components/admin/submissions-list'

export const revalidate = 0 // Disable cache for this page

export default async function SubmissionsPage() {
    const data = await db.select().from(submissions).orderBy(desc(submissions.createdAt))

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Submissions</h1>
                <p className="text-slate-500">View and manage all form submissions.</p>
            </div>

            <SubmissionsList data={data} />
        </div>
    )
}
