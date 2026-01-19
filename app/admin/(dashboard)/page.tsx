
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText } from 'lucide-react'
import { db } from '@/lib/db'
import { submissions } from '@/lib/schema'
import { count } from 'drizzle-orm'
import Link from 'next/link'

export const revalidate = 0

export default async function AdminDashboard() {
    const [submissionCount] = await db.select({ count: count() }).from(submissions)

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h2>
                <p className="text-slate-500">Overview of your system status and recent activity.</p>
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
                            <div className="text-2xl font-bold">{submissionCount.count}</div>
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
