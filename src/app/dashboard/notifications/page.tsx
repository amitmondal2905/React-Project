'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import { Bell, Check, Clock, User, Briefcase, FileText, ChevronRight, Loader2, Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { toast } from 'react-hot-toast'

interface Notification {
    id: string
    title: string
    message: string
    type: 'info' | 'warning' | 'success' | 'application'
    link?: string
    is_read: boolean
    created_at: string
}

export default function NotificationsPage() {
    const queryClient = useQueryClient()

    // Fetch Notifications
    const { data: notifications, isLoading } = useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            return data as Notification[]
        }
    })

    // Mark as Read Mutation
    const markAsRead = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', id)
            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] })
        }
    })

    // Delete Mutation
    const deleteNotification = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('notifications')
                .delete()
                .eq('id', id)
            if (error) throw error
        },
        onSuccess: () => {
            toast.success('Notification removed')
            queryClient.invalidateQueries({ queryKey: ['notifications'] })
        }
    })

    // Mark All as Read Mutation
    const markAllRead = useMutation({
        mutationFn: async () => {
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('is_read', false)
            // In RLS we trust: only updates user's own rows
            if (error) throw error
        },
        onSuccess: () => {
            toast.success('All marked as read')
            queryClient.invalidateQueries({ queryKey: ['notifications'] })
        }
    })

    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-indigo-500" /></div>

    const unreadCount = notifications?.filter(n => !n.is_read).length || 0

    return (
        <div className="p-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        Notifications
                        {unreadCount > 0 && (
                            <span className="px-3 py-1 bg-indigo-600 text-white text-xs rounded-full font-medium">
                                {unreadCount} New
                            </span>
                        )}
                    </h1>
                    <p className="text-gray-400 mt-1">Stay updated with latest activities and applications</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => markAllRead.mutate()}
                        className="px-4 py-2 bg-[#2d2d35] hover:bg-[#363640] text-gray-300 rounded-lg text-sm font-medium transition-colors border border-gray-700 flex items-center gap-2"
                        disabled={unreadCount === 0}
                    >
                        <Check className="h-4 w-4" /> Mark all as read
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="space-y-4">
                {notifications?.map((notification) => (
                    <div
                        key={notification.id}
                        className={`
                            relative group p-4 rounded-xl border transition-all duration-200
                            ${notification.is_read
                                ? 'bg-[#1e1e24] border-gray-800'
                                : 'bg-[#1e1e24] border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.1)]'
                            }
                        `}
                    >
                        <div className="flex items-start gap-4">
                            {/* Icon Type */}
                            <div className={`
                                w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-1
                                ${notification.type === 'application' ? 'bg-indigo-500/20 text-indigo-400' :
                                    notification.type === 'warning' ? 'bg-orange-500/20 text-orange-400' :
                                        notification.type === 'success' ? 'bg-green-500/20 text-green-400' :
                                            'bg-gray-700 text-gray-400'}
                            `}>
                                {notification.type === 'application' ? <Briefcase className="h-5 w-5" /> :
                                    notification.type === 'warning' ? <Clock className="h-5 w-5" /> :
                                        notification.type === 'success' ? <Check className="h-5 w-5" /> :
                                            <Bell className="h-5 w-5" />}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <h3 className={`text-base font-semibold ${notification.is_read ? 'text-gray-300' : 'text-white'}`}>
                                        {notification.title}
                                    </h3>
                                    <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                    </span>
                                </div>
                                <p className="text-gray-400 text-sm mt-1 mb-3 break-words">
                                    {notification.message}
                                </p>

                                {/* Actions */}
                                <div className="flex items-center gap-4">
                                    {notification.link && (
                                        <Link
                                            href={notification.link}
                                            onClick={() => !notification.is_read && markAsRead.mutate(notification.id)}
                                            className="text-indigo-400 hover:text-indigo-300 text-sm font-medium flex items-center gap-1 transition-colors"
                                        >
                                            View Details <ChevronRight className="h-4 w-4" />
                                        </Link>
                                    )}

                                    {!notification.is_read && (
                                        <button
                                            onClick={() => markAsRead.mutate(notification.id)}
                                            className="text-gray-500 hover:text-gray-300 text-sm font-medium transition-colors"
                                        >
                                            Mark as read
                                        </button>
                                    )}

                                    <button
                                        onClick={() => deleteNotification.mutate(notification.id)}
                                        className="text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 ml-auto"
                                        title="Delete notification"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Unread Indicator Dot */}
                        {!notification.is_read && (
                            <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-indigo-500"></div>
                        )}
                    </div>
                ))}

                {notifications?.length === 0 && (
                    <div className="text-center py-20 bg-[#1e1e24] rounded-xl border border-gray-800">
                        <div className="w-16 h-16 bg-[#2d2d35] rounded-full flex items-center justify-center mx-auto mb-4">
                            <Bell className="h-8 w-8 text-gray-600" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No Notifications</h3>
                        <p className="text-gray-400">You're all caught up! New updates will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
