
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ALLOWED_DOMAIN = 'brandenburgplumbing.com'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/admin'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        
        if (!error) {
            // Get the user to validate their email domain
            const { data: { user } } = await supabase.auth.getUser()
            
            // Validate email domain - only allow @brandenburgplumbing.com
            if (user?.email && !user.email.endsWith(`@${ALLOWED_DOMAIN}`)) {
                // Sign out the user immediately - they don't have access
                await supabase.auth.signOut()
                
                // Redirect to login with domain error
                const forwardedHost = request.headers.get('x-forwarded-host')
                const isLocalEnv = process.env.NODE_ENV === 'development'
                
                if (isLocalEnv) {
                    return NextResponse.redirect(`${origin}/admin/login?error=domain`)
                } else if (forwardedHost) {
                    return NextResponse.redirect(`https://${forwardedHost}/admin/login?error=domain`)
                } else {
                    return NextResponse.redirect(`${origin}/admin/login?error=domain`)
                }
            }
            
            // Email domain is valid, proceed with redirect
            const forwardedHost = request.headers.get('x-forwarded-host')
            const isLocalEnv = process.env.NODE_ENV === 'development'
            
            if (isLocalEnv) {
                return NextResponse.redirect(`${origin}${next}`)
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${next}`)
            } else {
                return NextResponse.redirect(`${origin}${next}`)
            }
        }
    }

    // Return the user to login page with auth error
    return NextResponse.redirect(`${origin}/admin/login?error=auth`)
}
