'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import { Employee } from '@/types/employee'
import { useParams, useRouter } from 'next/navigation'
import { Loader2, User, Briefcase, FileText, Lock, Calendar, ClipboardList, FolderOpen, Edit, ArrowLeft, Mail, Phone } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

const TABS = [
    { id: 0, title: 'Personal Information', icon: User },
    { id: 1, title: 'Professional Information', icon: Briefcase },
    { id: 2, title: 'Documents', icon: FileText },
    { id: 3, title: 'Account Access', icon: Lock },
]

type LeaveRequest = {
    id: string
    employee_id: string
    leave_type: string
    start_date: string
    end_date: string
    days: number
    reason: string
    status: string
    reporting_manager?: string
    created_at: string
}

type Project = {
    id: string
    employee_id: string
    project_name: string
    start_date: string
    finish_date: string | null
    status: string
    created_at: string
}

export default function EmployeeProfilePage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string
    const [currentTab, setCurrentTab] = useState(0)
    const [activeSection, setActiveSection] = useState('profile') // profile, leave, attendance, projects

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

    const { data: leaveRequests } = useQuery({
        queryKey: ['leave-requests', id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('leave_requests')
                .select('*')
                .eq('employee_id', id)
                .order('start_date', { ascending: false })

            if (error) throw error
            return data as LeaveRequest[]
        },
        enabled: activeSection === 'leave',
    })

    const { data: projects } = useQuery({
        queryKey: ['projects', id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq('employee_id', id)
                .order('start_date', { ascending: false })

            if (error) throw error
            return data as Project[]
        },
        enabled: activeSection === 'projects',
    })

    type AttendanceRecord = {
        id: string
        date: string
        check_in: string | null
        check_out: string | null
        break_duration: number
        status: string
    }

    const { data: attendanceRecords } = useQuery({
        queryKey: ['attendance-profile', id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('attendance')
                .select('*')
                .eq('employee_id', id)
                .order('date', { ascending: false })
                .limit(20)

            if (error) throw error
            return data as AttendanceRecord[]
        },
        enabled: activeSection === 'attendance',
    })

    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-indigo-600" /></div>
    if (error) return <div className="p-8 text-red-500">Error loading employee details</div>
    if (!employee) return <div className="p-8">Employee not found</div>

    const InfoField = ({ label, value }: { label: string; value: string | null | undefined }) => (
        <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</label>
            <p className="text-sm text-white">{value || 'N/A'}</p>
        </div>
    )

    const renderPersonalInfo = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <InfoField label="First Name" value={employee.first_name} />
            <InfoField label="Last Name" value={employee.last_name} />
            <InfoField label="Mobile Number" value={employee.phone} />
            <InfoField label="Email Address" value={employee.email} />
            <InfoField
                label="Date of Birth"
                value={employee.date_of_birth ? format(new Date(employee.date_of_birth), 'MMMM dd, yyyy') : null}
            />
            <InfoField label="Marital Status" value={employee.marital_status} />
            <InfoField label="Gender" value={employee.gender} />
            <InfoField label="Nationality" value={employee.nationality} />
            <div className="md:col-span-2">
                <InfoField label="Address" value={employee.address} />
            </div>
            <InfoField label="City" value={employee.city} />
            <InfoField label="State" value={employee.state} />
            <InfoField label="Zip Code" value={employee.zip_code} />
        </div>
    )

    const renderProfessionalInfo = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <InfoField label="Employee ID" value={employee.id ? '#' + employee.id.slice(0, 8) : null} />
            <InfoField label="User Name" value={employee.user_name} />
            <InfoField label="Employee Type" value={employee.employment_type} />
            <InfoField label="Email Address" value={employee.email} />
            <InfoField label="Department" value={employee.department} />
            <InfoField label="Designation" value={employee.job_title} />
            <InfoField label="Working Days" value={employee.working_days} />
            <InfoField
                label="Joining Date"
                value={employee.date_of_joining ? format(new Date(employee.date_of_joining), 'MMMM dd, yyyy') : null}
            />
            <div className="md:col-span-2">
                <InfoField label="Office Location" value={employee.office_location} />
            </div>
        </div>
    )

    const renderDocuments = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-[#13131a] border border-gray-800 rounded-lg">
                <p className="text-sm font-medium text-gray-400 mb-2">Appointment Letter</p>
                {employee.appointment_letter_url ? (
                    <a href={employee.appointment_letter_url} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-400 hover:text-indigo-300 underline">
                        Download
                    </a>
                ) : (
                    <p className="text-xs text-gray-500">Not uploaded</p>
                )}
            </div>
            <div className="p-6 bg-[#13131a] border border-gray-800 rounded-lg">
                <p className="text-sm font-medium text-gray-400 mb-2">Salary Slips</p>
                {employee.salary_slips_url ? (
                    <a href={employee.salary_slips_url} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-400 hover:text-indigo-300 underline">
                        Download
                    </a>
                ) : (
                    <p className="text-xs text-gray-500">Not uploaded</p>
                )}
            </div>
            <div className="p-6 bg-[#13131a] border border-gray-800 rounded-lg">
                <p className="text-sm font-medium text-gray-400 mb-2">Reliving Letter</p>
                {employee.reliving_letter_url ? (
                    <a href={employee.reliving_letter_url} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-400 hover:text-indigo-300 underline">
                        Download
                    </a>
                ) : (
                    <p className="text-xs text-gray-500">Not uploaded</p>
                )}
            </div>
            <div className="p-6 bg-[#13131a] border border-gray-800 rounded-lg">
                <p className="text-sm font-medium text-gray-400 mb-2">CV / Resume</p>
                {employee.experience_letter_url ? (
                    <a href={employee.experience_letter_url} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-400 hover:text-indigo-300 underline">
                        Download
                    </a>
                ) : (
                    <p className="text-xs text-gray-500">Not uploaded</p>
                )}
            </div>
        </div>
    )

    const renderAccountAccess = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <InfoField label="Email Address" value={employee.email} />
            <InfoField label="Slack ID" value={employee.slack_id} />
            <InfoField label="Skype ID" value={employee.skype_id} />
            <InfoField label="GitHub ID" value={employee.github_id} />
        </div>
    )

    const renderLeaveHistory = () => (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-gray-800">
                        <th className="text-left py-4 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                        <th className="text-left py-4 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Duration</th>
                        <th className="text-left py-4 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Days</th>
                        <th className="text-left py-4 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Reporting Manager</th>
                        <th className="text-left py-4 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {leaveRequests && leaveRequests.length > 0 ? (
                        leaveRequests.map((leave) => (
                            <tr key={leave.id} className="border-b border-gray-800 hover:bg-[#26262e] transition-colors">
                                <td className="py-4 px-4 text-sm text-white">
                                    {format(new Date(leave.start_date), 'MMM dd, yyyy')}
                                </td>
                                <td className="py-4 px-4 text-sm text-white">
                                    {format(new Date(leave.start_date), 'MMM dd')} - {format(new Date(leave.end_date), 'MMM dd')}
                                </td>
                                <td className="py-4 px-4 text-sm text-white">{leave.days} Days</td>
                                <td className="py-4 px-4 text-sm text-white">{leave.reporting_manager || 'N/A'}</td>
                                <td className="py-4 px-4">
                                    <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${leave.status === 'Approved'
                                        ? 'bg-green-900/30 text-green-400'
                                        : leave.status === 'Rejected'
                                            ? 'bg-red-900/30 text-red-400'
                                            : 'bg-yellow-900/30 text-yellow-400'
                                        }`}>
                                        {leave.status}
                                    </span>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={5} className="py-8 px-4 text-center text-gray-500">
                                No leave requests found
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )

    const SIDEBAR_ITEMS = [
        { id: 'profile', title: 'Profile', icon: User },
        { id: 'attendance', title: 'Attendance', icon: Calendar },
        { id: 'projects', title: 'Projects', icon: FolderOpen },
        { id: 'leave', title: 'Leave', icon: ClipboardList },
    ]

    return (
        <div className="flex min-h-screen bg-[#13131a]">
            {/* Left Sidebar */}
            <div className="w-64 bg-[#1e1e24] border-r border-gray-800 p-6">
                <div className="space-y-2">
                    {SIDEBAR_ITEMS.map((item) => {
                        const Icon = item.icon
                        const isActive = activeSection === item.id
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveSection(item.id)}
                                className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-gray-400 hover:bg-[#2d2d35] hover:text-white'
                                    }`}
                            >
                                <Icon className="h-5 w-5 mr-3" />
                                {item.title}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-8">
                {/* Header Card */}
                <div className="bg-[#1e1e24] border border-gray-800 rounded-xl p-6 mb-6">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            {/* Profile Photo */}
                            <div className="w-20 h-20 rounded-2xl bg-[#2d2d35] border border-gray-700 flex items-center justify-center overflow-hidden">
                                {employee.photo_url ? (
                                    <img src={employee.photo_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-2xl font-bold text-indigo-400">
                                        {employee.first_name[0]}{employee.last_name[0]}
                                    </span>
                                )}
                            </div>
                            {/* Name & Details */}
                            <div>
                                <h1 className="text-2xl font-bold text-white mb-1">
                                    {employee.first_name} {employee.last_name}
                                </h1>
                                <div className="flex items-center gap-3 text-sm text-gray-400">
                                    <div className="flex items-center gap-1.5">
                                        <Briefcase className="h-4 w-4" />
                                        {employee.job_title || 'N/A'}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <User className="h-4 w-4" />
                                        {employee.email}
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Edit Button */}
                        <Link
                            href={`/dashboard/employees/${id}/edit`}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                        >
                            <Edit className="h-4 w-4" />
                            Edit Profile
                        </Link>
                    </div>
                </div>

                {/* Profile Section */}
                {activeSection === 'profile' && (
                    <>
                        {/* Tabs */}
                        <div className="mb-6 overflow-x-auto pb-2">
                            <nav className="flex space-x-1 min-w-max bg-[#1e1e24] p-1 rounded-lg" aria-label="Tabs">
                                {TABS.map((tab) => {
                                    const Icon = tab.icon
                                    const isActive = currentTab === tab.id

                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setCurrentTab(tab.id)}
                                            className={`
                                                inline-flex items-center px-6 py-3 rounded-lg font-medium text-sm transition-all
                                                ${isActive
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'text-gray-400 hover:text-white hover:bg-[#2d2d35]'
                                                }
                                            `}
                                        >
                                            <Icon className="mr-2 h-4 w-4" />
                                            <span>{tab.title}</span>
                                        </button>
                                    )
                                })}
                            </nav>
                        </div>

                        {/* Tab Content */}
                        <div className="bg-[#1e1e24] border border-gray-800 rounded-xl p-8">
                            {currentTab === 0 && renderPersonalInfo()}
                            {currentTab === 1 && renderProfessionalInfo()}
                            {currentTab === 2 && renderDocuments()}
                            {currentTab === 3 && renderAccountAccess()}
                        </div>
                    </>
                )}

                {/* Leave Section */}
                {activeSection === 'leave' && (
                    <div className="bg-[#1e1e24] border border-gray-800 rounded-xl overflow-hidden">
                        {renderLeaveHistory()}
                    </div>
                )}

                {/* Attendance Section */}
                {activeSection === 'attendance' && (
                    <div className="bg-[#1e1e24] border border-gray-800 rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-800">
                                        <th className="text-left py-4 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                                        <th className="text-left py-4 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Check In</th>
                                        <th className="text-left py-4 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Check Out</th>
                                        <th className="text-left py-4 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Break</th>
                                        <th className="text-left py-4 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Working Hours</th>
                                        <th className="text-left py-4 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendanceRecords && attendanceRecords.length > 0 ? (
                                        attendanceRecords.map((record) => {
                                            const calculateWorkingHours = () => {
                                                if (!record.check_in || !record.check_out) return 'N/A'
                                                const checkIn = new Date(record.check_in)
                                                const checkOut = new Date(record.check_out)
                                                const totalMinutes = Math.floor((checkOut.getTime() - checkIn.getTime()) / (1000 * 60)) - (record.break_duration || 0)
                                                const hours = Math.floor(totalMinutes / 60)
                                                const minutes = totalMinutes % 60
                                                return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} Hrs`
                                            }

                                            const getStatusBadge = () => {
                                                if (!record.check_in) return { text: 'Absent', class: 'bg-gray-700/50 text-gray-400' }
                                                const checkInTime = new Date(record.check_in)
                                                const hours = checkInTime.getHours()
                                                const minutes = checkInTime.getMinutes()
                                                if (hours > 10 || (hours === 10 && minutes > 0)) {
                                                    return { text: 'Late', class: 'bg-red-900/30 text-red-400' }
                                                }
                                                return { text: 'On Time', class: 'bg-green-900/30 text-green-400' }
                                            }

                                            const statusBadge = getStatusBadge()

                                            return (
                                                <tr key={record.id} className="border-b border-gray-800 hover:bg-[#26262e] transition-colors">
                                                    <td className="py-4 px-4 text-sm text-white">
                                                        {format(new Date(record.date), 'MMM dd, yyyy')}
                                                    </td>
                                                    <td className="py-4 px-4 text-sm text-white">
                                                        {record.check_in ? format(new Date(record.check_in), 'hh:mm a') : '-'}
                                                    </td>
                                                    <td className="py-4 px-4 text-sm text-white">
                                                        {record.check_out ? format(new Date(record.check_out), 'hh:mm a') : '-'}
                                                    </td>
                                                    <td className="py-4 px-4 text-sm text-white">
                                                        {record.break_duration ? `${record.break_duration} Min` : '00:00 Min'}
                                                    </td>
                                                    <td className="py-4 px-4 text-sm text-white">
                                                        {calculateWorkingHours()}
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${statusBadge.class}`}>
                                                            {statusBadge.text}
                                                        </span>
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="py-8 px-4 text-center text-gray-500">
                                                No attendance records found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Projects Section */}
                {activeSection === 'projects' && (
                    <div className="bg-[#1e1e24] border border-gray-800 rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-800">
                                        <th className="text-left py-4 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Sr. No.</th>
                                        <th className="text-left py-4 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Project Name</th>
                                        <th className="text-left py-4 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Start Date</th>
                                        <th className="text-left py-4 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Finish Date</th>
                                        <th className="text-left py-4 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {projects && projects.length > 0 ? (
                                        projects.map((project, index) => (
                                            <tr key={project.id} className="border-b border-gray-800 hover:bg-[#26262e] transition-colors">
                                                <td className="py-4 px-4 text-sm text-white">{index + 1}</td>
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
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="py-8 px-4 text-center text-gray-500">
                                                No projects assigned
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
