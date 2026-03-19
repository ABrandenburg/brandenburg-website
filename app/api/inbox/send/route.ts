import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendMessage } from '@/lib/messaging/send';
import { createClient as createAdminClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('Supabase credentials not configured');
    return createAdminClient(url, key);
}

/**
 * Send a staff message from the inbox UI
 * Disables AI for the conversation (staff takeover)
 */
export async function POST(request: NextRequest) {
    // Verify auth
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { conversationId, customerId, phoneE164, body } = await request.json();

        if (!conversationId || !customerId || !phoneE164 || !body) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Disable AI for this conversation (staff takeover)
        const adminSupabase = getSupabaseAdmin();
        await adminSupabase
            .from('conversations')
            .update({
                ai_enabled: false,
                assigned_to: user.email,
            })
            .eq('id', conversationId);

        // Send the message
        const result = await sendMessage({
            to: phoneE164,
            body,
            conversationId,
            customerId,
            sender: 'staff',
            isUrgent: true,
        });

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Inbox send error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
