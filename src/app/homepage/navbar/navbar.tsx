"use client"


import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <nav className="bg-[#1e1e24] fixed w-full z-20 top-0 border-b border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-3">
                        <span className="text-2xl font-bold text-white">HIRE<span className="text-indigo-500">Me</span></span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:block">
                        <div className="flex items-center space-x-8">
                            <Link href="#home" className="text-white hover:text-indigo-400 transition-colors font-medium">
                                Home
                            </Link>
                            <Link href="#jobpromotion" className="text-gray-300 hover:text-indigo-400 transition-colors font-medium">
                                Job Promotion
                            </Link>
                            <Link href="#contact" className="text-gray-300 hover:text-indigo-400 transition-colors font-medium">
                                Contact
                            </Link>
                            <Link
                                href="/login"
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                            >
                                Login
                            </Link>
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-gray-300 hover:text-white p-2"
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-[#13131a] border-t border-gray-800">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        <Link
                            href="#home"
                            className="block px-3 py-2 text-white hover:bg-[#2d2d35] rounded-lg"
                            onClick={() => setIsOpen(false)}
                        >
                            Home
                        </Link>
                        <Link
                            href="#jobpromotion"
                            className="block px-3 py-2 text-gray-300 hover:bg-[#2d2d35] rounded-lg"
                            onClick={() => setIsOpen(false)}
                        >
                            Job Promotion
                        </Link>

                        <Link
                            href="#contact"
                            className="block px-3 py-2 text-gray-300 hover:bg-[#2d2d35] rounded-lg"
                            onClick={() => setIsOpen(false)}
                        >
                            Contact
                        </Link>
                        <Link
                            href="/login"
                            className="block px-3 py-2 mx-2 mt-2 text-center bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                            onClick={() => setIsOpen(false)}
                        >
                            Login
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    )
}
