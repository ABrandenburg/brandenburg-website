import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendStaffAlert } from '@/lib/notifications/staff-alerts';

function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('Supabase credentials not configured');
    return createClient(url, key);
}

/**
 * Daily digest — sends summary SMS to admin at 2pm CT
 */
export async function GET(request: NextRequest) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const today = new Date().toISOString().split('T')[0];
    const todayStart = `${today}T00:00:00.000Z`;

    try {
        // Count today's metrics
        const [
            { count: newLeads },
            { count: aiBookings },
            { count: messagesSent },
            { count: messagesReceived },
            { count: failedMessages },
        ] = await Promise.all([
            supabase.from('conversations').select('*', { count: 'exact', head: true })
                .gte('created_at', todayStart),
            supabase.from('conversations').select('*', { count: 'exact', head: true })
                .eq('status', 'booked').gte('updated_at', todayStart),
            supabase.from('messages').select('*', { count: 'exact', head: true })
                .eq('direction', 'outbound').gte('created_at', todayStart),
            supabase.from('messages').select('*', { count: 'exact', head: true })
                .eq('direction', 'inbound').gte('created_at', todayStart),
            supabase.from('messages').select('*', { count: 'exact', head: true })
                .eq('delivery_status', 'failed').gte('created_at', todayStart),
        ]);

        const digestBody = [
            `New leads: ${newLeads || 0}`,
            `AI bookings: ${aiBookings || 0}`,
            `Messages sent: ${messagesSent || 0}`,
            `Messages received: ${messagesReceived || 0}`,
            `Failed messages: ${failedMessages || 0}`,
        ].join('\n');

        // Store daily metrics
        const metrics = [
            { date: today, metric_name: 'new_leads', metric_value: newLeads || 0 },
            { date: today, metric_name: 'ai_bookings', metric_value: aiBookings || 0 },
            { date: today, metric_name: 'messages_sent', metric_value: messagesSent || 0 },
            { date: today, metric_name: 'messages_received', metric_value: messagesReceived || 0 },
            { date: today, metric_name: 'failed_messages', metric_value: failedMessages || 0 },
        ];

        for (const m of metrics) {
            await supabase
                .from('system_metrics')
                .upsert(m, { onConflict: 'date,metric_name' });
        }

        // Send digest SMS
        await sendStaffAlert({
            type: 'daily_digest',
            title: `Daily Digest - ${today}`,
            body: digestBody,
        });

        return NextResponse.json({ sent: true, digest: digestBody });
    } catch (error: any) {
        console.error('Daily digest error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
