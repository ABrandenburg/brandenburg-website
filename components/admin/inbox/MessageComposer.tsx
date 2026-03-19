'use client'

import { useState, useRef, useCallback } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Send } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MessageComposerProps {
    onSend: (body: string) => void
    disabled?: boolean
}

export function MessageComposer({ onSend, disabled }: MessageComposerProps) {
    const [body, setBody] = useState('')
    const [sending, setSending] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const handleSend = useCallback(async () => {
        const trimmed = body.trim()
        if (!trimmed || sending) return

        setSending(true)
        try {
            onSend(trimmed)
            setBody('')
            textareaRef.current?.focus()
        } finally {
            setSending(false)
        }
    }, [body, sending, onSend])

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault()
            handleSend()
        }
    }, [handleSend])

    return (
        <div className="border-t border-slate-200 bg-white p-3">
            <div className="flex items-end gap-2">
                <Textarea
                    ref={textareaRef}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message... (Cmd+Enter to send)"
                    className="flex-1 min-h-[40px] max-h-[120px] resize-none text-sm"
                    rows={1}
                    disabled={disabled || sending}
                />
                <button
                    onClick={handleSend}
                    disabled={!body.trim() || sending || disabled}
                    className={cn(
                        'flex items-center justify-center h-9 w-9 rounded-lg transition-colors flex-shrink-0',
                        body.trim()
                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                            : 'bg-slate-100 text-slate-400'
                    )}
                >
                    <Send className="h-4 w-4" />
                </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
                Sending as staff overrides AI for this conversation
            </p>
        </div>
    )
}
