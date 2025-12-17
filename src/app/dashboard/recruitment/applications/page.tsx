'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import { Application } from '@/types/recruitment'
import { Loader2, FileText, Mail, Phone, Github, MessageSquare, Video } from 'lucide-react'

export default function ApplicationsPage() {
    const queryClient = useQueryClient()

    const { data: applications, isLoading, error } = useQuery({
        queryKey: ['applications'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('applications')
                .select('*, job_openings(title)')
                .order('created_at', { ascending: false })

            if (error) throw error
            return data as Application[]
        },
    })

    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: string }) => {
            const { error } = await supabase
                .from('applications')
                .update({ status })
                .eq('id', id)

            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['applications'] })
        },
    })

    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-indigo-600" /></div>
    if (error) return <div className="p-8 text-red-500">Error loading applications</div>

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold text-white-800 mb-6">Applications</h1>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <ul className="divide-y divide-gray-200">
                    {applications?.map((app) => (
                        <li key={app.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                            <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-medium text-indigo-600 truncate">
                                        {app.candidate_name}
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Applied for: <span className="font-medium text-gray-900">{app.job_openings?.title}</span>
                                    </p>
                                    <div className="mt-2 flex items-center text-sm text-gray-500 space-x-4">
                                        <span className="flex items-center">
                                            <Mail className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                            {app.email}
                                        </span>
                                        {app.phone && (
                                            <span className="flex items-center">
                                                <Phone className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                                {app.phone}
                                            </span>
                                        )}
                                        {app.github_id && (
                                            <span className="flex items-center" title={`Github: ${app.github_id}`}>
                                                <Github className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                                <span className="hidden sm:inline">{app.github_id}</span>
                                            </span>
                                        )}
                                        {app.slack_id && (
                                            <span className="flex items-center" title={`Slack: ${app.slack_id}`}>
                                                <MessageSquare className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                                <span className="hidden sm:inline">{app.slack_id}</span>
                                            </span>
                                        )}
                                        {app.skype_id && (
                                            <span className="flex items-center" title={`Skype: ${app.skype_id}`}>
                                                <Video className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                                <span className="hidden sm:inline">{app.skype_id}</span>
                                            </span>
                                        )}
                                        {app.resume_url && (
                                            <a href={app.resume_url} target="_blank" rel="noopener noreferrer" className="flex items-center text-indigo-600 hover:text-indigo-500">
                                                <FileText className="flex-shrink-0 mr-1.5 h-4 w-4" />
                                                Resume
                                            </a>
                                        )}
                                    </div>
                                </div>
                                <div className="ml-4 flex-shrink-0 flex flex-col items-end space-y-2">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${app.status === 'Hired' ? 'bg-green-100 text-green-800' :
                                            app.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                                app.status === 'Interviewing' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-gray-100 text-gray-800'}`}>
                                        {app.status}
                                    </span>

                                    <select
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                        value={app.status}
                                        onChange={(e) => updateStatusMutation.mutate({ id: app.id, status: e.target.value })}
                                    >
                                        <option value="Applied">Applied</option>
                                        <option value="Interviewing">Interviewing</option>
                                        <option value="Hired">Hired</option>
                                        <option value="Rejected">Rejected</option>
                                    </select>
                                </div>
                            </div>
                        </li>
                    ))}
                    {applications?.length === 0 && (
                        <li className="px-4 py-8 text-center text-gray-500">No applications received yet.</li>
                    )}
                </ul>
            </div>
        </div >
    )
}
