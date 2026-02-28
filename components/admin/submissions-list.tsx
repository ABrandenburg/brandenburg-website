'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { StatusSelector } from '@/components/admin/status-selector'

type TabType = 'career' | 'contact' | 'wedding'

const TAB_CONFIG: { key: TabType; label: string; emptyLabel: string }[] = [
    { key: 'career', label: 'Job Applications', emptyLabel: 'job applications' },
    { key: 'contact', label: 'Contact Forms', emptyLabel: 'contact forms' },
    { key: 'wedding', label: 'Wedding Details', emptyLabel: 'wedding questionnaires' },
]

interface Submission {
    id: number
    type: string
    payload: any
    status: string | null
    createdAt: Date | null
}

export function SubmissionsList({ data }: { data: Submission[] }) {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<TabType>('career')

    const filteredData = data.filter(item => item.type === activeTab)
    const activeConfig = TAB_CONFIG.find(t => t.key === activeTab)!

    return (
        <div className="space-y-4">
            {/* Tabs */}
            <div className="flex border-b border-slate-200">
                {TAB_CONFIG.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.key
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            }`}
                    >
                        {tab.label}
                        {data.filter(item => item.type === tab.key).length > 0 && (
                            <span className="ml-2 inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                                {data.filter(item => item.type === tab.key).length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* List */}
            {filteredData.length === 0 ? (
                <div className="text-center py-10 text-slate-500 bg-white rounded-lg border border-dashed border-slate-200">
                    No {activeConfig.emptyLabel} found.
                </div>
            ) : (
                <div className="relative w-full overflow-auto bg-white rounded-lg border border-slate-200 shadow-sm">
                    <table className="w-full caption-bottom text-sm text-left">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b bg-slate-50 hover:bg-slate-50/75">
                                <th className="h-12 px-4 align-middle font-medium text-slate-500">Date</th>
                                <th className="h-12 px-4 align-middle font-medium text-slate-500">Name</th>
                                {activeTab === 'career' && (
                                    <>
                                        <th className="h-12 px-4 align-middle font-medium text-slate-500">Role</th>
                                        <th className="h-12 px-4 align-middle font-medium text-slate-500">License</th>
                                    </>
                                )}
                                {activeTab === 'wedding' && (
                                    <>
                                        <th className="h-12 px-4 align-middle font-medium text-slate-500">Couple</th>
                                        <th className="h-12 px-4 align-middle font-medium text-slate-500">Wedding Date</th>
                                        <th className="h-12 px-4 align-middle font-medium text-slate-500">Venue</th>
                                    </>
                                )}
                                <th className="h-12 px-4 align-middle font-medium text-slate-500">Email</th>
                                <th className="h-12 px-4 align-middle font-medium text-slate-500">
                                    {activeTab === 'career' ? 'Notes' : activeTab === 'wedding' ? 'Services' : 'Message'}
                                </th>
                                <th className="h-12 px-4 align-middle font-medium text-slate-500">Status</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0 bg-white">
                            {filteredData.map((submission) => {
                                const payload = submission.payload as any
                                const name = payload?.fullName || 'N/A'
                                const email = payload?.email || 'N/A'

                                let summary = '-'
                                if (activeTab === 'wedding') {
                                    const services = payload?.servicesNeeded
                                    summary = Array.isArray(services) ? services.join(', ') : '-'
                                } else {
                                    summary = payload?.message || payload?.motivation || '-'
                                }
                                const displaySummary = summary.length > 50 ? summary.substring(0, 50) + '...' : summary

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
                                        {activeTab === 'career' && (
                                            <>
                                                <td className="p-4 align-middle text-slate-700">{payload?.role || '-'}</td>
                                                <td className="p-4 align-middle text-slate-700">{payload?.licenseType || '-'}</td>
                                            </>
                                        )}
                                        {activeTab === 'wedding' && (
                                            <>
                                                <td className="p-4 align-middle text-slate-700">
                                                    {payload?.partnerOneName && payload?.partnerTwoName
                                                        ? `${payload.partnerOneName} & ${payload.partnerTwoName}`
                                                        : '-'}
                                                </td>
                                                <td className="p-4 align-middle text-slate-700">{payload?.weddingDate || '-'}</td>
                                                <td className="p-4 align-middle text-slate-700">{payload?.venueName || '-'}</td>
                                            </>
                                        )}
                                        <td className="p-4 align-middle text-slate-600">{email}</td>
                                        <td className="p-4 align-middle text-slate-600 truncate max-w-xs">{displaySummary}</td>
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
