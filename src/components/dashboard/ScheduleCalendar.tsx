'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, MoreVertical, Plus, X, Loader2 } from 'lucide-react'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, parseISO } from 'date-fns'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import { useUserRole } from '@/hooks/useUserRole'
import { toast } from 'react-hot-toast'

interface Schedule {
    id: string
    title: string
    role: string
    date: string
    time: string
    color: string
}

export default function ScheduleCalendar() {
    const { data: userProfile } = useUserRole()
    const queryClient = useQueryClient()
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [newItem, setNewItem] = useState({
        title: '',
        role: '',
        time: '',
        color: 'border-l-indigo-500'
    })

    // Fetch Schedules
    const { data: schedules, isLoading } = useQuery({
        queryKey: ['schedules', userProfile?.id],
        queryFn: async () => {
            if (!userProfile?.id) return []
            const { data, error } = await supabase
                .from('schedules')
                .select('*')
                .eq('employee_id', userProfile.id)
                .order('date', { ascending: true })
                .order('time', { ascending: true })

            if (error) throw error
            return data as Schedule[]
        },
        enabled: !!userProfile?.id
    })

    // Add Schedule Mutation
    const addScheduleMutation = useMutation({
        mutationFn: async (newItemData: any) => {
            const { error } = await supabase.from('schedules').insert([{
                ...newItemData,
                employee_id: userProfile?.id,
                date: format(selectedDate, 'yyyy-MM-dd')
            }])
            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['schedules'] })
            setIsModalOpen(false)
            setNewItem({ title: '', role: '', time: '', color: 'border-l-indigo-500' })
            toast.success('Event added successfully')
        },
        onError: (error: any) => {
            toast.error(error.message)
        }
    })

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault()
        if (!newItem.title || !newItem.time) {
            toast.error('Title and Time are required')
            return
        }
        addScheduleMutation.mutate(newItem)
    }

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))

    const days = eachDayOfInterval({
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate)
    })

    // Filter schedules for the LIST view (Showing selected date + future)
    // Or just showing all upcoming? Let's show all upcoming from selected date
    const displayedSchedules = schedules?.filter(s => {
        const sDate = parseISO(s.date)
        const selDate = new Date(selectedDate)
        selDate.setHours(0, 0, 0, 0)
        return sDate >= selDate
    })?.slice(0, 5) || []

    return (
        <div className="bg-[#1e1e24] border border-gray-800 rounded-2xl p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">My Schedule</h3>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="p-2 bg-[#2d2d35] rounded-lg text-indigo-400 hover:text-white hover:bg-indigo-600 transition-colors"
                >
                    <Plus className="h-5 w-5" />
                </button>
            </div>

            {/* Calendar Widget */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4 text-white">
                    <button onClick={prevMonth} className="p-1 hover:bg-[#2d2d35] rounded"><ChevronLeft className="h-5 w-5 text-indigo-400" /></button>
                    <span className="font-bold">{format(currentDate, 'MMMM, yyyy')}</span>
                    <button onClick={nextMonth} className="p-1 hover:bg-[#2d2d35] rounded"><ChevronRight className="h-5 w-5 text-indigo-400" /></button>
                </div>
                <div className="grid grid-cols-7 gap-2 text-center text-xs mb-2 text-gray-500">
                    <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
                </div>
                <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium text-gray-400">
                    {/* Empty slots */}
                    {Array.from({ length: startOfMonth(currentDate).getDay() }).map((_, i) => (
                        <div key={`empty-${i}`} />
                    ))}

                    {days.map(day => {
                        const isSelected = isSameDay(day, selectedDate)
                        const isCurrentDay = isToday(day)
                        const hasEvent = schedules?.some(s => isSameDay(parseISO(s.date), day))

                        return (
                            <div
                                key={day.toString()}
                                onClick={() => setSelectedDate(day)}
                                className={`
                                    h-8 w-8 flex flex-col items-center justify-center rounded-full cursor-pointer transition-all relative
                                    ${isSelected
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
                                        : 'hover:bg-[#2d2d35] hover:text-white'}
                                    ${isCurrentDay && !isSelected ? 'text-indigo-400 border border-indigo-400/30' : ''}
                                `}
                            >
                                <span>{format(day, 'd')}</span>
                                {hasEvent && !isSelected && (
                                    <span className="absolute bottom-1 h-1 w-1 bg-indigo-400 rounded-full"></span>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Schedule List */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <div className="flex items-center justify-between mb-4 sticky top-0 bg-[#1e1e24] py-2 z-10">
                    <p className="text-gray-400 text-sm">{format(selectedDate, 'EEEE, dd MMMM yyyy')}</p>
                </div>

                <div className="space-y-6">
                    {isLoading ? (
                        <div className="flex justify-center py-4"><Loader2 className="animate-spin text-indigo-500" /></div>
                    ) : displayedSchedules.length === 0 ? (
                        <p className="text-gray-600 text-center text-sm py-4">No events scheduled.</p>
                    ) : (
                        displayedSchedules.map((item, index) => {
                            const isDifferentDay = index > 0 && item.date !== displayedSchedules[index - 1].date
                            const formattedDate = format(parseISO(item.date), 'EEEE, dd MMMM yyyy')

                            return (
                                <div key={item.id}>
                                    {/* Show date header if list spans multiple days and it changes */}
                                    {isDifferentDay && (
                                        <div className="flex items-center justify-between mb-4 mt-6 pt-4 border-t border-gray-800">
                                            <p className="text-gray-400 text-sm">{formattedDate}</p>
                                        </div>
                                    )}
                                    <div className="flex gap-4 group">
                                        <div className="text-white font-bold w-12 pt-1 text-sm">{item.time.slice(0, 5)}</div>
                                        <div className={`flex-1 pl-4 border-l-2 ${item.color} group-hover:border-white transition-colors`}>
                                            <p className="text-gray-500 text-xs mb-1">{item.role || 'Event'}</p>
                                            <h4 className="text-white font-bold text-sm">{item.title}</h4>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>

            {/* Add Event Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-[#1e1e24] rounded-xl border border-gray-800 w-full max-w-sm p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-white">Add Schedule</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><X className="h-5 w-5" /></button>
                        </div>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Date</label>
                                <div className="text-sm text-white font-medium bg-[#2d2d35] px-3 py-2 rounded-lg border border-gray-700">
                                    {format(selectedDate, 'MMMM dd, yyyy')}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Time</label>
                                <input
                                    type="time"
                                    required
                                    className="w-full bg-[#2d2d35] border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                                    value={newItem.time}
                                    onChange={e => setNewItem({ ...newItem, time: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Title</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Task Review"
                                    className="w-full bg-[#2d2d35] border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                                    value={newItem.title}
                                    onChange={e => setNewItem({ ...newItem, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Role / Description</label>
                                <input
                                    type="text"
                                    placeholder="UI/UX Designer"
                                    className="w-full bg-[#2d2d35] border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                                    value={newItem.role}
                                    onChange={e => setNewItem({ ...newItem, role: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Color Marker</label>
                                <div className="flex gap-2">
                                    {['border-l-indigo-500', 'border-l-purple-500', 'border-l-red-500', 'border-l-yellow-500', 'border-l-green-500'].map(color => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => setNewItem({ ...newItem, color })}
                                            className={`h-6 w-6 rounded-full border-2 ${color.replace('border-l-', 'bg-')} ${newItem.color === color ? 'border-white' : 'border-transparent'}`}
                                        />
                                    ))}
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={addScheduleMutation.isPending}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2.5 text-sm font-medium transition-colors flex justify-center mt-4"
                            >
                                {addScheduleMutation.isPending ? <Loader2 className="animate-spin h-5 w-5" /> : 'Add Event'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
