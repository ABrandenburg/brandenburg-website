'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ScorecardContent, ScorecardSkeleton } from '@/components/scorecard';

function DisplayScorecardContent() {
    const searchParams = useSearchParams();
    const autoFullscreen = searchParams.get('autoFullscreen') === 'true';

    return (
        <div className="p-6">
            <ScorecardContent autoFullscreen={autoFullscreen} />
        </div>
    );
}

export default function DisplayScorecardPage() {
    return (
        <Suspense fallback={<div className="p-6"><ScorecardSkeleton /></div>}>
            <DisplayScorecardContent />
        </Suspense>
    );
}
