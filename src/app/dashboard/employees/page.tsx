'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import { Employee } from '@/types/employee'
import Link from 'next/link'
import { Plus, Search, Filter, Eye, Pencil, Trash2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

export default function EmployeesPage() {
    const queryClient = useQueryClient()
    const [search, setSearch] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [showFilter, setShowFilter] = useState(false)
    const [selectedDept, setSelectedDept] = useState('')
    const [selectedType, setSelectedType] = useState('')
    const [selectedStatus, setSelectedStatus] = useState('')
    const itemsPerPage = 10

    const { data: employees, isLoading, error } = useQuery({
        queryKey: ['employees'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('employees')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Error fetching employees:', error)
                throw error
            }
            return data as Employee[]
        },
    })

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('employees').delete().eq('id', id)
            if (error) throw error
        },
        onSuccess: () => {
            toast.success('Employee deleted successfully')
            queryClient.invalidateQueries({ queryKey: ['employees'] })
        },
        onError: (err: any) => {
            toast.error('Error deleting employee: ' + err.message)
        }
    })

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this employee?')) {
            deleteMutation.mutate(id)
        }
    }

    // Extract unique values
    const departments = Array.from(new Set(employees?.map(e => e.department).filter(Boolean))).sort() as string[]
    const types = Array.from(new Set(employees?.map(e => e.employment_type).filter(Boolean))).sort() as string[]

    // Filter Logic
    const filteredEmployees = employees?.filter(emp => {
        const matchesSearch =
            emp.first_name.toLowerCase().includes(search.toLowerCase()) ||
            emp.last_name.toLowerCase().includes(search.toLowerCase()) ||
            emp.email.toLowerCase().includes(search.toLowerCase())

        const matchesDept = selectedDept ? emp.department === selectedDept : true
        const matchesType = selectedType ? emp.employment_type === selectedType : true
        const matchesStatus = selectedStatus ? emp.status === selectedStatus : true

        return matchesSearch && matchesDept && matchesType && matchesStatus
    }) || []

    // Pagination Logic
    const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage)
    const paginatedEmployees = filteredEmployees.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-indigo-600" /></div>
    if (error) return <div className="p-8 text-red-500">Error loading employees. Check console for details.</div>

    return (
        <div className="p-8 bg-[#13131a] min-h-screen">
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div className="relative w-full md:w-96">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-700 rounded-lg leading-5 bg-[#1e1e24] text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm shadow-sm transition-colors"
                        placeholder="Search employees..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                    />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto relative">
                    <button
                        onClick={() => setShowFilter(!showFilter)}
                        className={`inline-flex items-center px-4 py-2.5 border text-sm font-medium rounded-lg shadow-sm transition-colors ${showFilter ? 'bg-[#2d2d35] border-indigo-500 text-indigo-400' : 'border-gray-700 text-gray-300 bg-[#1e1e24] hover:bg-[#2d2d35]'}`}
                    >
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                    </button>

                    {/* Filter Popover */}
                    {showFilter && (
                        <div className="absolute top-12 right-0 z-10 w-72 bg-[#1e1e24] rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 p-4 space-y-4 border border-gray-700">
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Department</label>
                                <select
                                    value={selectedDept}
                                    onChange={(e) => setSelectedDept(e.target.value)}
                                    className="block w-full text-sm bg-[#2d2d35] border-gray-700 text-white rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="">All Departments</option>
                                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Type</label>
                                <select
                                    value={selectedType}
                                    onChange={(e) => setSelectedType(e.target.value)}
                                    className="block w-full text-sm bg-[#2d2d35] border-gray-700 text-white rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="">All Types</option>
                                    {types.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Status</label>
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="block w-full text-sm bg-[#2d2d35] border-gray-700 text-white rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                    <option value="Permanent">Permanent</option>
                                    <option value="Probation">Probation</option>
                                </select>
                            </div>
                            <div className="flex justify-end pt-2">
                                <button
                                    onClick={() => { setSelectedDept(''); setSelectedType(''); setSelectedStatus(''); }}
                                    className="text-xs text-indigo-400 hover:text-indigo-300"
                                >
                                    Reset Filters
                                </button>
                            </div>
                        </div>
                    )}

                    <Link
                        href="/dashboard/employees/new"
                        className="inline-flex items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Add New Employee
                    </Link>
                </div>
            </div>

            {/* Table */}
            <div className="bg-[#1e1e24] rounded-lg shadow-lg ring-1 ring-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-800">
                        <thead className="bg-[#26262e]">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Employee Name
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Employee ID
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Department
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Designation
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Type
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Status
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-[#1e1e24] divide-y divide-gray-800">
                            {paginatedEmployees.map((employee) => (
                                <tr key={employee.id} className="hover:bg-[#2d2d35] transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 relative">
                                                {/* Avatar Placeholder */}
                                                <div className="h-10 w-10 rounded-full bg-[#2d2d35] flex items-center justify-center text-indigo-400 font-bold border border-gray-700">
                                                    {employee.first_name[0]}{employee.last_name[0]}
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-white">{employee.first_name} {employee.last_name}</div>
                                                <div className="text-sm text-gray-400">{employee.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">
                                        #{employee.id.slice(0, 8)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        {employee.department || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        {employee.job_title || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                        {employee.employment_type || 'Office'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${(employee.status || 'Active') === 'Active' ? 'bg-green-900/30 text-green-400 border border-green-800' : 'bg-gray-700/50 text-gray-400 border border-gray-600'
                                            }`}>
                                            {employee.status || 'Active'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex gap-3">
                                            <Link href={`/dashboard/employees/${employee.id}`} className="text-indigo-400 hover:text-indigo-300 transition-colors">
                                                <Eye className="h-5 w-5" />
                                            </Link>
                                            <Link href={`/dashboard/employees/${employee.id}/edit`} className="text-blue-400 hover:text-blue-300 transition-colors">
                                                <Pencil className="h-5 w-5" />
                                            </Link>
                                            <button onClick={() => handleDelete(employee.id)} className="text-red-400 hover:text-red-300 transition-colors">
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {filteredEmployees.length > 0 && (
                    <div className="bg-[#1e1e24] px-4 py-3 border-t border-gray-800 flex items-center justify-between sm:px-6">
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-400">
                                    Showing <span className="font-medium text-white">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-white">{Math.min(currentPage * itemsPerPage, filteredEmployees.length)}</span> of <span className="font-medium text-white">{filteredEmployees.length}</span> records
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-700 bg-[#2d2d35] text-sm font-medium text-gray-400 hover:bg-[#363640] disabled:opacity-50 disabled:bg-[#1e1e24]"
                                    >
                                        <span className="sr-only">Previous</span>
                                        <ChevronLeft className="h-5 w-5" />
                                    </button>
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentPage(i + 1)}
                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === i + 1
                                                ? 'z-10 bg-indigo-900/50 border-indigo-500 text-indigo-300'
                                                : 'bg-[#2d2d35] border-gray-700 text-gray-400 hover:bg-[#363640]'
                                                }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-700 bg-[#2d2d35] text-sm font-medium text-gray-400 hover:bg-[#363640] disabled:opacity-50 disabled:bg-[#1e1e24]"
                                    >
                                        <span className="sr-only">Next</span>
                                        <ChevronRight className="h-5 w-5" />
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
