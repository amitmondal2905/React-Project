'use client'

import LeaveRequestForm from '@/components/leave/LeaveRequestForm'
import { useUserRole } from '@/hooks/useUserRole'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NewLeaveRequestPage() {
    const { data: userProfile, isLoading } = useUserRole()
    const isAdmin = userProfile?.role === 'Admin'

    if (isLoading) return <div className="p-8">Loading...</div>

    if (isAdmin) {
        return (
            <div className="p-8 text-center bg-[#1e1e24] rounded-xl shadow-xl border border-gray-800 mt-8 mx-auto max-w-lg">
                <h1 className="text-2xl font-bold text-red-500 mb-4">Access Restricted</h1>
                <p className="text-gray-400 mb-6">Administrators cannot submit leave requests.</p>
                <Link href="/dashboard/leave" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                    &larr; Back to Leave Dashboard
                </Link>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto py-8">
            <Link href="/dashboard/leave" className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-white mb-6">New Leave Request</h1>
            <div className="bg-[#1e1e24] rounded-xl shadow-xl border border-gray-800 p-6 overflow-hidden">
                <LeaveRequestForm />
            </div>
        </div>
    )
}
