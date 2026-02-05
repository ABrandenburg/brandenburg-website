'use client';

import { Suspense } from 'react';
import { ScorecardContent, ScorecardSkeleton } from '@/components/scorecard';

export default function ScorecardPage() {
    return (
        <Suspense fallback={<ScorecardSkeleton />}>
            <ScorecardContent />
        </Suspense>
    );
}
