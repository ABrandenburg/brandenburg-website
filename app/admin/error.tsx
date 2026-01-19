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

                <p className="text-slate-500 mb-6">
                    Something went wrong in the admin dashboard.
                </p>

                <div className="flex justify-center gap-4">
                    <Button
                        onClick={reset}
                        className="flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Try Again
                    </Button>
                </div>

                <p className="mt-8 text-xs text-slate-400">
                    Error Digest: {error.digest}
                </p>
            </div>
        </div>
    )
}
