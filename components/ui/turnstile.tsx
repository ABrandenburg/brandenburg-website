'use client'

import { useEffect, useRef, useCallback } from 'react'
import Script from 'next/script'

declare global {
  interface Window {
    turnstile: {
      render: (
        element: HTMLElement,
        options: {
          sitekey: string
          callback: (token: string) => void
          'error-callback': () => void
          'expired-callback': () => void
          theme?: 'light' | 'dark' | 'auto'
          size?: 'normal' | 'compact'
        }
      ) => string
      reset: (widgetId: string) => void
      remove: (widgetId: string) => void
    }
  }
}

interface TurnstileProps {
  onVerify: (token: string) => void
  onError?: () => void
  onExpire?: () => void
  theme?: 'light' | 'dark' | 'auto'
  size?: 'normal' | 'compact'
  className?: string
}

export function Turnstile({
  onVerify,
  onError,
  onExpire,
  theme = 'auto',
  size = 'normal',
  className = '',
}: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const scriptLoaded = useRef(false)

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  const renderWidget = useCallback(() => {
    if (!containerRef.current || !window.turnstile || !siteKey) return

    // Clear any existing widget
    if (widgetIdRef.current) {
      try {
        window.turnstile.remove(widgetIdRef.current)
      } catch (e) {
        // Widget may already be removed
      }
    }

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      callback: onVerify,
      'error-callback': () => {
        onError?.()
      },
      'expired-callback': () => {
        onExpire?.()
      },
      theme,
      size,
    })
  }, [siteKey, onVerify, onError, onExpire, theme, size])

  useEffect(() => {
    if (scriptLoaded.current && window.turnstile) {
      renderWidget()
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current)
        } catch (e) {
          // Widget may already be removed
        }
      }
    }
  }, [renderWidget])

  const handleScriptLoad = () => {
    scriptLoaded.current = true
    renderWidget()
  }

  if (!siteKey) {
    // In development without keys, show placeholder
    if (process.env.NODE_ENV === 'development') {
      return (
        <div className={`p-4 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800 ${className}`}>
          Turnstile disabled (no site key configured)
        </div>
      )
    }
    return null
  }

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        async
        defer
        onLoad={handleScriptLoad}
      />
      <div ref={containerRef} className={className} />
    </>
  )
}
