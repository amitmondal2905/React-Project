'use client'

import React from "react";
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { Briefcase, MapPin, Clock, DollarSign, Bookmark, ArrowRight, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface JobOpening {
    id: string
    title: string
    department: string
    description: string
    status: string
    location?: string
    job_type?: string
    salary_range?: string
    created_at: string
}

export default function JobPromotion() {
    const { data: jobs, isLoading, error } = useQuery({
        queryKey: ['active_jobs_home'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('job_openings')
                .select('*')
                .eq('status', 'Active')
                .order('created_at', { ascending: false })
                .limit(6) // Limit to 6 latest jobs for homepage

            if (error) throw error
            return data as JobOpening[]
        },
    })

    if (isLoading) return (
        <div className="flex justify-center py-20 bg-[#13131a]">
            <Loader2 className="animate-spin h-8 w-8 text-indigo-500" />
        </div>
    )

    if (error) return null // Hide section if error

    return (
        <section className="py-20 bg-[#13131a]" id="job-promotion">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Latest <span className="text-indigo-500">Job Openings</span>
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Explore opportunities to join our team. We are looking for talented individuals to help us grow.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {jobs?.map((job) => (
                        <div key={job.id} className="bg-[#1e1e24] rounded-2xl p-6 border border-gray-800 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10 group flex flex-col justify-between h-full">

                            {/* Header */}
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-[#2d2d35] flex items-center justify-center border border-gray-700 group-hover:border-indigo-500/30 transition-colors">
                                        <Briefcase className="h-6 w-6 text-indigo-400" />
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500 font-medium block mb-1">
                                            {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                                        </span>
                                        <h3 className="text-white font-bold text-lg leading-tight line-clamp-2">
                                            {job.title}
                                        </h3>
                                    </div>
                                </div>
                                <button className="text-gray-500 hover:text-indigo-400 transition-colors">
                                    <Bookmark className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Description */}
                            <p className="text-gray-400 text-sm mb-6 line-clamp-3">
                                {job.description}
                            </p>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2 mb-8">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20`}>
                                    {job.job_type || 'Full Time'}
                                </span>
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                                    {job.location || 'Remote'}
                                </span>
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20">
                                    {job.department}
                                </span>
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-6 border-t border-gray-800 mt-auto">
                                <div>
                                    <span className="text-white font-bold block">
                                        {job.salary_range || 'Competitive'}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        / Month
                                    </span>
                                </div>
                                <div className="flex gap-3">
                                    <Link
                                        href={`/careers/${job.id}/apply`}
                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        Apply Now
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {jobs?.length === 0 && (
                    <div className="text-center py-12 bg-[#1e1e24] rounded-2xl border border-gray-800">
                        <Briefcase className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No Openings Right Now</h3>
                        <p className="text-gray-400">Check back later or follow us on social media for updates.</p>
                    </div>
                )}

                <div className="mt-12 text-center">
                    <Link
                        href="/careers"
                        className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                    >
                        View All Jobs <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
