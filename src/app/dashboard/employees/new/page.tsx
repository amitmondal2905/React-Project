import EmployeeForm from '@/components/employees/EmployeeForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NewEmployeePage() {
    return (
        <div className="min-h-screen bg-[#13131a] p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <Link
                        href="/dashboard/employees"
                        className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-4 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back to Employees
                    </Link>
                    <h1 className="text-2xl font-bold text-white">Add New Employee</h1>
                    <p className="mt-1 text-gray-400">Create a new employee profile and account.</p>
                </div>

                <div className="bg-[#1e1e24] rounded-xl shadow-xl border border-gray-800 overflow-hidden">
                    <div className="p-8">
                        <EmployeeForm />
                    </div>
                </div>
            </div>
        </div>
    )
}
