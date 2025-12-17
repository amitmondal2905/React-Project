'use client'

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { Plus, CalendarDays, Loader2, MapPin } from 'lucide-react'
import { format, isPast, isToday, parseISO } from 'date-fns'
import { useState, useEffect } from 'react'

interface Holiday {
    id: string
    name: string
    date: string
}

export default function HolidaysPage() {
    const { data: holidays, isLoading, error } = useQuery({
        queryKey: ['holidays'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('holidays')
                .select('*')
                .order('date', { ascending: true })

            if (error) throw error
            return data as Holiday[]
        },
    })

    const [isAdmin, setIsAdmin] = useState(false)
    const [userLoading, setUserLoading] = useState(true)

    useEffect(() => {
        const checkUserRole = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: employee } = await supabase
                    .from('employees')
                    .select('role')
                    .eq('user_id', user.id)
                    .single()

                if (employee?.role === 'Admin') {
                    setIsAdmin(true)
                }
            }
            setUserLoading(false)
        }
        checkUserRole()
    }, [])

    if (isLoading || userLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-indigo-600" /></div>
    if (error) return <div className="p-8 text-red-500">Error loading holidays.</div>

    // Split into Upcoming and Past
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Sort logic is already handled by Supabase order, but filtering needs care
    const upcomingHolidays = holidays?.filter(h => {
        const hDate = parseISO(h.date)
        return hDate >= today
    }) || []

    const pastHolidays = holidays?.filter(h => {
        const hDate = parseISO(h.date)
        return hDate < today
    })?.reverse() || [] // Reverse past holidays to show most recent past first

    return (
        <div className="p-8 bg-[#13131a] min-h-screen">
            <div className="max-w-4xl mx-auto">
                <div className="md:flex md:items-center md:justify-between mb-8">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-2xl font-bold leading-7 text-white sm:text-3xl sm:truncate flex items-center gap-3">
                            <CalendarDays className="h-8 w-8 text-indigo-500" />
                            Holiday Calendar
                        </h2>
                        <p className="mt-1 text-sm text-gray-400">
                            Upcoming public holidays and company events.
                        </p>
                    </div>
                    {isAdmin && (
                        <div className="mt-4 flex md:mt-0 md:ml-4">
                            <Link
                                href="/dashboard/holidays/new"
                                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                            >
                                <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                                Add Holiday
                            </Link>
                        </div>
                    )}
                </div>

                <div className="space-y-8">
                    {/* Upcoming Section */}
                    <div className="bg-[#1e1e24] shadow-xl border border-gray-800 overflow-hidden sm:rounded-xl">
                        <div className="px-4 py-5 border-b border-gray-800 sm:px-6 bg-[#26262e]">
                            <h3 className="text-lg leading-6 font-medium text-white flex items-center">
                                <span className="h-2.5 w-2.5 bg-green-500 rounded-full mr-3 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                                Upcoming Holidays
                            </h3>
                        </div>
                        <ul role="list" className="divide-y divide-gray-800">
                            {upcomingHolidays.length === 0 ? (
                                <li className="px-4 py-8 sm:px-6 text-gray-500 text-sm italic text-center">No upcoming holidays scheduled.</li>
                            ) : (
                                upcomingHolidays.map((holiday) => (
                                    <li key={holiday.id}>
                                        <div className="px-4 py-4 sm:px-6 hover:bg-[#2d2d35] transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex-shrink-0">
                                                        <div className="h-14 w-14 rounded-xl bg-[#2d2d35] border border-gray-700 flex items-center justify-center text-indigo-400 font-bold text-xl shadow-inner">
                                                            {format(parseISO(holiday.date), 'dd')}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-base font-medium text-white">{holiday.name}</div>
                                                        <div className="text-sm text-gray-400 mt-0.5">
                                                            {format(parseISO(holiday.date), 'EEEE, MMMM yyyy')}
                                                        </div>
                                                    </div>
                                                </div>
                                                {isToday(parseISO(holiday.date)) && (
                                                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-900/30 text-green-400 border border-green-800">
                                                        Today
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>

                    {/* Past Section */}
                    {pastHolidays.length > 0 && (
                        <div className="bg-[#1e1e24] shadow-lg border border-gray-800 overflow-hidden sm:rounded-xl opacity-60 hover:opacity-100 transition-opacity duration-300">
                            <div className="px-4 py-5 border-b border-gray-800 sm:px-6 bg-[#26262e]">
                                <h3 className="text-lg leading-6 font-medium text-gray-400 flex items-center">
                                    <span className="h-2.5 w-2.5 bg-gray-500 rounded-full mr-3"></span>
                                    Past Holidays
                                </h3>
                            </div>
                            <ul role="list" className="divide-y divide-gray-800">
                                {pastHolidays.map((holiday) => (
                                    <li key={holiday.id}>
                                        <div className="px-4 py-4 sm:px-6 hover:bg-[#2d2d35] transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex-shrink-0">
                                                        <div className="h-12 w-12 rounded-lg bg-[#2d2d35] border border-gray-700 flex items-center justify-center text-gray-500 font-bold text-lg">
                                                            {format(parseISO(holiday.date), 'dd')}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-500 line-through decoration-gray-600">{holiday.name}</div>
                                                        <div className="text-xs text-gray-600 mt-0.5">
                                                            {format(parseISO(holiday.date), 'MMM yyyy')}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
