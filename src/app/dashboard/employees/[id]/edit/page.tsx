'use client'

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import { useParams, useRouter } from 'next/navigation'
import { Employee } from '@/types/employee'
import EmployeeForm from '@/components/employees/EmployeeForm'
import { Loader2, ArrowLeft } from 'lucide-react'

export default function EditEmployeePage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string

    const { data: employee, isLoading, error } = useQuery({
        queryKey: ['employee', id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('employees')
                .select('*')
                .eq('id', id)
                .single()

            if (error) throw error
            return data as Employee
        },
    })

    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-indigo-600" /></div>
    if (error) return <div className="p-8 text-red-500">Error loading employee data</div>
    if (!employee) return <div className="p-8">Employee not found</div>

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <button
                onClick={() => router.back()}
                className="flex items-center text-white-600 hover:text-indigo-300 mb-6"
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
            </button>
            <h1 className="text-2xl font-bold text-white-900 mb-6">Edit Employee</h1>
            <EmployeeForm initialData={employee} />
        </div>
    )
}
