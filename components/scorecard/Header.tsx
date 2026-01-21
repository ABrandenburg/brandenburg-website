'use client';

import { TimeFilter } from './TimeFilter';
import { cn } from '@/lib/utils';

interface HeaderProps {
    title: string;
    description?: string;
    showTimeFilter?: boolean;
    actions?: React.ReactNode;
    className?: string;
}

export function Header({
    title,
    description,
    showTimeFilter = true,
    actions,
    className,
}: HeaderProps) {
    return (
        <div className={cn('flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6', className)}>
            <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
                    {title}
                </h1>
                {description && (
                    <p className="text-slate-500 mt-1">
                        {description}
                    </p>
                )}
            </div>
            <div className="flex items-center gap-4">
                {showTimeFilter && <TimeFilter />}
                {actions}
            </div>
        </div>
    );
}
