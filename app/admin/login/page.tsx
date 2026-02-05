'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'

import Image from 'next/image'

export default function LoginPage() {
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [isError, setIsError] = useState(false)
    const searchParams = useSearchParams()
    
    // Create Supabase client with error handling
    const [supabase, setSupabase] = useState<ReturnType<typeof createClient> | null>(null)
    const [initError, setInitError] = useState<string | null>(null)
    
    useEffect(() => {
        // Check if environment variables are available (for debugging)
        const hasUrl = typeof window !== 'undefined' && process.env.NEXT_PUBLIC_SUPABASE_URL
        const hasKey = typeof window !== 'undefined' && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        
        if (!hasUrl || !hasKey) {
            const missing = []
            if (!hasUrl) missing.push('NEXT_PUBLIC_SUPABASE_URL')
            if (!hasKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')
            const errorMsg = `Missing environment variables: ${missing.join(', ')}. Please add them to your .env.local file and restart the dev server.`
            setInitError(errorMsg)
            setIsError(true)
            console.error('Missing Supabase env vars:', missing)
            return
        }
        
        try {
            const client = createClient()
            setSupabase(client)
            setInitError(null)
            console.log('Supabase client initialized successfully')
        } catch (error) {
            console.error('Failed to create Supabase client:', error)
            const errorMessage = error instanceof Error 
                ? error.message 
                : 'Failed to initialize authentication. Please check your environment variables and restart the dev server.'
            setInitError(errorMessage)
            setIsError(true)
        }
    }, [])

    // Check for error messages from URL params
    useEffect(() => {
        const error = searchParams.get('error')
        
        if (error === 'auth') {
            setMessage('Authentication failed. Please try again.')
            setIsError(true)
        } else if (error === 'domain') {
            setMessage('Access restricted to @brandenburgplumbing.com email addresses only.')
            setIsError(true)
        }
    }, [searchParams])

    // Ensure light mode is applied
    useEffect(() => {
        document.documentElement.classList.remove('dark')
        document.body.classList.remove('dark')
        document.documentElement.style.colorScheme = 'light'
    }, [])

    const handleGoogleSignIn = async () => {
        if (!supabase) {
            setMessage('Authentication is not ready. Please refresh the page.')
            setIsError(true)
            return
        }

        setLoading(true)
        setMessage('')
        setIsError(false)

        // Get the intended destination from URL params, default to /admin
        const next = searchParams.get('next') || '/admin'

        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
                    queryParams: {
                        hd: 'brandenburgplumbing.com', // Hint to Google to show only this domain
                    },
                },
            })

            if (error) {
                console.error('Google sign-in error:', error)
                setMessage(error.message || 'Failed to sign in with Google')
                setIsError(true)
                setLoading(false)
            }
            // If successful, the user will be redirected to Google, then back to /auth/callback
        } catch (err) {
            console.error('Unexpected Google sign-in error:', err)
            setMessage('An unexpected error occurred. Please try again.')
            setIsError(true)
            setLoading(false)
        }
    }

    return (
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
                    html, body {
                        background-color: #ffffff !important;
                        color-scheme: light !important;
                    }
                `
            }} />
            <div className="flex bg-white min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans" style={{ backgroundColor: '#ffffff' }}>
                <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-sm border border-slate-200" style={{ backgroundColor: '#ffffff' }}>
                    <div className="flex flex-col items-center">
                        <Image
                            src="/images/Brandenburg Logo_Dark_Red Mark-01.png"
                            alt="Brandenburg Plumbing"
                            width={200}
                            height={50}
                            className="h-12 w-auto mb-6"
                            priority
                        />
                        <h2 className="text-center text-2xl font-semibold tracking-tight text-slate-900 font-sans">
                            Admin Access
                        </h2>
                        <p className="mt-2 text-center text-sm text-slate-600 font-sans">
                            Sign in with your Brandenburg Plumbing Google account
                        </p>
                    </div>

                    {(message || initError) && (
                        <div className={`rounded-md p-4 ${(isError || initError) ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'}`}>
                            <div className={`text-sm ${(isError || initError) ? 'text-red-800' : 'text-blue-800'}`}>
                                {initError || message}
                            </div>
                        </div>
                    )}

                    <div className="mt-8">
                        <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            disabled={!supabase || loading}
                            className="group relative flex w-full justify-center items-center gap-3 rounded-lg border border-gray-300 bg-white py-3 px-4 text-base font-semibold text-gray-700 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900 disabled:opacity-70 disabled:cursor-not-allowed transition-colors font-sans"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : !supabase ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Loading...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path
                                            fill="#4285F4"
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        />
                                        <path
                                            fill="#34A853"
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        />
                                        <path
                                            fill="#FBBC05"
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        />
                                        <path
                                            fill="#EA4335"
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        />
                                    </svg>
                                    Sign in with Google
                                </>
                            )}
                        </button>
                    </div>

                    <p className="mt-6 text-center text-xs text-slate-500 font-sans">
                        Only @brandenburgplumbing.com accounts can access this area
                    </p>
                </div>
            </div>
        </>
    )
}
