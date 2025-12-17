'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function signupAdmin(prevState: any, formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string
    const secretCode = formData.get('secretCode') as string
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string

    // 1. Validate Secret Code
    if (secretCode !== process.env.ADMIN_SECRET_CODE) {
        return { error: 'Invalid Admin Secret Code' }
    }

    // 2. Validate Password Match
    if (password !== confirmPassword) {
        return { error: 'Passwords do not match' }
    }

    const cookieStore = await cookies()

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
                set(name: string, value: string, options: any) {
                    cookieStore.set({ name, value, ...options })
                },
                remove(name: string, options: any) {
                    cookieStore.set({ name, value: '', ...options })
                },
            },
        }
    )

    // 3. Create Auth User
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
    })

    if (authError) {
        return { error: authError.message }
    }

    if (!authData.user) {
        return { error: 'Failed to create user' }
    }

    // 4. Create Employee Record
    const { error: dbError } = await supabase
        .from('employees')
        .insert([
            {
                first_name: firstName,
                last_name: lastName,
                email: email,
                user_id: authData.user.id,
                role: 'Admin',
                position: 'Administrator',
                department: 'Management',
                hire_date: new Date().toISOString().split('T')[0],
                salary: 0,
                status: 'Active',
            },
        ])

    if (dbError) {
        // Optional: Delete the auth user if db insert fails to maintain consistency
        // await supabase.auth.admin.deleteUser(authData.user.id) 
        // (This typically requires service_role key, skipping for now as strict cleanup might be overkill for this MVP step)
        return { error: 'Database error: ' + dbError.message }
    }

    // Success - Redirect
    redirect('/admin/login')
}
