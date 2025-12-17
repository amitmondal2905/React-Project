'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Loader2, ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'

export default function NewJobPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        department: '',
        description: '',
        location: 'Remote', // Default
        job_type: 'Full Time', // Default
        salary_range: '',
        status: 'Active'
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { error } = await supabase
                .from('job_openings')
                .insert([formData])

            if (error) throw error

            toast.success('Job posting created successfully!')
            router.push('/dashboard/recruitment/jobs')
            router.refresh()
        } catch (error: any) {
            toast.error('Error posting job: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#13131a] p-8 text-white">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <Link
                        href="/dashboard/recruitment/jobs"
                        className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-4 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back to Jobs Board
                    </Link>
                    <h1 className="text-2xl font-bold">Post New Job Opening</h1>
                    <p className="mt-1 text-gray-400">Create a new job card for the recruitment board.</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-[#1e1e24] p-8 rounded-xl border border-gray-800 shadow-xl space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Title */}
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-300 mb-2">Job Title</label>
                            <input
                                type="text"
                                name="title"
                                required
                                className="w-full bg-[#2d2d35] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                                onChange={handleChange}
                                placeholder="e.g. Senior Product Designer"
                            />
                        </div>

                        {/* Department */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Department</label>
                            <input
                                type="text"
                                name="department"
                                required
                                className="w-full bg-[#2d2d35] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                onChange={handleChange}
                                placeholder="e.g. Design"
                            />
                        </div>

                        {/* Job Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Job Type</label>
                            <select
                                name="job_type"
                                required
                                value={formData.job_type}
                                onChange={handleChange}
                                className="w-full bg-[#2d2d35] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                            >
                                <option value="Full Time">Full Time</option>
                                <option value="Part Time">Part Time</option>
                                <option value="Contract">Contract</option>
                                <option value="Internship">Internship</option>
                            </select>
                        </div>

                        {/* Location */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                            <input
                                type="text"
                                name="location"
                                required
                                value={formData.location}
                                className="w-full bg-[#2d2d35] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                onChange={handleChange}
                                placeholder="e.g. New York, USA or Remote"
                            />
                        </div>

                        {/* Salary */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Salary Range</label>
                            <input
                                type="text"
                                name="salary_range"
                                className="w-full bg-[#2d2d35] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                onChange={handleChange}
                                placeholder="e.g. $3600/Month"
                            />
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Initial Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full bg-[#2d2d35] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                        <textarea
                            name="description"
                            required
                            rows={5}
                            className="w-full bg-[#2d2d35] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                            onChange={handleChange}
                            placeholder="Job requirements, responsibilities, etc."
                        />
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-700">
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-[#6366f1] hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all shadow-lg"
                        >
                            {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Save className="h-5 w-5 mr-2" />}
                            Create Job Card
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
