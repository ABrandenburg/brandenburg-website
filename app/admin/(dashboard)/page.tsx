
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, AlertTriangle } from 'lucide-react'
import { db } from '@/lib/db'
import { submissions } from '@/lib/schema'
import { count } from 'drizzle-orm'
import Link from 'next/link'

export const revalidate = 0

async function getSubmissionCount() {
    try {
        const [result] = await db.select({ count: count() }).from(submissions)
        return { count: result.count, error: null }
    } catch (error: any) {
        console.error('Database error:', error)
        return { count: 0, error: error.message || 'Unknown database error' }
    }
}

export default async function AdminDashboard() {
    const { count: submissionCount, error } = await getSubmissionCount()

    if (error) {
        return (
            <div className="space-y-8">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h2>
                    <p className="text-slate-500">Overview of your system status and recent activity. (v1.5)</p>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <div className="flex items-start gap-4">
                        <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-red-800">Database Connection Error</h3>
                            <p className="text-red-700 mt-1 text-sm">
                                Could not connect to the database. This usually means:
                            </p>
                            <ul className="list-disc list-inside text-red-700 mt-2 text-sm space-y-1">
                                <li>The <code className="bg-red-100 px-1 rounded">submissions</code> table does not exist</li>
                                <li>The DATABASE_URL is incorrect or missing</li>
                                <li>The database password has changed</li>
                            </ul>
                            <div className="mt-4 p-3 bg-red-100 rounded text-xs font-mono text-red-800 break-all">
                                {error}
                            </div>
                            <div className="mt-2 p-3 bg-yellow-100 rounded text-xs font-mono text-yellow-800 break-all">
                                DB URL: {process.env.DATABASE_URL?.replace(/:[^@]+@/, ':***@') || 'NOT SET'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h2>
                <p className="text-slate-500">Overview of your system status and recent activity. (v1.2)</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Link href="/admin/submissions">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Submissions
                            </CardTitle>
                            <FileText className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{submissionCount}</div>
                            <p className="text-xs text-muted-foreground">
                                All time form submissions
                            </p>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    )
}
