import { Employee } from './employee'

export interface LeaveRequest {
    id: string
    employee_id: string
    start_date: string
    end_date: string
    leave_type: 'Annual' | 'Sick' | 'Casual' | 'Other'
    reason: string
    status: 'Pending' | 'Approved' | 'Rejected'
    created_at: string
    employees?: Employee // Joined data
}
