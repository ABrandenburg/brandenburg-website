"use client"

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

export function DNILoader() {
    const pathname = usePathname()

    useEffect(() => {
        // ServiceTitan DNI re-scan trigger
        // triggers whenever the user navigates to a new route
        if (typeof window !== 'undefined' && (window as any).dni) {
            // use a small timeout to ensure DOM is updated
            setTimeout(() => {
                (window as any).dni('load')
            }, 500) // 500ms delay to be safe
        }
    }, [pathname])

    return null
}
