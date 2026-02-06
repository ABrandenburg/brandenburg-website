// Temporary: inspect Report 257 (Memberships) fields
import { NextResponse } from 'next/server';
import { serviceTitanFetch } from '@/lib/servicetitan/client';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET() {
    try {
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const response = await serviceTitanFetch<{ fields?: any[]; data: any[] }>(
            `/reporting/v2/tenant/{tenantId}/report-category/technician-dashboard/reports/257/data`,
            {
                method: 'POST',
                body: JSON.stringify({
                    parameters: [
                        { name: 'From', value: startDate },
                        { name: 'To', value: endDate },
                    ],
                }),
            }
        );

        const rawData = response.data || [];
        let sampleRows = rawData.slice(0, 3);
        
        if (response.fields && rawData.length > 0 && Array.isArray(rawData[0])) {
            const fieldNames = response.fields.map((f: any) => f.name);
            sampleRows = rawData.slice(0, 3).map((row: any[]) => {
                const obj: Record<string, any> = {};
                fieldNames.forEach((name: string, index: number) => { obj[name] = row[index]; });
                return obj;
            });
        }

        return NextResponse.json({
            report: 257,
            name: 'Memberships (technician-dashboard)',
            totalRows: rawData.length,
            fields: response.fields || (rawData.length > 0 ? Object.keys(sampleRows[0]) : []),
            sampleRows,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
