'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import { useUserRole } from '@/hooks/useUserRole'
import { Loader2, Plus, Calendar, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

type Project = {
    id: string
    employee_id: string
    project_name: string
    start_date: string
    finish_date: string | null
    status: string
    created_at: string
}

export default function ProjectsPage() {
    const queryClient = useQueryClient()
    const { data: userProfile } = useUserRole()
    const [showAddForm, setShowAddForm] = useState(false)
    const [formData, setFormData] = useState({
        project_name: '',
        start_date: '',
        finish_date: '',
        status: 'In Progress'
    })

    const isAdmin = userProfile?.role === 'Admin'

    // Fetch projects based on role
    const { data: projects, isLoading } = useQuery({
        queryKey: ['projects', isAdmin],
        queryFn: async () => {
            let query = supabase.from('projects').select('*, employees(first_name, last_name, email)')

            if (!isAdmin && userProfile?.id) {
                query = query.eq('employee_id', userProfile.id)
            }

            const { data, error } = await query.order('start_date', { ascending: false })

            if (error) throw error
            return data as (Project & { employees: { first_name: string; last_name: string; email: string } })[]
        },
        enabled: !!userProfile,
    })

    // Add project mutation
    const addProjectMutation = useMutation({
        mutationFn: async (newProject: typeof formData) => {
            const { error } = await supabase.from('projects').insert([{
                employee_id: userProfile?.id,
                ...newProject,
                finish_date: newProject.finish_date || null
            }])

            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] })
            toast.success('Project added successfully')
            setShowAddForm(false)
            setFormData({ project_name: '', start_date: '', finish_date: '', status: 'In Progress' })
        },
        onError: (error) => {
            toast.error('Error adding project: ' + error.message)
        },
    })

    // Delete project mutation
    const deleteProjectMutation = useMutation({
        mutationFn: async (projectId: string) => {
            const { error } = await supabase.from('projects').delete().eq('id', projectId)
            if (error) throw error
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] })
            toast.success('Project deleted successfully')
        },
        onError: (error) => {
            toast.error('Error deleting project: ' + error.message)
        },
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.project_name || !formData.start_date) {
            toast.error('Please fill in required fields')
            return
        }
        addProjectMutation.mutate(formData)
    }

    const handleDelete = (projectId: string) => {
        if (confirm('Are you sure you want to delete this project?')) {
            deleteProjectMutation.mutate(projectId)
        }
    }

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-indigo-600" /></div>
    }

    return (
        <div className="max-w-7xl mx-auto py-8 px-4">
            {/* Header */}
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">
                        {isAdmin ? 'All Employee Projects' : 'My Projects'}
                    </h1>
                    <p className="text-gray-400 mt-1">
                        {isAdmin ? 'View all projects from all employees' : 'Manage your project portfolio'}
                    </p>
                </div>
                {!isAdmin && (
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                    >
                        <Plus className="h-5 w-5" />
                        Add Project
                    </button>
                )}
            </div>

            {/* Add Project Form */}
            {showAddForm && !isAdmin && (
                <div className="bg-[#1e1e24] border border-gray-800 rounded-xl p-6 mb-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Add New Project</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">
                                Project Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.project_name}
                                onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                                className="w-full bg-[#2d2d35] border border-gray-700 rounded-lg py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                                placeholder="e.g. E-commerce Platform"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">
                                Status
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full bg-[#2d2d35] border border-gray-700 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-indigo-500"
                            >
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">
                                Start Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={formData.start_date}
                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                className="w-full bg-[#2d2d35] border border-gray-700 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-indigo-500 [color-scheme:dark]"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">
                                Finish Date (Optional)
                            </label>
                            <input
                                type="date"
                                value={formData.finish_date}
                                onChange={(e) => setFormData({ ...formData, finish_date: e.target.value })}
                                className="w-full bg-[#2d2d35] border border-gray-700 rounded-lg py-2.5 px-4 text-white focus:outline-none focus:border-indigo-500 [color-scheme:dark]"
                            />
                        </div>
                        <div className="md:col-span-2 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowAddForm(false)}
                                className="px-4 py-2 border border-gray-700 text-gray-400 rounded-lg hover:bg-[#2d2d35] transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={addProjectMutation.isPending}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                            >
                                {addProjectMutation.isPending ? 'Adding...' : 'Add Project'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Projects Table */}
            <div className="bg-[#1e1e24] border border-gray-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-800">
                                <th className="text-left py-4 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Sr. No.</th>
                                {isAdmin && <th className="text-left py-4 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Employee</th>}
                                <th className="text-left py-4 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Project Name</th>
                                <th className="text-left py-4 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Start Date</th>
                                <th className="text-left py-4 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Finish Date</th>
                                <th className="text-left py-4 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                                {!isAdmin && <th className="text-left py-4 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {projects && projects.length > 0 ? (
                                projects.map((project, index) => (
                                    <tr key={project.id} className="border-b border-gray-800 hover:bg-[#26262e] transition-colors">
                                        <td className="py-4 px-4 text-sm text-white">{index + 1}</td>
                                        {isAdmin && (
                                            <td className="py-4 px-4 text-sm text-white">
                                                {project.employees.first_name} {project.employees.last_name}
                                            </td>
                                        )}
                                        <td className="py-4 px-4 text-sm text-white">{project.project_name}</td>
                                        <td className="py-4 px-4 text-sm text-white">
                                            {format(new Date(project.start_date), 'MMM dd, yyyy')}
                                        </td>
                                        <td className="py-4 px-4 text-sm text-white">
                                            {project.finish_date ? format(new Date(project.finish_date), 'MMM dd, yyyy') : 'Ongoing'}
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${project.status === 'Completed'
                                                    ? 'bg-green-900/30 text-green-400'
                                                    : 'bg-yellow-900/30 text-yellow-400'
                                                }`}>
                                                {project.status}
                                            </span>
                                        </td>
                                        {!isAdmin && (
                                            <td className="py-4 px-4">
                                                <button
                                                    onClick={() => handleDelete(project.id)}
                                                    className="text-red-400 hover:text-red-300 transition-colors"
                                                    title="Delete project"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={isAdmin ? 6 : 6} className="py-8 px-4 text-center text-gray-500">
                                        {isAdmin ? 'No projects found from any employees' : 'No projects added yet. Click "Add Project" to get started!'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
