'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function AdminError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="flex h-screen items-center justify-center bg-slate-50">
            <div className="text-center p-8 bg-white rounded-lg shadow-lg border border-slate-200 max-w-md w-full">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-6">
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>

                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    Admin Error
                </h2>

                <p className="text-slate-500 mb-4">
                    Something went wrong in the admin dashboard.
                </p>

                {/* Check if it's a database/submissions table error */}
                {(error.message?.includes('submissions') || error.message?.includes('Failed query')) && (
                    <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-left">
                        <h3 className="font-semibold text-amber-800 mb-2">Database Connection Issue</h3>
                        <p className="text-sm text-amber-700 mb-3">
                            There&apos;s a problem querying the database. This could be:
                        </p>
                        <ul className="text-xs text-amber-700 mb-3 space-y-1 list-disc list-inside">
                            <li>Missing or incorrect <code className="bg-amber-100 px-1 rounded">DATABASE_URL</code> environment variable</li>
                            <li>Database connection permissions (RLS policies blocking the query)</li>
                            <li>SSL certificate issues with the database connection</li>
                        </ul>
                        <div className="text-xs text-amber-600 space-y-2">
                            <p><strong>Check your environment variables:</strong></p>
                            <p className="ml-4 font-mono bg-amber-100 px-2 py-1 rounded">
                                POSTGRES_URL (Vercel integration) or DATABASE_URL should be set
                            </p>
                            <p className="mt-2 text-xs text-amber-500">
                                If using Vercel&apos;s Supabase integration, <code className="bg-amber-100 px-1 rounded">POSTGRES_URL</code> is automatically provided.
                            </p>
                            {error.message?.includes('permission') || error.message?.includes('policy') ? (
                                <p className="mt-2 text-xs text-amber-500">
                                    If RLS is enabled, you may need to ensure the connection has the right role or adjust RLS policies.
                                </p>
                            ) : null}
                        </div>
                    </div>
                )}

                <div className="flex justify-center gap-4">
                    <Button
                        onClick={reset}
                        className="flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Try Again
                    </Button>
                </div>

                <details className="mt-6 text-left">
                    <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-600">
                        Technical Details
                    </summary>
                    <p className="mt-2 text-xs text-slate-400 font-mono break-all">
                        Error: {error.message}
                    </p>
                    {error.digest && (
                        <p className="mt-2 text-xs text-slate-400">
                            Digest: {error.digest}
                        </p>
                    )}
                </details>
            </div>
        </div>
    )
}
