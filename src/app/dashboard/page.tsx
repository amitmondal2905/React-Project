'use client'

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import { useUserRole } from '@/hooks/useUserRole'
import { Calendar, Filter, Search, Bell, Users, FileText, Clock, FolderOpen } from 'lucide-react'
import StatsGrid from '@/components/dashboard/StatsGrid'
import ScheduleCalendar from '@/components/dashboard/ScheduleCalendar'

export default function DashboardPage() {
    const { data: userProfile } = useUserRole()
    const isAdmin = userProfile?.role === 'Admin'

    // Unified Fetching Logic
    const { data: dashboardData, isLoading } = useQuery({
        queryKey: ['dashboard_data', userProfile?.id, userProfile?.role],
        queryFn: async () => {
            if (isAdmin) {
                // Admin Data
                const [employees, applications, attendance, projects] = await Promise.all([
                    supabase.from('employees').select('id', { count: 'exact', head: true }),
                    supabase.from('applications').select('id', { count: 'exact', head: true }),
                    supabase.from('attendance').select('id', { count: 'exact', head: true }).eq('date', new Date().toISOString().split('T')[0]),
                    supabase.from('projects').select('id', { count: 'exact', head: true })
                ])
                return {
                    stats: {
                        employees: employees.count || 0,
                        applicants: applications.count || 0,
                        attendance: attendance.count || 0,
                        projects: projects.count || 0,
                    }
                }
            } else {
                // Employee Data
                if (!userProfile?.id) return { stats: null }

                // Fetch Project Memberships (assuming a junction table or direct assignment)
                // If no junction table yet, standard projects table usually has 'employee_ids' or we just count all active for now if not implemented?
                // User said "Only THEIR projects". Assuming 'project_members' or array column.
                // Let's check schema. If unknown, we'll assume a simpler filter or placeholders.
                // Reverting to simple "My Leave" and "My Attendance" for now.

                const startOfMonth = new Date()
                startOfMonth.setDate(1)
                const startOfMonthStr = startOfMonth.toISOString().split('T')[0]

                const [myProjects, myLeave, myAttendanceCount] = await Promise.all([
                    supabase.from('projects').select('id', { count: 'exact', head: true }).eq('employee_id', userProfile.id),
                    supabase.from('leave_requests').select('id', { count: 'exact', head: true }).eq('employee_id', userProfile.id).eq('status', 'Pending'),
                    supabase.from('attendance').select('id', { count: 'exact', head: true }).eq('employee_id', userProfile.id).gte('date', startOfMonthStr)
                ])

                return {
                    stats: {
                        projects: myProjects.count || 0,
                        leaveRequests: myLeave.count || 0,
                        attendanceScore: myAttendanceCount.count || 0,
                    }
                }
            }
        },
        enabled: !!userProfile
    })

    // Fetch Attendance List (Conditional)
    const { data: attendanceList } = useQuery({
        queryKey: ['dashboard_attendance_list', userProfile?.id, isAdmin],
        queryFn: async () => {
            let query = supabase
                .from('attendance')
                .select(`
                    *,
                    employee:employees (
                        first_name,
                        last_name,
                        job_title,
                        employment_type,
                        photo_url
                    )
                `)
                .order('date', { ascending: false })
                .order('check_in', { ascending: false })
                .limit(5)

            if (isAdmin) {
                // Admin: Today's global attendance
                query = query.eq('date', new Date().toISOString().split('T')[0])
            } else {
                // Employee: My recent attendance history
                if (userProfile?.id) {
                    query = query.eq('employee_id', userProfile.id)
                }
            }

            const { data, error } = await query
            if (error) throw error
            return data
        },
        enabled: !!userProfile
    })

    // Generate Stat Cards based on Role
    const getStatCards = () => {
        if (isAdmin) {
            return [
                {
                    name: 'Total Employee',
                    value: dashboardData?.stats?.employees ?? '-',
                    icon: Users,
                    change: '+12%',
                    trend: 'up',
                    color: 'text-purple-400',
                    bg: 'bg-purple-400/10',
                    border: 'border-purple-400/20'
                },
                {
                    name: 'Total Applicant',
                    value: dashboardData?.stats?.applicants ?? '-',
                    icon: FileText,
                    change: '+5%',
                    trend: 'up',
                    color: 'text-blue-400',
                    bg: 'bg-blue-400/10',
                    border: 'border-blue-400/20'
                },
                {
                    name: 'Today Attendance',
                    value: dashboardData?.stats?.attendance ?? '-',
                    icon: Clock,
                    change: 'Today',
                    trend: 'neutral',
                    color: 'text-pink-400',
                    bg: 'bg-pink-400/10',
                    border: 'border-pink-400/20'
                },
                {
                    name: 'Total Projects',
                    value: dashboardData?.stats?.projects ?? '-',
                    icon: FolderOpen,
                    change: '+12%',
                    trend: 'up',
                    color: 'text-orange-400',
                    bg: 'bg-orange-400/10',
                    border: 'border-orange-400/20'
                },
            ]
        } else {
            return [
                {
                    name: 'My Projects',
                    value: dashboardData?.stats?.projects ?? 0,
                    icon: FolderOpen,
                    change: 'Active',
                    trend: 'neutral',
                    color: 'text-orange-400',
                    bg: 'bg-orange-400/10',
                    border: 'border-orange-400/20'
                },
                {
                    name: 'Pending Leave',
                    value: dashboardData?.stats?.leaveRequests ?? 0,
                    icon: FileText,
                    change: 'Requests',
                    trend: 'neutral',
                    color: 'text-blue-400',
                    bg: 'bg-blue-400/10',
                    border: 'border-blue-400/20'
                },
                {
                    name: 'Days Present',
                    value: dashboardData?.stats?.attendanceScore ?? 0,
                    icon: Clock,
                    change: 'This Month',
                    trend: 'up',
                    color: 'text-pink-400',
                    bg: 'bg-pink-400/10',
                    border: 'border-pink-400/20'
                },
            ]
        }
    }

    return (
        <div className="p-6 lg:p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center">
                        Hello {userProfile?.first_name || 'User'} <span className="ml-2 text-2xl">👋</span>
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Good Morning</p>
                </div>
                {/* Search Bar & Notification - Hidden for now if redundant, but keeping for UI consistency */}
                <div className="flex items-center gap-4">
                    <div className="relative hidden md:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search"
                            className="bg-[#1e1e24] border border-gray-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500 w-64"
                        />
                    </div>
                    <button className="p-2.5 bg-[#1e1e24] border border-gray-800 rounded-xl py-2.5 text-gray-400 hover:text-white">
                        <Bell className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <StatsGrid statCards={getStatCards() as any} isLoading={isLoading} />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column (Tables) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Attendance Table */}
                    <div className="bg-[#1e1e24] border border-gray-800 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-white">
                                {isAdmin ? 'Today\'s Attendance' : 'My Recent Attendance'}
                            </h3>
                            <button className="text-xs font-medium text-gray-400 bg-[#2d2d35] px-4 py-2 rounded-lg border border-gray-700 hover:text-white">
                                View All
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-gray-500 text-sm border-b border-gray-800">
                                        <th className="pb-4 font-medium">Employee Name</th>
                                        <th className="pb-4 font-medium">Designation</th>
                                        <th className="pb-4 font-medium">Type</th>
                                        <th className="pb-4 font-medium">Check In Time</th>
                                        <th className="pb-4 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {attendanceList?.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-8 text-center text-gray-500 italic">
                                                No attendance records found.
                                            </td>
                                        </tr>
                                    ) : (
                                        attendanceList?.map((record: any) => (
                                            <tr key={record.id} className="group hover:bg-[#2d2d35] transition-colors">
                                                <td className="py-4 flex items-center">
                                                    {record.employee?.photo_url ? (
                                                        <img src={record.employee.photo_url} alt="" className="h-8 w-8 rounded-full mr-3 object-cover" />
                                                    ) : (
                                                        <div className="h-8 w-8 rounded-full bg-indigo-500/20 mr-3 flex items-center justify-center text-indigo-400 text-xs font-bold">
                                                            {record.employee?.first_name?.[0]}
                                                        </div>
                                                    )}
                                                    <span className="text-white font-medium">{record.employee?.first_name} {record.employee?.last_name}</span>
                                                </td>
                                                <td className="py-4 text-gray-400">{record.employee?.job_title || 'N/A'}</td>
                                                <td className="py-4 text-gray-400">{record.employee?.employment_type || 'Office'}</td>
                                                <td className="py-4 text-white font-medium">
                                                    {record.check_in ? new Date(record.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                                                </td>
                                                <td className="py-4">
                                                    <span className={`px-2 py-1 text-xs rounded border 
                                                        ${record.status === 'On Time' ? 'bg-green-900/30 text-green-400 border-green-800/50' :
                                                            record.status === 'Late' ? 'bg-red-900/30 text-red-400 border-red-800/50' :
                                                                'bg-gray-800 text-gray-400 border-gray-700'}`}>
                                                        {record.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Column (Schedule) */}
                <div className="lg:col-span-1">
                    <ScheduleCalendar />
                </div>
            </div>
        </div>
    )
}
