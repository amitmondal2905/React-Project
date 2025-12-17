'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Loader2, Upload, User, Briefcase, FileText, Lock, CheckCircle2, Camera, Calendar, MapPin } from 'lucide-react'
import { Employee } from '@/types/employee'
import { toast } from 'react-hot-toast'

interface EmployeeFormProps {
    initialData?: Employee
}

const STEPS = [
    { id: 0, title: 'Personal Information', icon: User },
    { id: 1, title: 'Professional Information', icon: Briefcase },
    { id: 2, title: 'Documents', icon: FileText },
    { id: 3, title: 'Account Access', icon: Lock },
]

export default function EmployeeForm({ initialData }: EmployeeFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [currentStep, setCurrentStep] = useState(0)

    // File states
    const [file, setFile] = useState<File | null>(null) // CV
    const [photoFile, setPhotoFile] = useState<File | null>(null) // Profile Photo
    const [appointmentLetter, setAppointmentLetter] = useState<File | null>(null)
    const [salarySlips, setSalarySlips] = useState<File | null>(null)
    const [relivingLetter, setRelivingLetter] = useState<File | null>(null)
    const [experienceLetter, setExperienceLetter] = useState<File | null>(null)

    const [formData, setFormData] = useState({
        // Personal
        first_name: '',
        last_name: '',
        phone: '', // Mobile Number
        email: '',
        date_of_birth: '',
        marital_status: '',
        gender: '',
        nationality: '',
        address: '',
        city: '',
        state: '',
        zip_code: '',

        // Professional
        job_title: '',
        department: '',
        date_of_joining: '',
        employment_type: 'Office',
        status: 'Active',
        // New Professional Fields
        user_name: '',
        working_days: '5 Days',
        office_location: '',
        // Account Access
        slack_id: '',
        skype_id: '',
        github_id: '',
    })

    useEffect(() => {
        if (initialData) {
            setFormData({
                first_name: initialData.first_name || '',
                last_name: initialData.last_name || '',
                phone: initialData.phone || '',
                email: initialData.email || '',
                date_of_birth: initialData.date_of_birth || '',
                marital_status: initialData.marital_status || '',
                gender: initialData.gender || '',
                nationality: initialData.nationality || '',
                address: initialData.address || '',
                city: initialData.city || '',
                state: initialData.state || '',
                zip_code: initialData.zip_code || '',

                job_title: initialData.job_title || '',
                department: initialData.department || '',
                date_of_joining: initialData.date_of_joining ? initialData.date_of_joining.split('T')[0] : '',
                employment_type: initialData.employment_type || 'Office',
                status: initialData.status || 'Active',

                user_name: initialData.user_name || '',
                working_days: initialData.working_days || '5 Days',
                office_location: initialData.office_location || '',

                slack_id: initialData.slack_id || '',
                skype_id: initialData.skype_id || '',
                github_id: initialData.github_id || '',
            })
        }
    }, [initialData])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setPhotoFile(e.target.files[0])
        }
    }

    const validateStep = (step: number) => {
        if (step === 0) {
            if (!formData.first_name || !formData.last_name || !formData.email || !formData.phone) {
                toast.error('Please fill in all required fields.')
                return false
            }
            // Basic email validation
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                toast.error('Please enter a valid email address.')
                return false
            }
        }
        if (step === 1) {
            if (!formData.job_title || !formData.department || !formData.date_of_joining || !formData.office_location) {
                toast.error('Please fill in all required fields.')
                return false
            }
        }
        return true
    }

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1))
        }
    }

    const handleBack = () => {
        setCurrentStep(prev => Math.max(prev - 1, 0))
    }

    const handleSubmit = async () => {
        setLoading(true)

        try {
            let cv_url = initialData?.cv_url || null
            let photo_url = initialData?.photo_url || null
            let appointment_letter_url = initialData?.appointment_letter_url || null
            let salary_slips_url = initialData?.salary_slips_url || null
            let reliving_letter_url = initialData?.reliving_letter_url || null
            let experience_letter_url = initialData?.experience_letter_url || null

            // Helper function to upload file
            const uploadFile = async (file: File, bucket: string, prefix: string) => {
                const fileExt = file.name.split('.').pop()
                const fileName = `${prefix}-${Date.now()}-${Math.random()}.${fileExt}`
                const { error: uploadError } = await supabase.storage
                    .from(bucket)
                    .upload(fileName, file)

                if (uploadError) {
                    console.error(`Error uploading ${prefix}:`, uploadError)
                    return null
                }

                const { data: { publicUrl } } = supabase.storage
                    .from(bucket)
                    .getPublicUrl(fileName)
                return publicUrl
            }

            // Upload Photo if selected
            if (photoFile) {
                const url = await uploadFile(photoFile, 'avatars', 'photo')
                if (url) photo_url = url
            }

            // Upload Documents if selected
            if (appointmentLetter) {
                const url = await uploadFile(appointmentLetter, 'documents', 'appointment')
                if (url) appointment_letter_url = url
            }

            if (salarySlips) {
                const url = await uploadFile(salarySlips, 'documents', 'salary')
                if (url) salary_slips_url = url
            }

            if (relivingLetter) {
                const url = await uploadFile(relivingLetter, 'documents', 'reliving')
                if (url) reliving_letter_url = url
            }

            if (experienceLetter) {
                const url = await uploadFile(experienceLetter, 'documents', 'experience')
                if (url) experience_letter_url = url
            }

            const payload = {
                ...formData,
                cv_url,
                photo_url,
                appointment_letter_url,
                salary_slips_url,
                reliving_letter_url,
                experience_letter_url
            }

            if (initialData) {
                const { error } = await supabase
                    .from('employees')
                    .update(payload)
                    .eq('id', initialData.id)
                if (error) throw error
            } else {
                const { error } = await supabase
                    .from('employees')
                    .insert([payload])
                if (error) throw error
            }


            toast.success(initialData ? 'Employee updated successfully' : 'Employee created successfully')
            router.push('/dashboard/employees')
            router.refresh()
        } catch (error: any) {
            toast.error('Error saving employee: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    const renderPersonalStep = () => (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Photo Upload */}
            <div className="mb-8">
                <div className="relative group w-32 h-32 mx-auto sm:mx-0">
                    <div className="w-32 h-32 rounded-2xl bg-[#2d2d35] border-2 border-dashed border-gray-600 flex items-center justify-center overflow-hidden">
                        {photoFile ? (
                            <img src={URL.createObjectURL(photoFile)} alt="Preview" className="w-full h-full object-cover" />
                        ) : initialData?.photo_url ? (
                            <img src={initialData.photo_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <Camera className="h-10 w-10 text-gray-400" />
                        )}
                    </div>
                    <label htmlFor="photo-upload" className="absolute bottom-0 right-0 bg-indigo-600 p-2 rounded-full cursor-pointer hover:bg-indigo-700 transition-colors shadow-lg">
                        <Upload className="h-4 w-4 text-white" />
                        <input id="photo-upload" type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                    </label>
                </div>
                <p className="mt-2 text-xs text-gray-500 text-center sm:text-left">
                    Allowed *.jpeg, *.jpg, *.png, *.gif
                    <br /> Max size of 3.1 MB
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-400">First Name <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        placeholder="Enter first name"
                        className="w-full bg-[#2d2d35] border border-gray-700 rounded-lg py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-400">Last Name <span className="text-red-500">*</span></label>
                    <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        placeholder="Enter last name"
                        className="w-full bg-[#2d2d35] border border-gray-700 rounded-lg py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-400">Mobile Number <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Enter mobile number"
                            className="w-full bg-[#2d2d35] border border-gray-700 rounded-lg py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-400">Email Address <span className="text-red-500">*</span></label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter email address"
                        className="w-full bg-[#2d2d35] border border-gray-700 rounded-lg py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-400">Date of Birth</label>
                    <input
                        type="date"
                        name="date_of_birth"
                        value={formData.date_of_birth}
                        onChange={handleChange}
                        className="w-full bg-[#2d2d35] border border-gray-700 rounded-lg py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors [color-scheme:dark]"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-400">Marital Status</label>
                    <select
                        name="marital_status"
                        value={formData.marital_status}
                        onChange={handleChange}
                        className="w-full bg-[#2d2d35] border border-gray-700 rounded-lg py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors appearance-none"
                    >
                        <option value="">Select Status</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                    </select>
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-400">Gender</label>
                    <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full bg-[#2d2d35] border border-gray-700 rounded-lg py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors appearance-none"
                    >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-400">Nationality</label>
                    <input
                        type="text"
                        name="nationality"
                        value={formData.nationality}
                        onChange={handleChange}
                        placeholder="Enter nationality"
                        className="w-full bg-[#2d2d35] border border-gray-700 rounded-lg py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                </div>

                <div className="md:col-span-2 space-y-1">
                    <label className="text-sm font-medium text-gray-400">Address</label>
                    <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Enter full address"
                        className="w-full bg-[#2d2d35] border border-gray-700 rounded-lg py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-400">City</label>
                    <select
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full bg-[#2d2d35] border border-gray-700 rounded-lg py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors appearance-none"
                    >
                        {/* Populated dynamically or hardcoded for now */}
                        <option value="">Select City</option>
                        <option value="New York">New York</option>
                        <option value="London">London</option>
                        <option value="Dubai">Dubai</option>
                    </select>
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-400">State</label>
                    <select
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className="w-full bg-[#2d2d35] border border-gray-700 rounded-lg py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors appearance-none"
                    >
                        <option value="">Select State</option>
                        <option value="NY">New York</option>
                        <option value="CA">California</option>
                        <option value="DXB">Dubai</option>
                    </select>
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-400">ZIP Code</label>
                    <select
                        name="zip_code"
                        value={formData.zip_code}
                        onChange={handleChange}
                        className="w-full bg-[#2d2d35] border border-gray-700 rounded-lg py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors appearance-none"
                    >
                        <option value="">Select ZIP Code</option>
                        <option value="10001">10001</option>
                        <option value="90210">90210</option>
                    </select>
                </div>
            </div>
        </div>
    )

    const renderProfessionalStep = () => (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-400">Employee ID</label>
                <input
                    type="text"
                    value={initialData?.id ? '#' + initialData.id.slice(0, 8) : 'Auto-generated'}
                    disabled
                    className="w-full bg-[#1e1e24] border border-gray-800 rounded-lg py-2.5 px-4 text-gray-500 cursor-not-allowed"
                />
            </div>
            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-400">User Name</label>
                <input
                    type="text"
                    name="user_name"
                    value={formData.user_name}
                    onChange={handleChange}
                    placeholder="User Name"
                    className="w-full bg-[#2d2d35] border border-gray-700 rounded-lg py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
            </div>

            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-400">Select Employee Type</label>
                <select
                    name="employment_type"
                    value={formData.employment_type}
                    onChange={handleChange}
                    className="w-full bg-[#2d2d35] border border-gray-700 rounded-lg py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors appearance-none"
                >
                    <option value="Office">Office</option>
                    <option value="Remote">Remote</option>
                    <option value="Contract">Contract</option>
                </select>
            </div>
            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-400">Email Address</label>
                <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full bg-[#1e1e24] border border-gray-800 rounded-lg py-2.5 px-4 text-gray-500 cursor-not-allowed"
                />
            </div>

            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-400">Select Department <span className="text-red-500">*</span></label>
                <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full bg-[#2d2d35] border border-gray-700 rounded-lg py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors appearance-none"
                >
                    <option value="">Select Department</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="Product">Product</option>
                    <option value="Marketing">Marketing</option>
                    <option value="HR">HR</option>
                </select>
            </div>
            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-400">Enter Designation <span className="text-red-500">*</span></label>
                <input
                    type="text"
                    name="job_title"
                    value={formData.job_title}
                    onChange={handleChange}
                    placeholder="e.g. Senior Developer"
                    className="w-full bg-[#2d2d35] border border-gray-700 rounded-lg py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
            </div>

            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-400">Select Working Days</label>
                <select
                    name="working_days"
                    value={formData.working_days}
                    onChange={handleChange}
                    className="w-full bg-[#2d2d35] border border-gray-700 rounded-lg py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors appearance-none"
                >
                    <option value="5 Days">5 Days</option>
                    <option value="6 Days">6 Days</option>
                </select>
            </div>
            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-400">Select Joining Date <span className="text-red-500">*</span></label>
                <input
                    type="date"
                    name="date_of_joining"
                    value={formData.date_of_joining}
                    onChange={handleChange}
                    className="w-full bg-[#2d2d35] border border-gray-700 rounded-lg py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors [color-scheme:dark]"
                />
            </div>

            <div className="md:col-span-2 space-y-1">
                <label className="text-sm font-medium text-gray-400">Select Office Location <span className="text-red-500">*</span></label>
                <select
                    name="office_location"
                    value={formData.office_location}
                    onChange={handleChange}
                    className="w-full bg-[#2d2d35] border border-gray-700 rounded-lg py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors appearance-none"
                >
                    <option value="">Select Location</option>
                    <option value="New York HQ">New York HQ</option>
                    <option value="London Office">London Office</option>
                    <option value="Dubai Branch">Dubai Branch</option>
                    <option value="Remote">Remote</option>
                </select>
            </div>
        </div>
    )

    const renderDocumentsStep = () => {
        const DocumentUpload = ({ label, file, setFile }: { label: string, file: File | null, setFile: (file: File | null) => void }) => {
            const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                if (e.target.files && e.target.files[0]) {
                    setFile(e.target.files[0])
                }
            }

            const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
                e.preventDefault()
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    setFile(e.dataTransfer.files[0])
                }
            }

            const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
                e.preventDefault()
            }

            return (
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">{label}</label>
                    <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-indigo-500 transition-colors cursor-pointer bg-[#1e1e24]"
                    >
                        <input
                            type="file"
                            id={`file-${label.replace(/\s+/g, '-').toLowerCase()}`}
                            className="hidden"
                            accept=".jpeg,.jpg,.pdf"
                            onChange={handleFileChange}
                        />
                        <label htmlFor={`file-${label.replace(/\s+/g, '-').toLowerCase()}`} className="cursor-pointer">
                            <div className="mx-auto w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center mb-3">
                                <Upload className="h-6 w-6 text-white" />
                            </div>
                            {file ? (
                                <p className="text-sm text-white font-medium">{file.name}</p>
                            ) : (
                                <>
                                    <p className="text-sm text-gray-300">
                                        Drag & Drop or <span className="text-indigo-400">choose file</span> to upload
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">Supported formats: .jpeg, .pdf</p>
                                </>
                            )}
                        </label>
                    </div>
                </div>
            )
        }

        return (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                <DocumentUpload label="Upload Appointment Letter" file={appointmentLetter} setFile={setAppointmentLetter} />
                <DocumentUpload label="Upload Salary Slips" file={salarySlips} setFile={setSalarySlips} />
                <DocumentUpload label="Upload Reliving Letter" file={relivingLetter} setFile={setRelivingLetter} />
                <DocumentUpload label="Upload CV / Resume" file={experienceLetter} setFile={setExperienceLetter} />
            </div>
        )
    }

    const renderAccountAccessStep = () => (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-400">Enter Email Address</label>
                <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full bg-[#1e1e24] border border-gray-800 rounded-lg py-2.5 px-4 text-gray-500 cursor-not-allowed"
                />
            </div>
            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-400">Enter Slack ID</label>
                <input
                    type="text"
                    name="slack_id"
                    value={formData.slack_id}
                    onChange={handleChange}
                    placeholder="Enter Slack ID"
                    className="w-full bg-[#2d2d35] border border-gray-700 rounded-lg py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
            </div>

            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-400">Enter Skype ID</label>
                <input
                    type="text"
                    name="skype_id"
                    value={formData.skype_id}
                    onChange={handleChange}
                    placeholder="Enter Skype ID"
                    className="w-full bg-[#2d2d35] border border-gray-700 rounded-lg py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
            </div>
            <div className="space-y-1">
                <label className="text-sm font-medium text-gray-400">Enter GitHub ID</label>
                <input
                    type="text"
                    name="github_id"
                    value={formData.github_id}
                    onChange={handleChange}
                    placeholder="Enter GitHub ID"
                    className="w-full bg-[#2d2d35] border border-gray-700 rounded-lg py-2.5 px-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
            </div>
        </div>
    )

    return (
        <div className="max-w-5xl mx-auto">
            {/* Steps Navigation */}
            <div className="mb-8 overflow-x-auto pb-2">
                <nav className="flex space-x-2 min-w-max" aria-label="Tabs">
                    {STEPS.map((step) => {
                        const Icon = step.icon
                        const isActive = currentStep === step.id
                        const isCompleted = currentStep > step.id

                        return (
                            <button
                                key={step.id}
                                onClick={() => isCompleted ? setCurrentStep(step.id) : null}
                                disabled={!isCompleted && !isActive}
                                className={`
                                    group inline-flex items-center py-3 px-6 rounded-t-lg font-medium text-sm transition-all border-b-2
                                    ${isActive
                                        ? 'border-indigo-500 text-indigo-400 bg-[#1e1e24]'
                                        : isCompleted
                                            ? 'border-transparent text-gray-400 hover:text-gray-300 cursor-pointer'
                                            : 'border-transparent text-gray-600 cursor-not-allowed opacity-60'
                                    }
                                `}
                            >
                                <Icon className={`
                                    mr-3 h-5 w-5
                                    ${isActive ? 'text-indigo-400' : isCompleted ? 'text-green-500' : 'text-gray-500'}
                                `} />
                                <span>{step.title}</span>
                            </button>
                        )
                    })}
                </nav>
                <div className="h-px bg-gray-800 -mt-px" />
            </div>

            {/* Form Content */}
            <div className="min-h-[400px]">
                {currentStep === 0 && renderPersonalStep()}
                {currentStep === 1 && renderProfessionalStep()}
                {currentStep === 2 && renderDocumentsStep()}
                {currentStep === 3 && renderAccountAccessStep()}
            </div>

            {/* Actions */}
            <div className="flex justify-end pt-8 mt-8 border-t border-gray-800 gap-4">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-2.5 border border-gray-700 text-gray-300 rounded-lg hover:bg-[#2d2d35] transition-colors"
                >
                    Cancel
                </button>

                {currentStep > 0 && (
                    <button
                        type="button"
                        onClick={handleBack}
                        className="px-6 py-2.5 border border-gray-700 text-white rounded-lg hover:bg-[#2d2d35] transition-colors"
                    >
                        Previous
                    </button>
                )}

                {currentStep < STEPS.length - 1 ? (
                    <button
                        type="button"
                        onClick={handleNext}
                        className="px-8 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-900/20"
                    >
                        Next
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="inline-flex items-center px-8 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-900/20 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : null}
                        Submit
                    </button>
                )}
            </div>
        </div>
    )
}
