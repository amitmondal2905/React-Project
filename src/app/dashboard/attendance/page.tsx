'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import { useUserRole } from '@/hooks/useUserRole'
import { Loader2, LogIn, LogOut, Coffee } from 'lucide-react'
import { format, differenceInMinutes } from 'date-fns'
import toast from 'react-hot-toast'

type AttendanceRecord = {
    id: string
    employee_id: string
    date: string
    check_in: string | null
    check_out: string | null
    break_duration: number
    status: string
    notes: string | null
    employees?: {
        first_name: string
        last_name: string
        email: string
    }
}

export default function AttendancePage() {
    const queryClient = useQueryClient()
    const { data: userProfile } = useUserRole()
    const [currentTime, setCurrentTime] = useState(new Date())
    const [breakMinutes, setBreakMinutes] = useState(30)

    const isAdmin = userProfile?.role === 'Admin'

    // Update current time every second
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    // Fetch attendance records
    const { data: attendanceRecords, isLoading } = useQuery({
        queryKey: ['attendance', isAdmin],
        queryFn: async () => {
            let query = supabase
                .from('attendance')
                .select('*, employees(first_name, last_name, email)')
                .order('date', { ascending: false })

            if (!isAdmin && userProfile?.id) {
                query = query.eq('employee_id', userProfile.id)
            }

            const { data, error } = await query.limit(30)

            if (error) throw error
            return data as AttendanceRecord[]
        },
        enabled: !!userProfile,
    })

    // Get today's attendance for current user
    const todayAttendance = attendanceRecords?.find(
        record => record.employee_id === userProfile?.id && record.date === format(new Date(), 'yyyy-MM-dd')
    )

    // Check in mutation
    const checkInMutation = useMutation({
        mutationFn: async () => {
            const today = format(new Date(), 'yyyy-MM-dd')
            const now = new Date().toISOString()

            const { error } = await supabase.from('attendance').insert([{
                employee_id: userProfile?.id,
                date: today,
                check_in: now,
                status: 'Present'
            }])

            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attendance'] })
            toast.success('Checked in successfully!')
        },
        onError: (error: any) => {
            toast.error('Error checking in: ' + error.message)
        },
    })

    // Check out mutation
    const checkOutMutation = useMutation({
        mutationFn: async () => {
            if (!todayAttendance) return

            const now = new Date().toISOString()

            const { error } = await supabase
                .from('attendance')
                .update({
                    check_out: now,
                    break_duration: breakMinutes
                })
                .eq('id', todayAttendance.id)

            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attendance'] })
            toast.success('Checked out successfully!')
        },
        onError: (error: any) => {
            toast.error('Error checking out: ' + error.message)
        },
    })

    const calculateWorkingHours = (checkIn: string | null, checkOut: string | null, breakDuration: number) => {
        if (!checkIn || !checkOut) return 'N/A'

        const totalMinutes = differenceInMinutes(new Date(checkOut), new Date(checkIn)) - breakDuration
        const hours = Math.floor(totalMinutes / 60)
        const minutes = totalMinutes % 60

        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} Hrs`
    }

    const getStatusBadge = (checkIn: string | null, status: string) => {
        if (!checkIn) return { text: 'Absent', class: 'bg-gray-700/50 text-gray-400' }

        const checkInTime = new Date(checkIn)
        const hours = checkInTime.getHours()
        const minutes = checkInTime.getMinutes()

        // Late if check-in after 10:00 AM
        if (hours > 10 || (hours === 10 && minutes > 0)) {
            return { text: 'Late', class: 'bg-red-900/30 text-red-400' }
        }

        return { text: 'On Time', class: 'bg-green-900/30 text-green-400' }
    }

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-indigo-600" /></div>
    }

    return (
        <div className="max-w-7xl mx-auto py-8 px-4">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white">
                    {isAdmin ? 'Employee Attendance' : 'My Attendance'}
                </h1>
                <p className="text-gray-400 mt-1">
                    {isAdmin ? 'View all employee attendance records' : 'Track your daily attendance'}
                </p>
            </div>

            {/* Check In/Out Card - Only for Employees */}
            {!isAdmin && (
                <div className="bg-[#1e1e24] border border-gray-800 rounded-xl p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Current Time */}
                        <div>
                            <h2 className="text-lg font-semibold text-white mb-4">Current Time</h2>
                            <div className="text-3xl font-bold text-indigo-400">
                                {format(currentTime, 'hh:mm:ss a')}
                            </div>
                            <div className="text-sm text-gray-400 mt-1">
                                {format(currentTime, 'EEEE, MMMM dd, yyyy')}
                            </div>
                        </div>

                        {/* Check In/Out Buttons */}
                        <div className="flex flex-col gap-4">
                            {!todayAttendance ? (
                                <button
                                    onClick={() => checkInMutation.mutate()}
                                    disabled={checkInMutation.isPending}
                                    className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                                >
                                    <LogIn className="h-5 w-5" />
                                    {checkInMutation.isPending ? 'Checking In...' : 'Check In'}
                                </button>
                            ) : !todayAttendance.check_out ? (
                                <>
                                    <div className="text-sm text-gray-400">
                                        Checked in at: <span className="text-white font-medium">{format(new Date(todayAttendance.check_in!), 'hh:mm a')}</span>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">
                                            <Coffee className="inline h-4 w-4 mr-1" />
                                            Break Duration (minutes)
                                        </label>
                                        <input
                                            type="number"
                                            value={breakMinutes}
                                            onChange={(e) => setBreakMinutes(parseInt(e.target.value) || 0)}
                                            className="w-full bg-[#2d2d35] border border-gray-700 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-indigo-500"
                                            min="0"
                                            max="120"
                                        />
                                    </div>
                                    <button
                                        onClick={() => checkOutMutation.mutate()}
                                        disabled={checkOutMutation.isPending}
                                        className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
                                    >
                                        <LogOut className="h-5 w-5" />
                                        {checkOutMutation.isPending ? 'Checking Out...' : 'Check Out'}
                                    </button>
                                </>
                            ) : (
                                <div className="text-center p-4 bg-green-900/20 border border-green-800 rounded-lg">
                                    <p className="text-green-400 font-medium">Attendance marked for today</p>
                                    <p className="text-sm text-gray-400 mt-1">
                                        {format(new Date(todayAttendance.check_in!), 'hh:mm a')} - {format(new Date(todayAttendance.check_out), 'hh:mm a')}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Attendance Table */}
            <div className="bg-[#1e1e24] border border-gray-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-800">
                                {isAdmin && <th className="text-left py-4 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Employee</th>}
                                <th className="text-left py-4 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                                <th className="text-left py-4 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Check In</th>
                                <th className="text-left py-4 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Check Out</th>
                                <th className="text-left py-4 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Break</th>
                                <th className="text-left py-4 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Working Hours</th>
                                <th className="text-left py-4 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attendanceRecords && attendanceRecords.length > 0 ? (
                                attendanceRecords.map((record) => {
                                    const statusBadge = getStatusBadge(record.check_in, record.status)
                                    return (
                                        <tr key={record.id} className="border-b border-gray-800 hover:bg-[#26262e] transition-colors">
                                            {isAdmin && (
                                                <td className="py-4 px-4 text-sm text-white">
                                                    {record.employees?.first_name} {record.employees?.last_name}
                                                </td>
                                            )}
                                            <td className="py-4 px-4 text-sm text-white">
                                                {format(new Date(record.date), 'MMM dd, yyyy')}
                                            </td>
                                            <td className="py-4 px-4 text-sm text-white">
                                                {record.check_in ? format(new Date(record.check_in), 'hh:mm a') : '-'}
                                            </td>
                                            <td className="py-4 px-4 text-sm text-white">
                                                {record.check_out ? format(new Date(record.check_out), 'hh:mm a') : '-'}
                                            </td>
                                            <td className="py-4 px-4 text-sm text-white">
                                                {record.break_duration ? `${record.break_duration} Min` : '00:00 Min'}
                                            </td>
                                            <td className="py-4 px-4 text-sm text-white">
                                                {calculateWorkingHours(record.check_in, record.check_out, record.break_duration)}
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${statusBadge.class}`}>
                                                    {statusBadge.text}
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                })
                            ) : (
                                <tr>
                                    <td colSpan={isAdmin ? 7 : 6} className="py-8 px-4 text-center text-gray-500">
                                        No attendance records found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
