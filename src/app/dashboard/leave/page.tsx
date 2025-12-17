'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import { LeaveRequest } from '@/types/leave'
import Link from 'next/link'
import { Plus, Check, X, Loader2 } from 'lucide-react'
import LeaveCalendar from '@/components/leave/LeaveCalendar'
import { useUserRole } from '@/hooks/useUserRole'
import { sendEmail } from '@/lib/emailService'
import { toast } from 'react-hot-toast'

export default function LeaveDashboardPage() {
    const queryClient = useQueryClient()
    const { data: userProfile } = useUserRole()
    const isAdmin = userProfile?.role === 'Admin'

    // Fetch pending requests for Admins
    const { data: pendingRequests, isLoading } = useQuery({
        queryKey: ['leave_requests', 'pending'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('leave_requests')
                .select('*, employees(first_name, last_name, email)') // Added email
                .eq('status', 'Pending')
                .order('created_at', { ascending: false })

            if (error) throw error
            return data as LeaveRequest[]
        },
        enabled: isAdmin === true // Only fetch if admin
    })

    const updateStatusMutation = useMutation({
        mutationFn: async ({ request }: { request: LeaveRequest & { employees: { email: string } } }) => {
            const status = 'Approved' // We are handling Approval explicitly here for deduction logic

            // 1. Update Status
            const { error: updateError } = await supabase
                .from('leave_requests')
                .update({ status })
                .eq('id', request.id)

            if (updateError) throw updateError

            // 2. Calculate Duration
            const start = new Date(request.start_date)
            const end = new Date(request.end_date)
            // Time difference in milliseconds
            const timeDiff = end.getTime() - start.getTime()
            // Convert to days (add 1 to include start date)
            const days = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1

            // 3. Deduct from Balance (only if approving)
            if (status === 'Approved') {
                const column = request.leave_type === 'Sick' ? 'sick_leave_balance' : 'annual_leave_balance'

                // Get current balance first to be safe, or just atomic decrement?
                // Atomic decrement with rpc is best, but direct SQL is:
                // update employees set balance = balance - days where id = emp_id

                // Supabase doesn't support 'balance - days' in simple JS client update without rpc usually, 
                // unless we fetch first. Let's fetch current to be safe.
                const { data: emp, error: fetchErr } = await supabase
                    .from('employees')
                    .select(column)
                    .eq('id', request.employee_id)
                    .single()

                if (fetchErr) throw fetchErr

                const currentBalance = emp[column as keyof typeof emp] || 0
                const newBalance = currentBalance - days

                const { error: deductError } = await supabase
                    .from('employees')
                    .update({ [column]: newBalance })
                    .eq('id', request.employee_id)

                if (deductError) throw deductError
            }

            // Simulate sending email
            await sendEmail({
                to: request.employees?.email || 'test@example.com',
                subject: `Leave Request ${status}`,
                body: `Your leave request has been ${status}.`
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leave_requests'] })
            queryClient.invalidateQueries({ queryKey: ['leaves'] })
            queryClient.invalidateQueries({ queryKey: ['userRole'] }) // Refresh balance
            toast.success('Request approved and balance deducted')
        },
        onError: (err) => {
            toast.error('Failed to update status')
            console.error(err)
        }
    })

    // Separate mutation for rejection (no deduction)
    const rejectMutation = useMutation({
        mutationFn: async ({ request }: { request: LeaveRequest & { employees: { email: string } } }) => {
            const { error } = await supabase
                .from('leave_requests')
                .update({ status: 'Rejected' })
                .eq('id', request.id)

            if (error) throw error

            await sendEmail({
                to: request.employees?.email || 'test@example.com',
                subject: 'Leave Request Rejected',
                body: 'Your leave request has been Rejected.'
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leave_requests'] })
            toast.success('Request rejected')
        }
    })

    return (
        <div className="p-8 bg-[#13131a] min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white">Leave Management</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Calendar Section */}
                    <div>
                        <h2 className="text-lg font-medium text-white mb-4">Leave Calendar</h2>
                        <LeaveCalendar />
                    </div>

                    {/* Pending Requests (Admin Only) */}
                    {isAdmin && (
                        <div className="bg-[#1e1e24] shadow-xl border border-gray-800 sm:rounded-xl overflow-hidden">
                            <div className="px-6 py-5 sm:px-6 border-b border-gray-800 bg-[#26262e]">
                                <h3 className="text-lg leading-6 font-medium text-white">
                                    Pending Approvals
                                </h3>
                            </div>
                            {isLoading ? (
                                <div className="p-4 flex justify-center"><Loader2 className="animate-spin h-6 w-6 text-indigo-500" /></div>
                            ) : (
                                <ul className="divide-y divide-gray-800">
                                    {pendingRequests?.map((request) => (
                                        <li key={request.id} className="px-6 py-4 hover:bg-[#2d2d35] transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-indigo-400 truncate">
                                                        {request.employees?.first_name} {request.employees?.last_name}
                                                    </p>
                                                    <p className="flex items-center text-sm text-gray-400 mt-1">
                                                        {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                                                    </p>
                                                    <p className="text-sm text-gray-500 italic mt-0.5">{request.reason}</p>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => updateStatusMutation.mutate({ request: request as any })}
                                                        className="inline-flex items-center p-2 border border-transparent rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none transition-colors"
                                                        title="Approve"
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => rejectMutation.mutate({ request: request as any })}
                                                        className="inline-flex items-center p-2 border border-transparent rounded-lg shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none transition-colors"
                                                        title="Reject"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                    {pendingRequests?.length === 0 && (
                                        <li className="px-6 py-8 text-center text-gray-500 text-sm italic">No pending requests.</li>
                                    )}
                                </ul>
                            )}
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {!isAdmin && (
                        <div className="bg-[#1e1e24] p-6 rounded-xl shadow-xl border border-gray-800">
                            <h2 className="text-lg font-medium text-white mb-6">My Leave Balance</h2>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-3 bg-[#2d2d35] rounded-lg border border-gray-700">
                                    <span className="text-gray-300">Annual Leave</span>
                                    <span className="font-bold text-green-400">{userProfile?.annual_leave_balance ?? 12} Days</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-[#2d2d35] rounded-lg border border-gray-700">
                                    <span className="text-gray-300">Sick Leave</span>
                                    <span className="font-bold text-blue-400">{userProfile?.sick_leave_balance ?? 8} Days</span>
                                </div>
                                <div className="pt-4 mt-2">
                                    <Link
                                        href="/dashboard/leave/new"
                                        className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                                    >
                                        <Plus className="h-5 w-5 mr-2" />
                                        New Leave Request
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-[#1e1e24] p-6 rounded-xl shadow-xl border border-gray-800">
                        <div className="text-center py-2">
                            <Link href="/dashboard/leave/history" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium block transition-colors">
                                View {isAdmin ? 'All Request History' : 'Request History'} &rarr;
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
