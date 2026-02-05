'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface AdminContextType {
    isFullscreenLocked: boolean
    setFullscreenLocked: (locked: boolean) => void
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export function AdminProvider({ children }: { children: ReactNode }) {
    const [isFullscreenLocked, setFullscreenLocked] = useState(false)

    return (
        <AdminContext.Provider value={{ isFullscreenLocked, setFullscreenLocked }}>
            {children}
        </AdminContext.Provider>
    )
}

export function useAdminContext() {
    const context = useContext(AdminContext)
    if (context === undefined) {
        throw new Error('useAdminContext must be used within an AdminProvider')
    }
    return context
}
