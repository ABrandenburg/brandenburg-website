'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { StatusSelector } from '@/components/admin/status-selector'

interface Submission {
    id: number
    type: string
    payload: any
    status: string | null
    createdAt: Date | null
}

export function SubmissionsList({ data }: { data: Submission[] }) {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<'contact' | 'career'>('contact')

    const filteredData = data.filter(item => item.type === activeTab)

    return (
        <div className="space-y-4">
            {/* Tabs */}
            <div className="flex border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('contact')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'contact'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                        }`}
                >
                    Contact Forms
                </button>
                <button
                    onClick={() => setActiveTab('career')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'career'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                        }`}
                >
                    Job Applications
                </button>
            </div>

            {/* List */}
            {filteredData.length === 0 ? (
                <div className="text-center py-10 text-slate-500 bg-white rounded-lg border border-dashed border-slate-200">
                    No {activeTab === 'contact' ? 'contact forms' : 'job applications'} found.
                </div>
            ) : (
                <div className="relative w-full overflow-auto bg-white rounded-lg border border-slate-200 shadow-sm">
                    <table className="w-full caption-bottom text-sm text-left">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b bg-slate-50 hover:bg-slate-50/75">
                                <th className="h-12 px-4 align-middle font-medium text-slate-500">Date</th>
                                <th className="h-12 px-4 align-middle font-medium text-slate-500">Name</th>
                                <th className="h-12 px-4 align-middle font-medium text-slate-500">Email</th>
                                <th className="h-12 px-4 align-middle font-medium text-slate-500">Message</th>
                                <th className="h-12 px-4 align-middle font-medium text-slate-500">Status</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0 bg-white">
                            {filteredData.map((submission) => {
                                const payload = submission.payload as any
                                const name = payload?.fullName || 'N/A'
                                const email = payload?.email || 'N/A'
                                const message = payload?.message || payload?.motivation || '-'
                                const displayMessage = message.length > 50 ? message.substring(0, 50) + '...' : message

                                return (
                                    <tr
                                        key={submission.id}
                                        onClick={() => router.push(`/admin/submissions/${submission.id}`)}
                                        className="border-b transition-colors hover:bg-slate-50 cursor-pointer"
                                    >
                                        <td className="p-4 align-middle font-medium">
                                            {submission.createdAt ? format(new Date(submission.createdAt), 'MMM d, yyyy h:mm a') : 'N/A'}
                                        </td>
                                        <td className="p-4 align-middle text-slate-900">{name}</td>
                                        <td className="p-4 align-middle text-slate-600">{email}</td>
                                        <td className="p-4 align-middle text-slate-600 truncate max-w-xs">{displayMessage}</td>
                                        <td className="p-4 align-middle" onClick={(e) => e.stopPropagation()}>
                                            {submission.type === 'career' ? (
                                                <StatusSelector id={submission.id} initialStatus={submission.status || 'Applied'} />
                                            ) : (
                                                <span className="inline-flex items-center rounded-full border border-transparent bg-slate-100 text-slate-800 px-2.5 py-0.5 text-xs font-semibold uppercase">
                                                    {submission.status || 'new'}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )
            }
        </div >
    )
}
