'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter, useParams } from 'next/navigation'
import { Loader2, ArrowLeft, Save, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'

export default function EditJobPage() {
    const router = useRouter()
    const params = useParams()
    const id = params.id as string

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        department: '',
        description: '',
        location: '',
        job_type: '',
        salary_range: '',
        status: ''
    })

    useEffect(() => {
        const fetchJob = async () => {
            const { data, error } = await supabase
                .from('job_openings')
                .select('*')
                .eq('id', id)
                .single()

            if (error) {
                toast.error('Error loading job')
                router.push('/dashboard/recruitment/jobs')
                return
            }

            if (data) {
                setFormData({
                    title: data.title,
                    department: data.department,
                    description: data.description || '',
                    location: data.location || 'Remote',
                    job_type: data.job_type || 'Full Time',
                    salary_range: data.salary_range || '',
                    status: data.status || 'Active'
                })
            }
            setLoading(false)
        }

        fetchJob()
    }, [id, router])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            const { error } = await supabase
                .from('job_openings')
                .update({
                    ...formData
                })
                .eq('id', id)

            if (error) throw error

            toast.success('Job updated successfully')
            router.push('/dashboard/recruitment/jobs')
            router.refresh()
        } catch (error: any) {
            toast.error('Error updating job: ' + error.message)
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this job opening? This cannot be undone.')) return

        try {
            const { error } = await supabase
                .from('job_openings')
                .delete()
                .eq('id', id)

            if (error) throw error

            toast.success('Job deleted')
            router.push('/dashboard/recruitment/jobs')
            router.refresh()
        } catch (error: any) {
            toast.error('Error deleting job: ' + error.message)
        }
    }

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin h-8 w-8 text-indigo-600" /></div>

    return (
        <div className="min-h-screen bg-[#13131a] p-8 text-white">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8 flex justify-between items-start">
                    <div>
                        <Link
                            href="/dashboard/recruitment/jobs"
                            className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-4 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Back to Jobs Board
                        </Link>
                        <h1 className="text-2xl font-bold">Edit Job Opening</h1>
                        <p className="mt-1 text-gray-400">Update job details or change status.</p>
                    </div>
                    <button
                        onClick={handleDelete}
                        className="text-red-400 hover:text-red-300 p-2 rounded-full hover:bg-gray-800 transition-colors"
                        title="Delete Job"
                    >
                        <Trash2 className="h-5 w-5" />
                    </button>
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
                                value={formData.title}
                                className="w-full bg-[#2d2d35] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                                onChange={handleChange}
                            />
                        </div>

                        {/* Department */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Department</label>
                            <input
                                type="text"
                                name="department"
                                required
                                value={formData.department}
                                className="w-full bg-[#2d2d35] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                onChange={handleChange}
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
                            />
                        </div>

                        {/* Salary */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Salary Range</label>
                            <input
                                type="text"
                                name="salary_range"
                                value={formData.salary_range}
                                className="w-full bg-[#2d2d35] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                onChange={handleChange}
                            />
                        </div>

                        {/* Status */}
                        <div className="col-span-2">
                            <label className="block text-sm font-bold text-indigo-400 mb-2">Status (Move Card)</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full bg-[#2d2d35] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors ring-1 ring-gray-700"
                            >
                                <option value="Active">🟡 Active</option>
                                <option value="Inactive">🔴 Inactive</option>
                                <option value="Completed">🟢 Completed</option>
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
                            value={formData.description}
                            className="w-full bg-[#2d2d35] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                            onChange={handleChange}
                        />
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-700">
                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-[#6366f1] hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all shadow-lg"
                        >
                            {saving ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Save className="h-5 w-5 mr-2" />}
                            Update Job
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
