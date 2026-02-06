// Temporary diagnostic endpoint to inspect Report 3624 fields
// DELETE THIS FILE after debugging is complete

import { NextResponse } from 'next/server';
import { fetchFieldConversionReport } from '@/lib/servicetitan/client';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET() {
    try {
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const data = await fetchFieldConversionReport(startDate, endDate);

        return NextResponse.json({
            report: 3624,
            name: 'Field Conversion Report',
            totalRows: data.length,
            fields: data.length > 0 ? Object.keys(data[0]) : [],
            sampleRows: data.slice(0, 3),
            dateRange: { startDate, endDate },
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
