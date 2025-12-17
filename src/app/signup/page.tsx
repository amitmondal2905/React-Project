'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Lock, Mail, Loader2, UserPlus, X } from 'lucide-react'
import Link from 'next/link'

export default function SignUpPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const router = useRouter()

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
            })

            if (error) throw error

            // Try to link employee record immediately
            await supabase.rpc('link_employee_profile')

            setSuccess(true)
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

    if (success) {
        return (
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                onClick={handleBackdropClick}
            >
                <div className="relative max-w-md w-full p-8 bg-[#1e1e24] rounded-xl shadow-xl border border-gray-800 text-center">
                    {/* Close button */}
                    <button
                        onClick={() => router.push('/')}
                        className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                        aria-label="Close"
                    >
                        <X className="h-6 w-6" />
                    </button>

                    <h2 className="text-2xl font-bold text-green-400 mb-4">Registration Successful!</h2>
                    <p className="text-gray-400 mb-6">
                        Please check your email to confirm your account. Once confirmed, you can log in.
                    </p>
                    <Link
                        href="/login"
                        className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Go to Login
                    </Link>
                </div>
            </div>
        )
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
                    <h2 className="text-3xl font-bold text-white">Employee Sign Up</h2>
                    <p className="mt-2 text-sm text-gray-400">
                        Create your employee account
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSignUp}>
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
                                autoComplete="new-password"
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
                                <>
                                    <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                        <UserPlus className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" aria-hidden="true" />
                                    </span>
                                    Sign Up
                                </>
                            )}
                        </button>
                    </div>
                    <div className="text-center space-y-2">
                        <p className="text-sm text-gray-400">
                            Already have an account?{' '}
                            <Link href="/login" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                                Sign in
                            </Link>
                        </p>
                        <p className="text-sm text-gray-400">
                            Are you an admin?{' '}
                            <Link href="/admin/signup" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                                Admin Signup
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    )
}
