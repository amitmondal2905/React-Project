export interface JobOpening {
    id: string
    title: string
    department: string
    description: string
    status: 'Open' | 'Closed'
    created_at: string
}

export interface Application {
    id: string
    job_opening_id: string
    candidate_name: string
    email: string
    phone?: string
    resume_url?: string
    skype_id?: string
    slack_id?: string
    github_id?: string
    status: 'Applied' | 'Interviewing' | 'Hired' | 'Rejected'
    created_at: string
    job_openings?: JobOpening // Joined data
}
