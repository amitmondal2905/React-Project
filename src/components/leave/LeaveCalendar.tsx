'use client'

import { useState } from 'react'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, isSameDay, addMonths, subMonths, isToday } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { LeaveRequest } from '@/types/leave'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'

import { useUserRole } from '@/hooks/useUserRole'

export default function LeaveCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date())
    const { data: userProfile } = useUserRole()
    const isAdmin = userProfile?.role === 'Admin'

    // Fetch Holidays
    const { data: holidays } = useQuery({
        queryKey: ['holidays_calendar'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('holidays')
                .select('*')

            if (error) throw error
            return data as { id: string, name: string, date: string }[]
        }
    })

    // Fetch only APPROVED leaves
    const { data: leaves } = useQuery({
        queryKey: ['leaves', 'approved', userProfile?.id, isAdmin],
        queryFn: async () => {
            if (!userProfile?.id) return []

            let query = supabase
                .from('leave_requests')
                .select(`
          *,
          employees (
            first_name,
            last_name
          )
        `)
                .eq('status', 'Approved')

            // If not admin, restrict to own leaves
            if (!isAdmin) {
                query = query.eq('employee_id', userProfile.id)
            }

            const { data, error } = await query

            if (error) throw error
            return data as (LeaveRequest & { employees: { first_name: string; last_name: string } })[]
        },
        enabled: !!userProfile?.id
    })

    // Generate calendar grid
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)

    const days = eachDayOfInterval({
        start: startDate,
        end: endDate,
    })

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))

    return (
        <div className="bg-[#1e1e24] rounded-xl shadow-xl border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">
                    {format(currentDate, 'MMMM yyyy')}
                </h2>
                <div className="flex space-x-2">
                    <button
                        onClick={prevMonth}
                        className="p-2 hover:bg-[#2d2d35] rounded-full text-gray-400 hover:text-white transition-colors"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                        onClick={nextMonth}
                        className="p-2 hover:bg-[#2d2d35] rounded-full text-gray-400 hover:text-white transition-colors"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-px bg-gray-800 border border-gray-800 rounded-lg overflow-hidden">
                {/* Week headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="bg-[#26262e] py-2 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        {day}
                    </div>
                ))}

                {/* Days */}
                {days.map((day, dayIdx) => {
                    // Find holidays for this day
                    const dayHolidays = holidays?.filter(h => isSameDay(new Date(h.date), day))

                    // Find leaves for this day
                    const dayLeaves = leaves?.filter(leave => {
                        const start = new Date(leave.start_date)
                        const end = new Date(leave.end_date)
                        // Reset times for simpler comparison
                        start.setHours(0, 0, 0, 0)
                        end.setHours(0, 0, 0, 0)
                        day.setHours(0, 0, 0, 0)
                        return day >= start && day <= end
                    })

                    // Deduplicate by employee ID for display
                    const uniqueLeaves = dayLeaves?.filter((leave, index, self) =>
                        index === self.findIndex((t) => (
                            t.employee_id === leave.employee_id
                        ))
                    )

                    const isCurrentMonth = isSameMonth(day, monthStart)
                    const isTodayDate = isToday(day)

                    return (
                        <div
                            key={day.toString()}
                            className={`
                min-h-[100px] p-2 border-t border-gray-800 relative
                ${isCurrentMonth ? 'bg-[#1e1e24]' : 'bg-[#13131a]'}
                ${isTodayDate ? 'bg-indigo-900/20' : ''}
              `}
                        >
                            <div className="flex justify-between items-start">
                                <span className={`
                    text-sm font-medium h-7 w-7 flex items-center justify-center rounded-full
                    ${isTodayDate ? 'bg-indigo-600 text-white' : isCurrentMonth ? 'text-gray-300' : 'text-gray-600'}
                  `}>
                                    {format(day, 'd')}
                                </span>
                            </div>

                            <div className="mt-2 space-y-1">
                                {/* Holidays First */}
                                {dayHolidays?.map(holiday => (
                                    <div
                                        key={holiday.id}
                                        className="text-xs p-1 rounded bg-red-900/30 text-red-300 font-medium truncate border border-red-800"
                                        title={holiday.name}
                                    >
                                        🎉 {holiday.name}
                                    </div>
                                ))}

                                {/* Leaves */}
                                {uniqueLeaves?.map((leave) => (
                                    <div
                                        key={leave.id}
                                        className="text-xs p-1 rounded bg-green-900/30 text-green-300 truncate border border-green-800/50"
                                        title={`${leave.employees?.first_name} ${leave.employees?.last_name} (${leave.leave_type})`}
                                    >
                                        {leave.employees?.first_name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
