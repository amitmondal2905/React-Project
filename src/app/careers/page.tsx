'use client'

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import { JobOpening } from '@/types/recruitment'
import Link from 'next/link'
import { Briefcase, Loader2, ArrowRight } from 'lucide-react'

export default function CareersPage() {
    const { data: jobs, isLoading, error } = useQuery({
        queryKey: ['public_jobs'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('job_openings')
                .select('*')
                // Removed .eq('status', 'Open') to show all jobs
                .order('created_at', { ascending: false })

            if (error) throw error
            return data as JobOpening[]
        },
    })

    if (isLoading) return <div className="flex justify-center p-8 bg-[#13131a] min-h-screen text-white"><Loader2 className="animate-spin h-8 w-8 text-indigo-500" /></div>
    if (error) return <div className="p-8 text-red-500 text-center bg-[#13131a] min-h-screen">Error loading jobs</div>

    return (
        <div className="min-h-screen bg-[#13131a] text-white">
            <header className="bg-[#1e1e24] border-b border-gray-800 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <Link href="/" className="text-2xl font-bold text-white">HIRE<span className="text-indigo-500">Me</span> Careers</Link>
                    <Link href="/login" className="px-4 py-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 font-medium rounded-lg transition-colors">
                        Employee Login
                    </Link>
                </div>
            </header>
            <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-white mb-4 sm:text-4xl">
                        Explore All <span className="text-indigo-500">Opportunities</span>
                    </h2>
                    <p className="max-w-2xl mx-auto text-lg text-gray-400">
                        Browse our active, ongoing, and past job openings. Join us to build something great.
                    </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {jobs?.map((job) => {
                        const isActive = job.status === 'Active';
                        return (
                            <div key={job.id} className={`bg-[#1e1e24] rounded-xl border ${isActive ? 'border-gray-800' : 'border-gray-800 opacity-75'} p-6 transition-all duration-300 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 group`}>
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-indigo-600/20 rounded-lg flex items-center justify-center">
                                            <Briefcase className="h-6 w-6 text-indigo-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">{job.title}</h3>
                                            <p className="text-gray-400">{job.department}</p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${isActive
                                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                            : 'bg-gray-700/50 text-gray-400 border-gray-600'
                                        }`}>
                                        {job.status}
                                    </span>
                                </div>

                                <p className="text-gray-400 text-sm mb-6 line-clamp-3 leading-relaxed">
                                    {job.description}
                                </p>

                                <div>
                                    {isActive ? (
                                        <Link
                                            href={`/careers/${job.id}/apply`}
                                            className="w-full flex justify-center items-center px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-all shadow-md hover:shadow-indigo-500/25"
                                        >
                                            Apply Now <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    ) : (
                                        <button
                                            disabled
                                            className="w-full flex justify-center items-center px-4 py-3 bg-gray-800 text-gray-500 text-sm font-medium rounded-lg cursor-not-allowed border border-gray-700"
                                        >
                                            Position Closed
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                    {jobs?.length === 0 && (
                        <div className="col-span-2 text-center py-20 bg-[#1e1e24] rounded-2xl border border-gray-800">
                            <Briefcase className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">No Job History Found</h3>
                            <p className="text-gray-400">There are no job postings available to view right now.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

