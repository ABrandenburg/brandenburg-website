'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { LogOut, LayoutDashboard, FileText, Settings, BookOpen, ChevronLeft, ChevronRight, ChevronDown, BarChart3, Calculator } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
    userEmail: string | undefined
    signOutAction: () => Promise<void>
}

export function Sidebar({ userEmail, signOutAction }: SidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [isToolsOpen, setIsToolsOpen] = useState(true)
    const pathname = usePathname()

    const isToolsActive = pathname.startsWith('/admin/tools')

    return (
        <aside
            className={cn(
                "bg-slate-900 text-white hidden md:flex flex-col transition-all duration-300 ease-in-out relative",
                isCollapsed ? "w-20" : "w-64"
            )}
        >
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-6 bg-slate-800 text-slate-300 rounded-full p-1 border border-slate-700 hover:bg-slate-700 hover:text-white transition-colors"
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
                {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>

            <div className="p-6 border-b border-slate-800 flex flex-col items-center overflow-hidden">
                <div className={cn(
                    "bg-white p-2 rounded flex justify-center mb-4 transition-all duration-300",
                    isCollapsed ? "w-10 h-10 p-1" : "w-full"
                )}>
                    {isCollapsed ? (
                        <Image
                            src="/images/favicon.png"
                            alt="BP"
                            width={32}
                            height={32}
                            className="h-full w-auto object-contain"
                            priority
                        />
                    ) : (
                        <Image
                            src="/images/logo.png"
                            alt="Brandenburg Plumbing"
                            width={160}
                            height={40}
                            className="h-8 w-auto"
                            priority
                        />
                    )}
                </div>
                {!isCollapsed && (
                    <p className="text-xs text-slate-400 truncate w-full text-center fade-in">{userEmail}</p>
                )}
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-hidden overflow-y-auto">
                <NavItem href="/admin" icon={LayoutDashboard} label="Dashboard" isCollapsed={isCollapsed} isActive={pathname === '/admin'} />
                <NavItem href="/admin/submissions" icon={FileText} label="Submissions" isCollapsed={isCollapsed} isActive={pathname.startsWith('/admin/submissions')} />

                {/* Tools with sub-navigation */}
                <div>
                    <button
                        onClick={() => !isCollapsed && setIsToolsOpen(!isToolsOpen)}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2 w-full text-left rounded-md transition-colors",
                            isToolsActive
                                ? "text-white bg-slate-800"
                                : "text-slate-300 hover:text-white hover:bg-slate-800",
                            isCollapsed && "justify-center px-2"
                        )}
                        title={isCollapsed ? "Tools & Automations" : undefined}
                    >
                        <Settings className="w-5 h-5 flex-shrink-0" />
                        {!isCollapsed && (
                            <>
                                <span className="flex-1 whitespace-nowrap">Tools & Automations</span>
                                <ChevronDown className={cn(
                                    "w-4 h-4 transition-transform",
                                    isToolsOpen && "rotate-180"
                                )} />
                            </>
                        )}
                    </button>

                    {!isCollapsed && isToolsOpen && (
                        <div className="ml-4 mt-1 space-y-1 border-l border-slate-700 pl-3">
                            <SubNavItem
                                href="/admin/tools"
                                icon={Calculator}
                                label="Discount Calculator"
                                isActive={pathname === '/admin/tools'}
                            />
                            <SubNavItem
                                href="/admin/tools/scorecard"
                                icon={BarChart3}
                                label="Scorecard"
                                isActive={pathname === '/admin/tools/scorecard'}
                            />
                        </div>
                    )}
                </div>

                <NavItem href="/admin/training" icon={BookOpen} label="Training" isCollapsed={isCollapsed} isActive={pathname.startsWith('/admin/training')} />
            </nav>

            <div className="p-4 border-t border-slate-800 overflow-hidden">
                <form action={signOutAction}>
                    <button
                        type="submit"
                        className={cn(
                            "flex items-center gap-3 px-3 py-2 w-full text-left text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors",
                            isCollapsed && "justify-center px-2"
                        )}
                        title={isCollapsed ? "Sign Out" : undefined}
                    >
                        <LogOut className="w-5 h-5 flex-shrink-0" />
                        {!isCollapsed && <span>Sign Out</span>}
                    </button>
                </form>
            </div>
        </aside>
    )
}

function NavItem({ href, icon: Icon, label, isCollapsed, isActive }: {
    href: string;
    icon: any;
    label: string;
    isCollapsed: boolean;
    isActive: boolean;
}) {
    return (
        <Link
            href={href}
            className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                isActive
                    ? "text-white bg-slate-800"
                    : "text-slate-300 hover:text-white hover:bg-slate-800",
                isCollapsed && "justify-center px-2"
            )}
            title={isCollapsed ? label : undefined}
        >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="whitespace-nowrap">{label}</span>}
        </Link>
    )
}

function SubNavItem({ href, icon: Icon, label, isActive }: {
    href: string;
    icon: any;
    label: string;
    isActive: boolean;
}) {
    return (
        <Link
            href={href}
            className={cn(
                "flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors",
                isActive
                    ? "text-white bg-slate-800/50"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/30"
            )}
        >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="whitespace-nowrap">{label}</span>
        </Link>
    )
}

