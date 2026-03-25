'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter()

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY') {
                // When a user clicks a password reset link, they are redirected to the site
                // with a special recovery token, triggering this event.
                router.push('/update-password')
            }
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [router])

    return <>{children}</>
}
