import Link from 'next/link'
import { ArrowRight, Code, Palette, TrendingUp } from 'lucide-react'

export default function Hero() {
    return (
        <section className="relative bg-gradient-to-b from-[#1e1e24] to-[#13131a] pt-20 pb-32 overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-500 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">

                    {/* Headline */}
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                        It's Easy To Find
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                            YOUR DREAM JOB
                        </span>
                    </h1>

                    {/* Subheadline */}
                    <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
                        All-in-one platform for employee management, attendance tracking, leave requests, and recruitment. Built for modern teams.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                        <Link
                            href="/login"
                            className="group inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-semibold text-lg shadow-lg hover:shadow-indigo-500/50"
                        >
                            Get Started
                            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        <div className="bg-[#1e1e24] border border-gray-800 rounded-xl p-6 hover:border-indigo-500/50 transition-all">
                            <div className="w-12 h-12 bg-indigo-600/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                                <Code className="h-6 w-6 text-indigo-400" />
                            </div>
                            <h3 className="text-white font-semibold mb-2">Development & IT</h3>
                            <p className="text-gray-400 text-sm">Development and IT power career growth</p>
                        </div>

                        <div className="bg-[#1e1e24] border border-gray-800 rounded-xl p-6 hover:border-indigo-500/50 transition-all">
                            <div className="w-12 h-12 bg-indigo-600/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                                <Palette className="h-6 w-6 text-indigo-400" />
                            </div>
                            <h3 className="text-white font-semibold mb-2">Design & Creative</h3>
                            <p className="text-gray-400 text-sm">Design & Creative drive innovative careers</p>
                        </div>

                        <div className="bg-[#1e1e24] border border-gray-800 rounded-xl p-6 hover:border-indigo-500/50 transition-all">
                            <div className="w-12 h-12 bg-indigo-600/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                                <TrendingUp className="h-6 w-6 text-indigo-400" />
                            </div>
                            <h3 className="text-white font-semibold mb-2">Accounting & Finance</h3>
                            <p className="text-gray-400 text-sm">Accounting & Finance ensure financial growth</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}