import { cn } from '@/lib/utils'
import { Check, CheckCheck, AlertCircle } from 'lucide-react'

interface MessageBubbleProps {
    message: {
        id: string
        direction: string
        sender: string
        channel: string
        body: string
        delivery_status: string
        created_at: string
    }
}

function formatMessageTime(dateStr: string): string {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    })
}

function DeliveryIndicator({ status }: { status: string }) {
    switch (status) {
        case 'delivered':
            return <CheckCheck className="h-3 w-3 text-blue-400" />
        case 'sent':
            return <Check className="h-3 w-3 text-slate-400" />
        case 'failed':
        case 'undelivered':
            return <AlertCircle className="h-3 w-3 text-red-400" />
        default:
            return <Check className="h-3 w-3 text-slate-300" />
    }
}

export function MessageBubble({ message }: MessageBubbleProps) {
    const isOutbound = message.direction === 'outbound'
    const isAi = message.sender === 'ai_chris'
    const isDrip = message.sender === 'drip_system'
    const isSystem = message.sender === 'system'

    // System messages rendered as centered cards
    if (isSystem) {
        return (
            <div className="flex justify-center">
                <div className="bg-slate-100 rounded-lg px-3 py-2 max-w-sm">
                    <p className="text-xs text-slate-500 text-center">{message.body}</p>
                </div>
            </div>
        )
    }

    return (
        <div className={cn(
            'flex',
            isOutbound ? 'justify-end' : 'justify-start'
        )}>
            <div className={cn(
                'max-w-[75%] rounded-2xl px-3.5 py-2',
                isOutbound
                    ? 'bg-blue-500 text-white rounded-br-sm'
                    : 'bg-white text-slate-900 border border-slate-200 rounded-bl-sm'
            )}>
                {/* Sender label for AI and drip messages */}
                {(isAi || isDrip) && (
                    <p className={cn(
                        'text-[10px] font-medium mb-0.5',
                        isOutbound ? 'text-blue-200' : 'text-slate-400'
                    )}>
                        {isAi ? '[AI] Chris' : '[Drip]'}
                    </p>
                )}

                <p className={cn(
                    'text-sm whitespace-pre-wrap break-words',
                    isOutbound ? 'text-white' : 'text-slate-900'
                )}>
                    {message.body}
                </p>

                <div className={cn(
                    'flex items-center gap-1 mt-1',
                    isOutbound ? 'justify-end' : 'justify-start'
                )}>
                    <span className={cn(
                        'text-[10px]',
                        isOutbound ? 'text-blue-200' : 'text-slate-400'
                    )}>
                        {formatMessageTime(message.created_at)}
                    </span>
                    {isOutbound && <DeliveryIndicator status={message.delivery_status} />}
                </div>
            </div>
        </div>
    )
}
