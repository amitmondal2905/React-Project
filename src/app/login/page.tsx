'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Lock, Mail, Loader2, X } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw error

            // Link employee record if needed
            await supabase.rpc('link_employee_profile')

            // Check if user is an Admin
            const { data: employee } = await supabase
                .from('employees')
                .select('role')
                .eq('user_id', data.user.id)
                .single()

            if (employee?.role === 'Admin') {
                await supabase.auth.signOut()
                setError('Access Denied: Admins must use the Admin Login page.')
                setLoading(false)
                return
            }

            router.push('/dashboard')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleBackdropClick = (e: React.MouseEvent) => {
        // Close modal when clicking the backdrop (not the content)
        if (e.target === e.currentTarget) {
            router.push('/')
        }
    }

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={handleBackdropClick}
        >
            <div className="relative max-w-md w-full space-y-8 p-8 bg-[#1e1e24] rounded-xl shadow-xl border border-gray-800">
                {/* Close button */}
                <button
                    onClick={() => router.push('/')}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                    aria-label="Close"
                >
                    <X className="h-6 w-6" />
                </button>

                <div className="text-center">
                    <h2 className="text-3xl font-bold text-white">Employee Login</h2>
                    <p className="mt-2 text-sm text-gray-400">
                        Sign in to access your employee dashboard
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-2.5 bg-[#2d2d35] border border-gray-700 placeholder-gray-500 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-colors duration-200"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="appearance-none rounded-lg relative block w-full pl-10 px-3 py-2.5 bg-[#2d2d35] border border-gray-700 placeholder-gray-500 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-colors duration-200"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-400 text-sm text-center bg-red-900/20 p-2 rounded-md border border-red-800">
                            {error}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin h-5 w-5" />
                            ) : (
                                'Sign in'
                            )}
                        </button>
                    </div>
                    <div className="text-center space-y-2">
                        <p className="text-sm text-gray-400">
                            Don't have an account?{' '}
                            <Link href="/signup" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                                Sign up
                            </Link>
                        </p>
                        <p className="text-sm text-gray-400">
                            Are you an admin?{' '}
                            <Link href="/admin/login" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                                Admin Login
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    )
}
