'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useQuery } from '@tanstack/react-query'
import { Employee } from '@/types/employee'
import { useUserRole } from '@/hooks/useUserRole'

export default function LeaveRequestForm() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const { data: userProfile } = useUserRole()
    const isAdmin = userProfile?.role === 'Admin'

    const [formData, setFormData] = useState({
        employee_id: '',
        leave_type: 'Annual',
        start_date: '',
        end_date: '',
        reason: '',
    })

    // Auto-set employee_id for non-admins
    useEffect(() => {
        if (!isAdmin && userProfile?.id) {
            setFormData(prev => ({ ...prev, employee_id: userProfile.id }))
        }
    }, [isAdmin, userProfile])

    // Fetch employees for the dropdown
    const { data: employees } = useQuery({
        queryKey: ['employees'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('employees')
                .select('id, first_name, last_name, annual_leave_balance, sick_leave_balance')
            if (error) throw error
            return data as Pick<Employee, 'id' | 'first_name' | 'last_name' | 'annual_leave_balance' | 'sick_leave_balance'>[]
        },
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        // Date Validation
        const start = new Date(formData.start_date)
        const end = new Date(formData.end_date)

        if (start > end) {
            toast.error('End date cannot be before start date')
            setLoading(false)
            return
        }

        // Calculate Days
        const timeDiff = end.getTime() - start.getTime()
        const daysRequested = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1

        // Balance Validation
        let balance = 0
        let currentEmployee: Pick<Employee, 'id' | 'first_name' | 'last_name' | 'annual_leave_balance' | 'sick_leave_balance'> | Employee | null | undefined = null

        if (isAdmin) {
            currentEmployee = employees?.find(e => e.id === formData.employee_id)
        } else {
            currentEmployee = userProfile
        }

        if (currentEmployee) {
            if (formData.leave_type === 'Sick') {
                balance = currentEmployee.sick_leave_balance ?? 0
            } else if (formData.leave_type === 'Annual') {
                balance = currentEmployee.annual_leave_balance ?? 0
            } else {
                // Casual/Other - assuming no strict limit or different limit?
                // For now, let's treat them as unlimited or warn? 
                // User only specified Annual (12) and Sick (8).
                balance = 999
            }

            if (daysRequested > balance) {
                toast.error(`Insufficient ${formData.leave_type} leave balance. You have ${balance} days remaining, but requested ${daysRequested}.`)
                setLoading(false)
                return
            }
        }


        try {
            // Client-side overlap check (more reliable for now)
            const { data: userRequests, error: fetchError } = await supabase
                .from('leave_requests')
                .select('start_date, end_date')
                .eq('employee_id', formData.employee_id)
                .neq('status', 'Rejected')

            if (fetchError) throw fetchError

            const hasOverlap = userRequests?.some(req => {
                const reqStart = new Date(req.start_date)
                const reqEnd = new Date(req.end_date)
                const newStart = new Date(formData.start_date)
                const newEnd = new Date(formData.end_date)

                // Normalize time
                reqStart.setHours(0, 0, 0, 0)
                reqEnd.setHours(0, 0, 0, 0)
                newStart.setHours(0, 0, 0, 0)
                newEnd.setHours(0, 0, 0, 0)

                return (reqStart <= newEnd && reqEnd >= newStart)
            })

            if (hasOverlap) {
                toast.error('You already have a pending or approved leave request for this period.')
                setLoading(false)
                return
            }

            const { error } = await supabase
                .from('leave_requests')
                .insert([formData])

            if (error) throw error

            toast.success('Leave request submitted successfully')
            router.push('/dashboard/leave')
            router.refresh()
        } catch (error: any) {
            toast.error('Error submitting request: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {isAdmin && (
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Employee</label>
                    <select
                        name="employee_id"
                        required
                        className="block w-full text-white bg-[#2d2d35] border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                        onChange={handleChange}
                        value={formData.employee_id}
                    >
                        <option value="">Select Employee</option>
                        {employees?.map((emp) => (
                            <option key={emp.id} value={emp.id}>
                                {emp.first_name} {emp.last_name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Leave Type</label>
                    <select
                        name="leave_type"
                        required
                        className="block w-full text-white bg-[#2d2d35] border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                        onChange={handleChange}
                        value={formData.leave_type}
                    >
                        <option value="Annual">Annual Leave</option>
                        <option value="Sick">Sick Leave</option>
                        <option value="Casual">Casual Leave</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
                    <input
                        type="date"
                        name="start_date"
                        required
                        className="block w-full text-white bg-[#2d2d35] border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors [color-scheme:dark]"
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
                    <input
                        type="date"
                        name="end_date"
                        required
                        className="block w-full text-white bg-[#2d2d35] border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors [color-scheme:dark]"
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Reason</label>
                <textarea
                    name="reason"
                    rows={3}
                    className="block w-full text-white bg-[#2d2d35] border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                    onChange={handleChange}
                />
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-800">
                <button
                    type="submit"
                    disabled={loading}
                    className="ml-3 inline-flex justify-center py-2.5 px-6 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all"
                >
                    {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Submit Request'}
                </button>
            </div>
        </form>
    )
}
