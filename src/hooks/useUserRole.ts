'use client'

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'

export function useUserRole() {
    return useQuery({
        queryKey: ['user_role'],
        queryFn: async () => {
            // Get current user
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return null

            // Fetch employee record linked to this user
            const { data, error } = await supabase
                .from('employees')
                .select('id, role, first_name, last_name, email, annual_leave_balance, sick_leave_balance')
                .eq('user_id', user.id)
                .maybeSingle()

            if (error) {
                console.error('Error fetching user role:', error)
                return null
            }

            return data
        },
    })
}
