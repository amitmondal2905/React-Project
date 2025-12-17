'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, Shield } from 'lucide-react'
import { signupAdmin } from '@/app/actions/adminAuth'
import { useRouter } from 'next/navigation'

export default function AdminSignupPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        const formData = new FormData(e.currentTarget)
        const result = await signupAdmin(null, formData)

        if (result?.error) {
            setError(result.error)
            setLoading(false)
        } else {
            // Redirect handles success, but we can double check
            // logic in server action usually redirects.
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#13131a] py-12">
            <div className="max-w-md w-full space-y-8 p-8 bg-[#1e1e24] rounded-xl shadow-xl border border-gray-800">
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        <Shield className="h-12 w-12 text-indigo-500" />
                    </div>
                    <h2 className="text-3xl font-bold text-white">Admin Sign Up</h2>
                    <p className="mt-2 text-sm text-gray-400">
                        Create an admin account with secret code
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded-lg text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="firstName" className="block text-sm font-medium text-gray-300">
                                    First Name
                                </label>
                                <input
                                    id="firstName"
                                    name="firstName"
                                    type="text"
                                    required
                                    className="mt-1 block w-full px-3 py-2.5 bg-[#2d2d35] border border-gray-700 rounded-lg shadow-sm text-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                                />
                            </div>
                            <div>
                                <label htmlFor="lastName" className="block text-sm font-medium text-gray-300">
                                    Last Name
                                </label>
                                <input
                                    id="lastName"
                                    name="lastName"
                                    type="text"
                                    required
                                    className="mt-1 block w-full px-3 py-2.5 bg-[#2d2d35] border border-gray-700 rounded-lg shadow-sm text-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="mt-1 block w-full px-3 py-2.5 bg-[#2d2d35] border border-gray-700 rounded-lg shadow-sm text-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                            />
                        </div>

                        <div>
                            <label htmlFor="secretCode" className="block text-sm font-medium text-gray-300">
                                Admin Secret Code
                            </label>
                            <input
                                id="secretCode"
                                name="secretCode"
                                type="password"
                                required
                                className="mt-1 block w-full px-3 py-2.5 bg-[#2d2d35] border border-gray-700 rounded-lg shadow-sm text-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                                placeholder="Enter admin secret code"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="mt-1 block w-full px-3 py-2.5 bg-[#2d2d35] border border-gray-700 rounded-lg shadow-sm text-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                className="mt-1 block w-full px-3 py-2.5 bg-[#2d2d35] border border-gray-700 rounded-lg shadow-sm text-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all"
                    >
                        {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Create Admin Account'}
                    </button>
                </form>

                <div className="text-center space-y-2">
                    <p className="text-sm text-gray-400">
                        Already have an admin account?{' '}
                        <Link href="/admin/login" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                            Sign in
                        </Link>
                    </p>
                    <p className="text-sm text-gray-400">
                        Are you an employee?{' '}
                        <Link href="/signup" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                            Employee Signup
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
