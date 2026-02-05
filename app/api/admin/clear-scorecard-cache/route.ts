// API endpoint to clear scorecard cache and force fresh data
// POST /api/admin/clear-scorecard-cache

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
    try {
        // Check authentication
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get Supabase admin client for cache operations
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !serviceRoleKey) {
            return NextResponse.json({ error: 'Cache not configured' }, { status: 500 });
        }

        const { createClient: createAdminClient } = await import('@supabase/supabase-js');
        const adminClient = createAdminClient(supabaseUrl, serviceRoleKey, {
            auth: { persistSession: false },
        });

        // Clear all cache tables
        const tables = ['rankings_cache', 'technician_period_cache', 'leads_cache'];
        const results: Record<string, string> = {};

        for (const table of tables) {
            try {
                const { error } = await adminClient
                    .from(table)
                    .delete()
                    .neq('cache_key', ''); // Delete all rows

                if (error) {
                    results[table] = `Error: ${error.message}`;
                } else {
                    results[table] = 'Cleared';
                }
            } catch (err) {
                results[table] = `Error: ${err instanceof Error ? err.message : 'Unknown'}`;
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Cache cleared. Reload the scorecard to fetch fresh data.',
            results,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Clear cache error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
