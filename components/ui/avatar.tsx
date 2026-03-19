import * as React from 'react'
import { cn } from '@/lib/utils'

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
    name?: string
    size?: 'sm' | 'md' | 'lg'
}

function getInitials(name: string): string {
    return name
        .split(' ')
        .map(part => part[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase()
}

const COLORS = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500',
    'bg-pink-500', 'bg-teal-500', 'bg-indigo-500', 'bg-red-500',
]

function getColor(name: string): string {
    let hash = 0
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    return COLORS[Math.abs(hash) % COLORS.length]
}

const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
    ({ name, size = 'md', className, ...props }, ref) => {
        const initials = name ? getInitials(name) : '?'
        const color = name ? getColor(name) : 'bg-slate-400'

        return (
            <div
                ref={ref}
                className={cn(
                    'inline-flex items-center justify-center rounded-full text-white font-medium flex-shrink-0',
                    sizeClasses[size],
                    color,
                    className
                )}
                {...props}
            >
                {initials}
            </div>
        )
    }
)
Avatar.displayName = 'Avatar'

export { Avatar }
