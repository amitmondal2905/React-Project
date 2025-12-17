'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function NewHolidayPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        date: '',
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { error } = await supabase
                .from('holidays')
                .insert([
                    {
                        name: formData.name,
                        date: formData.date,
                    }
                ])

            if (error) throw error

            toast.success('Holiday added successfully')
            router.push('/dashboard/holidays')
        } catch (error: any) {
            toast.error('Error adding holiday: ' + error.message)
            setLoading(false)
        }
    }

    return (
        <div className="p-8 bg-[#13131a] min-h-screen">
            <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                    <Link
                        href="/dashboard/holidays"
                        className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-4 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back to Holidays
                    </Link>
                    <h2 className="text-2xl font-bold text-white">Add New Holiday</h2>
                    <p className="mt-1 text-sm text-gray-400">
                        Add a public holiday or company wide event to the calendar.
                    </p>
                </div>

                <div className="bg-[#1e1e24] shadow-xl rounded-xl border border-gray-800 overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                                Holiday Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="mt-1 block w-full bg-[#2d2d35] border border-gray-700 rounded-lg shadow-sm py-2.5 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                                placeholder="e.g. New Year's Day"
                            />
                        </div>

                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-300">
                                Date
                            </label>
                            <input
                                type="date"
                                id="date"
                                name="date"
                                required
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                                className="mt-1 block w-full bg-[#2d2d35] border border-gray-700 rounded-lg shadow-sm py-2.5 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors [color-scheme:dark]"
                            />
                        </div>

                        <div className="flex justify-end pt-4 border-t border-gray-800">
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all"
                            >
                                {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                Save Holiday
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
