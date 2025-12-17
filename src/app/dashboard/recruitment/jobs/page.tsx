'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { Plus, Loader2, Briefcase, MapPin, DollarSign } from 'lucide-react'

// Extended type (local for now or update centralized types later)
interface JobOpening {
    id: string
    title: string
    department: string
    description: string
    status: string // 'Active' | 'Inactive' | 'Completed'
    location?: string
    job_type?: string
    salary_range?: string
    created_at: string
}

export default function JobOpeningsPage() {
    const queryClient = useQueryClient()

    const { data: jobs, isLoading, error } = useQuery({
        queryKey: ['job_openings'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('job_openings')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            return data as JobOpening[]
        },
    })

    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-indigo-600" /></div>
    if (error) return <div className="p-8 text-red-500">Error loading jobs</div>

    const activeJobs = jobs?.filter(j => j.status === 'Active') || []
    const inactiveJobs = jobs?.filter(j => j.status === 'Inactive') || []
    const completedJobs = jobs?.filter(j => j.status === 'Completed') || []

    const JobCard = ({ job }: { job: JobOpening }) => (
        <div className="bg-[#1e1e24] rounded-xl p-5 mb-4 border border-gray-800 shadow-sm text-white relative group">
            {/* Edit/Action Overlay (Simple link for now) */}
            <Link href={`/dashboard/recruitment/jobs/${job.id}/edit`} className="absolute inset-0 z-0" />

            <div className="flex items-start gap-4 mb-4 relative z-10 pointer-events-none">
                <div className="bg-[#2d2d35] p-2.5 rounded-lg border border-gray-700">
                    <Briefcase className="h-6 w-6 text-gray-400" />
                </div>
                <div>
                    <h3 className="font-semibold text-lg leading-tight mb-1">{job.title}</h3>
                    <p className="text-gray-400 text-sm">{job.department}</p>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4 relative z-10 pointer-events-none">
                {/* Custom tags/chips style */}
                <span className="px-3 py-1.5 rounded-md bg-[#6366f1] text-xs font-medium text-white">{job.department}</span>
                <span className="px-3 py-1.5 rounded-md bg-[#6366f1] text-xs font-medium text-white">{job.job_type || 'Full Time'}</span>
                {job.location?.toLowerCase().includes('remote') && (
                    <span className="px-3 py-1.5 rounded-md bg-[#6366f1] text-xs font-medium text-white">Remote</span>
                )}
            </div>

            <div className="flex items-center justify-between border-t border-gray-700 pt-4 relative z-10 pointer-events-none">
                <div className="flex items-center text-gray-400 text-sm">
                    <MapPin className="h-4 w-4 mr-1.5" />
                    {job.location || 'Remote'}
                </div>
                <div className="text-white font-semibold text-sm">
                    {job.salary_range || 'Negotiable'}
                </div>
            </div>
        </div>
    )

    return (
        <div className="p-8 min-h-screen bg-[#13131a]"> {/* Dark background for this section as requested */}
            <div className="flex justify-between items-center mb-8">
                {/* Search Bar Placeholder */}
                <div className="relative w-96">
                    <input
                        type="text"
                        placeholder="Search"
                        className="w-full bg-[#1e1e24] border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-gray-300 focus:outline-none focus:border-indigo-500"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                <Link
                    href="/dashboard/recruitment/jobs/new"
                    className="inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-[#6366f1] hover:bg-indigo-600 shadow-lg transition-all"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    Add New Job
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Active Jobs */}
                <div>
                    <div className="flex items-center mb-4">
                        <span className="h-2 w-2 rounded-full bg-yellow-400 mr-2"></span>
                        <h2 className="text-white font-medium">Active Jobs</h2>
                        <span className="ml-2 text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">{activeJobs.length}</span>
                    </div>
                    <div>
                        {activeJobs.map(job => <JobCard key={job.id} job={job} />)}
                    </div>
                </div>

                {/* Inactive Jobs */}
                <div>
                    <div className="flex items-center mb-4">
                        <span className="h-2 w-2 rounded-full bg-red-400 mr-2"></span>
                        <h2 className="text-white font-medium">Inactive Jobs</h2>
                        <span className="ml-2 text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">{inactiveJobs.length}</span>
                    </div>
                    <div>
                        {inactiveJobs.map(job => <JobCard key={job.id} job={job} />)}
                    </div>
                </div>

                {/* Completed Jobs */}
                <div>
                    <div className="flex items-center mb-4">
                        <span className="h-2 w-2 rounded-full bg-green-400 mr-2"></span>
                        <h2 className="text-white font-medium">Completed Jobs</h2>
                        <span className="ml-2 text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">{completedJobs.length}</span>
                    </div>
                    <div>
                        {completedJobs.map(job => <JobCard key={job.id} job={job} />)}
                    </div>
                </div>
            </div>
        </div>
    )
}
