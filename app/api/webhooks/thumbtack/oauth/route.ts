import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('Supabase credentials not configured');
    return createClient(url, key);
}

/**
 * Thumbtack OAuth2 callback — exchanges code for access token
 */
export async function GET(request: NextRequest) {
    const code = request.nextUrl.searchParams.get('code');
    const state = request.nextUrl.searchParams.get('state');
    const error = request.nextUrl.searchParams.get('error');

    if (error) {
        console.error('Thumbtack OAuth error:', error);
        return NextResponse.json({ error: 'OAuth authorization denied' }, { status: 400 });
    }

    if (!code) {
        return NextResponse.json({ error: 'No authorization code' }, { status: 400 });
    }

    const clientId = process.env.TT_CLIENT_ID;
    const clientSecret = process.env.TT_CLIENT_SECRET;
    const redirectUri = process.env.TT_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
        return NextResponse.json({ error: 'Thumbtack OAuth not configured' }, { status: 500 });
    }

    try {
        // Exchange code for token
        const tokenResponse = await fetch('https://api.thumbtack.com/v2/oauth2/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                redirect_uri: redirectUri,
                client_id: clientId,
                client_secret: clientSecret,
            }),
        });

        if (!tokenResponse.ok) {
            const errText = await tokenResponse.text();
            console.error('Thumbtack token exchange failed:', errText);
            return NextResponse.json({ error: 'Token exchange failed' }, { status: 500 });
        }

        const tokenData = await tokenResponse.json();

        // Store/update token in DB
        const supabase = getSupabaseAdmin();
        const expiresAt = tokenData.expires_in
            ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
            : null;

        await supabase
            .from('oauth_tokens')
            .upsert({
                provider: 'thumbtack',
                access_token: tokenData.access_token,
                refresh_token: tokenData.refresh_token || null,
                token_type: tokenData.token_type || 'Bearer',
                expires_at: expiresAt,
                scopes: tokenData.scope || null,
                updated_at: new Date().toISOString(),
            }, {
                onConflict: 'provider',
            });

        console.log('Thumbtack OAuth token stored successfully');

        // Redirect back to admin
        return NextResponse.redirect(new URL('/admin/inbox?tt_oauth=success', request.url));
    } catch (err: any) {
        console.error('Thumbtack OAuth error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
