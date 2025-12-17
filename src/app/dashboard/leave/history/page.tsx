'use client'

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import { LeaveRequest } from '@/types/leave'
import { useUserRole } from '@/hooks/useUserRole'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'

export default function LeaveHistoryPage() {
    const { data: userProfile, isLoading: isUserLoading } = useUserRole()
    const isAdmin = userProfile?.role === 'Admin'

    const { data: requests, isLoading: isRequestsLoading, error } = useQuery({
        queryKey: ['leave_requests', 'history', userProfile?.id, isAdmin],
        queryFn: async () => {
            if (!userProfile?.id) return []

            let query = supabase
                .from('leave_requests')
                .select('*, employees(first_name, last_name)')
                .order('created_at', { ascending: false })

            // If not admin, only show own requests
            if (!isAdmin) {
                query = query.eq('employee_id', userProfile.id)
            }

            const { data, error } = await query

            if (error) throw error
            return data as LeaveRequest[]
        },
        enabled: !!userProfile?.id
    })

    if (isUserLoading || isRequestsLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-indigo-600" /></div>
    if (error) return <div className="p-8 text-red-500">Error loading history</div>

    return (
        <div className="p-8 bg-[#13131a] min-h-screen">
            <div className="mb-6">
                <Link href="/dashboard/leave" className="flex items-center text-gray-400 hover:text-white mb-4 transition-colors">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                </Link>
                <h1 className="text-2xl font-bold text-white">{isAdmin ? 'All Leave History' : 'My Leave History'}</h1>
            </div>

            <div className="bg-[#1e1e24] shadow-xl overflow-hidden sm:rounded-xl border border-gray-800">
                <table className="min-w-full divide-y divide-gray-800">
                    <thead className="bg-[#26262e]">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Employee</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Dates</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Reason</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Applied On</th>
                        </tr>
                    </thead>
                    <tbody className="bg-[#1e1e24] divide-y divide-gray-800">
                        {requests?.map((request) => (
                            <tr key={request.id} className="hover:bg-[#2d2d35] transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                    {request.employees?.first_name} {request.employees?.last_name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                    {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-400 max-w-xs truncate">
                                    {request.reason}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full border 
                                        ${request.status === 'Approved' ? 'bg-green-900/30 text-green-400 border-green-800' :
                                            request.status === 'Rejected' ? 'bg-red-900/30 text-red-400 border-red-800' :
                                                'bg-yellow-900/30 text-yellow-400 border-yellow-800'}`}>
                                        {request.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(request.created_at).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                        {requests?.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500 italic">No leave history found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
