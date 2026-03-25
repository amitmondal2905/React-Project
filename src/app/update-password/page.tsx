'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Lock, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function UpdatePasswordPage() {
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { error } = await supabase.auth.updateUser({ password })

            if (error) throw error

            toast.success('Password updated successfully!')
            router.push('/dashboard')
        } catch (error: any) {
            toast.error('Error updating password: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#13131a] p-4">
            <div className="max-w-md w-full p-8 bg-[#1e1e24] rounded-xl shadow-xl border border-gray-800">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white">Reset Password</h2>
                    <p className="mt-2 text-sm text-gray-400">
                        Enter a new secure password for your account
                    </p>
                </div>
                
                <form className="space-y-6" onSubmit={handleUpdatePassword}>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="password"
                            required
                            className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-2.5 bg-[#2d2d35] border border-gray-700 placeholder-gray-500 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                            placeholder="New Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2.5 px-4 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all shadow-md"
                    >
                        {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : 'Confirm New Password'}
                    </button>
                </form>
            </div>
        </div>
    )
}
