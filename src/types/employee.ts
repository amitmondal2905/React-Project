export interface Employee {
    id: string
    first_name: string
    last_name: string
    email: string
    phone?: string
    job_title?: string
    department?: string
    date_of_joining?: string
    cv_url?: string
    annual_leave_balance: number
    sick_leave_balance: number
    created_at: string
    status?: string
    photo_url?: string
    employment_type?: string
    // New Fields for Personal Info
    date_of_birth?: string
    marital_status?: string
    gender?: string
    nationality?: string
    address?: string
    city?: string
    state?: string
    zip_code?: string
    // New Fields for Professional Info
    user_name?: string
    working_days?: string
    office_location?: string
    // New Fields for Account Access
    slack_id?: string
    skype_id?: string
    github_id?: string
    // Document URLs
    appointment_letter_url?: string
    salary_slips_url?: string
    reliving_letter_url?: string
    experience_letter_url?: string
}
