'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { useUserRole } from '@/hooks/useUserRole'
import {
    LayoutDashboard,
    Users,
    Calendar,
    Briefcase,
    FileText,
    LogOut,
    Menu,
    X,
    CalendarDays,
    FolderOpen,
    Clock,
    Bell
} from 'lucide-react'
import { useState } from 'react'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const router = useRouter()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const { data: userProfile } = useUserRole()

    const isAdmin = userProfile?.role === 'Admin'

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, adminOnly: false },
        { name: 'Employees', href: '/dashboard/employees', icon: Users, adminOnly: true },
        { name: 'Attendance', href: '/dashboard/attendance', icon: Clock, adminOnly: false },
        { name: 'Leave Management', href: '/dashboard/leave', icon: Calendar, adminOnly: false },
        { name: 'Projects', href: '/dashboard/projects', icon: FolderOpen, adminOnly: false },
        { name: 'Holidays', href: '/dashboard/holidays', icon: CalendarDays, adminOnly: false },
        { name: 'Job Openings', href: '/dashboard/recruitment/jobs', icon: Briefcase, adminOnly: true },
        { name: 'Applications', href: '/dashboard/recruitment/applications', icon: FileText, adminOnly: true },
        { name: 'Notifications', href: '/dashboard/notifications', icon: Bell, adminOnly: true },
    ].filter(item => !item.adminOnly || isAdmin)

    const handleLogout = async () => {
        await supabase.auth.signOut()
        // Use window.location.href to force a full page reload and clear cache
        window.location.href = '/login'
    }

    return (
        <div className="min-h-screen bg-[#13131a]">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-gray-900 bg-opacity-75 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#1e1e24] shadow-xl transform transition-transform duration-300 ease-in-out md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} border-r border-gray-800`}>
                <div className="flex items-center justify-between h-16 px-6 border-b border-gray-800">
                    <span className="text-xl font-bold text-white">HR Dashboard</span>
                    <button onClick={() => setSidebarOpen(false)} className="md:hidden">
                        <X className="h-6 w-6 text-gray-400" />
                    </button>
                </div>
                <nav className="mt-6 px-4 space-y-2">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ${isActive
                                    ? 'bg-[#2d2d35] text-indigo-400'
                                    : 'text-gray-400 hover:bg-[#2d2d35] hover:text-white'
                                    }`}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-indigo-400' : 'text-gray-500'}`} />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>
                <div className="absolute bottom-0 w-full p-4 border-t border-gray-800">
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-400 rounded-lg hover:bg-[#2d2d35] transition-colors duration-150"
                    >
                        <LogOut className="mr-3 h-5 w-5" />
                        Sign Out
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="md:pl-64 flex flex-col min-h-screen text-white">
                {/* Top Header (Mobile only mostly) */}
                <header className="bg-[#1e1e24] shadow-sm md:hidden border-b border-gray-800">
                    <div className="flex items-center justify-between h-16 px-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="text-gray-400 hover:text-white focus:outline-none"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                        <span className="text-lg font-semibold text-white">HR Dashboard</span>
                        <div className="w-6"></div> {/* Spacer for centering */}
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1">
                    {children}
                </main>
            </div>
        </div>
    )
}
