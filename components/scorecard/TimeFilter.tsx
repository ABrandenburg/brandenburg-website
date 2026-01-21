'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const periods = [
    { days: 7, label: '7 Days' },
    { days: 30, label: '30 Days' },
    { days: 90, label: '90 Days' },
    { days: 365, label: '1 Year' },
];

interface TimeFilterProps {
    className?: string;
}

export function TimeFilter({ className }: TimeFilterProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const currentDays = searchParams.get('days') || '7';

    const handleChange = (newDays: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('days', newDays.toString());
        router.push(`?${params.toString()}`);
    };

    return (
        <div className={cn('flex gap-2', className)}>
            {periods.map((period) => (
                <button
                    key={period.days}
                    onClick={() => handleChange(period.days)}
                    className={cn(
                        'px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                        currentDays === period.days.toString()
                            ? 'bg-brand-blue text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    )}
                >
                    {period.label}
                </button>
            ))}
        </div>
    );
}
