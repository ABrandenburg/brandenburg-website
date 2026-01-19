'use client'

import { useState, useRef, useEffect } from 'react'
import { updateSubmissionStatus } from '@/app/actions/update-status'
import { Loader2, ChevronDown } from 'lucide-react'

const STATUS_CONFIG: Record<string, { label: string, color: string }> = {
    'new': { label: 'New', color: 'bg-slate-100 text-slate-800 border-slate-200' }, // Default/Legacy
    'Applied': { label: 'Applied', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    'Phone Interview Scheduled': { label: 'Phone Interview Scheduled', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    'Ready for In-Person Interview': { label: 'Ready for Interview', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    'In Person Interview Scheduled': { label: 'Interview Scheduled', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    'Offer Extended': { label: 'Offer Extended', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    'Hired': { label: 'Hired', color: 'bg-green-100 text-green-800 border-green-200' },
    'Rejected': { label: 'Rejected', color: 'bg-red-100 text-red-800 border-red-200' },
}

interface StatusSelectorProps {
    id: number
    initialStatus: string
}

export function StatusSelector({ id, initialStatus }: StatusSelectorProps) {
    const [status, setStatus] = useState(initialStatus || 'Applied')
    const [isOpen, setIsOpen] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleSelect = async (newStatus: string) => {
        setIsOpen(false)
        if (newStatus === status) return

        const previousStatus = status
        setStatus(newStatus) // Optimistic update
        setIsUpdating(true)

        try {
            const result = await updateSubmissionStatus(id, newStatus)
            if (!result.success) {
                setStatus(previousStatus) // Revert on failure
                console.error(result.error)
            }
        } catch (error) {
            setStatus(previousStatus)
            console.error(error)
        } finally {
            setIsUpdating(false)
        }
    }

    const currentConfig = STATUS_CONFIG[status] || { label: status, color: 'bg-slate-100 text-slate-800 border-slate-200' }

    return (
        <div className="relative inline-block" ref={menuRef} onClick={(e) => e.stopPropagation()}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={isUpdating}
                className={`
                    inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors hover:opacity-80
                    ${currentConfig.color}
                `}
            >
                {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                {currentConfig.label}
                <ChevronDown className="w-3 h-3 opacity-50" />
            </button>

            {isOpen && (
                <div className="absolute z-50 mt-1 w-56 overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-1">
                        {Object.entries(STATUS_CONFIG).filter(([key]) => key !== 'new').map(([key, config]) => (
                            <button
                                key={key}
                                onClick={() => handleSelect(key)}
                                className={`
                                    w-full text-left px-2 py-1.5 text-xs rounded-sm transition-colors flex items-center gap-2
                                    ${status === key ? 'bg-slate-50 font-medium' : 'hover:bg-slate-50'}
                                `}
                            >
                                <span className={`w-2 h-2 rounded-full ${config.color.split(' ')[0].replace('bg-', 'bg-')}`}></span>
                                {config.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
