'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useParams, useRouter } from 'next/navigation'
import { Loader2, Upload, ArrowLeft } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useQuery } from '@tanstack/react-query'
import { JobOpening } from '@/types/recruitment'

export default function ApplyPage() {
    const params = useParams()
    const router = useRouter()
    const jobId = params.id as string

    const [loading, setLoading] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [formData, setFormData] = useState({
        candidate_name: '',
        email: '',
        phone: '',
        skype_id: '',
        slack_id: '',
        github_id: ''
    })

    // Fetch job details to show title
    const { data: job } = useQuery({
        queryKey: ['job', jobId],
        queryFn: async () => {
            const { data, error } = await supabase.from('job_openings').select('*').eq('id', jobId).single()
            if (error) throw error
            return data as JobOpening
        },
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            let resume_url = null

            if (file) {
                const fileExt = file.name.split('.').pop()
                const fileName = `${Math.random()}.${fileExt}`
                const filePath = `${fileName}`

                const { error: uploadError } = await supabase.storage
                    .from('resumes')
                    .upload(filePath, file)

                if (uploadError) throw uploadError

                const { data: { publicUrl } } = supabase.storage
                    .from('resumes')
                    .getPublicUrl(filePath)

                resume_url = publicUrl
            }

            const { error } = await supabase
                .from('applications')
                .insert([{
                    ...formData,
                    job_opening_id: jobId,
                    resume_url
                }])
            // Removed .select() to avoid RLS violation for public users who can't read applications

            if (error) throw error

            // --- NOTIFICATION TRIGGER ---
            // 1. Fetch all Admin User IDs
            const { data: admins } = await supabase
                .from('employees')
                .select('user_id')
                .eq('role', 'Admin')

            if (admins && admins.length > 0) {
                // 2. Prepare notifications for each admin
                const notifications = admins.map(admin => ({
                    user_id: admin.user_id,
                    title: `Applied job for "${job?.title || 'Job'}" Position`, // Matches uploaded image text
                    message: `@${formData.candidate_name} has applied for job`, // Matches uploaded image format
                    type: 'application',
                    link: `/dashboard/recruitment/applications`, // Correct Link to applications page
                    is_read: false
                }))

                // 3. Insert notifications
                await supabase.from('notifications').insert(notifications)
            }
            // -----------------------------

            if (error) throw error

            toast.success('Application submitted successfully!')
            router.push('/careers')
        } catch (error: any) {
            toast.error('Error submitting application: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="px-6 py-8">
                    <button onClick={() => router.back()} className="flex items-center text-gray-500 hover:text-gray-700 mb-6">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Jobs
                    </button>

                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Apply for {job?.title}</h2>
                    <p className="text-gray-600 mb-8 text-sm">Please fill out the form below to apply.</p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input
                                type="text"
                                name="candidate_name"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                name="email"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                onChange={handleChange}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Skype ID</label>
                                <input
                                    type="text"
                                    name="skype_id"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                    onChange={handleChange}
                                    placeholder="Optional"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Slack ID</label>
                                <input
                                    type="text"
                                    name="slack_id"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                    onChange={handleChange}
                                    placeholder="Optional"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Github ID</label>
                                <input
                                    type="text"
                                    name="github_id"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                    onChange={handleChange}
                                    placeholder="Optional"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Resume / CV</label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                <div className="space-y-1 text-center">
                                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                    <div className="flex text-sm text-gray-600">
                                        <label
                                            htmlFor="file-upload"
                                            className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                                        >
                                            <span>Upload a file</span>
                                            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.doc,.docx" />
                                        </label>
                                    </div>
                                    <p className="text-xs text-gray-500">PDF, DOC up to 10MB</p>
                                    {file && <p className="text-sm text-green-600 mt-2">Selected: {file.name}</p>}
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Submit Application'}
                        </button>
                    </form>
                </div>
            </div >
        </div >
    )
}
