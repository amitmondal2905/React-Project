'use client'

import React from "react";
import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Send, MapPin, Mail, Phone } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-[#1e1e24] border-t border-gray-800 text-gray-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

                    {/* Brand Column */}
                    <div>
                        <Link href="/" className="inline-block mb-6">
                            <span className="text-2xl font-bold text-white">HIRE<span className="text-indigo-500">Me</span></span>
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed mb-6">
                            Simplifying HR management and recruitment for modern businesses.
                            Build your dream team with our comprehensive solutions.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-[#2d2d35] flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all">
                                <Facebook className="h-5 w-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-[#2d2d35] flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all">
                                <Twitter className="h-5 w-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-[#2d2d35] flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all">
                                <Instagram className="h-5 w-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-[#2d2d35] flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all">
                                <Linkedin className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-semibold text-lg mb-6">Quick Links</h3>
                        <ul className="space-y-4">
                            <li>
                                <Link href="/" className="hover:text-indigo-400 transition-colors">Home</Link>
                            </li>
                            <li>
                                <Link href="#jobpromotion" className="hover:text-indigo-400 transition-colors">Find Jobs</Link>
                            </li>
                            <li>
                                <Link href="/careers" className="hover:text-indigo-400 transition-colors">Careers</Link>
                            </li>
                            <li>
                                <Link href="#contact" className="hover:text-indigo-400 transition-colors">Contact Us</Link>
                            </li>
                            <li>
                                <Link href="/admin/login" className="hover:text-indigo-400 transition-colors">Admin Login</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info (Repeated briefly for convenience) */}
                    <div>
                        <h3 className="text-white font-semibold text-lg mb-6">Contact</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                                <span className="text-sm">Embassy Tech Village,<br />Bengaluru, Karnataka 560103</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-indigo-500 shrink-0" />
                                <span className="text-sm">support@hireme.com</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="h-5 w-5 text-indigo-500 shrink-0" />
                                <span className="text-sm">+91 98765 43210</span>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="text-white font-semibold text-lg mb-6">Stay Updated</h3>
                        <p className="text-sm text-gray-400 mb-4">
                            Subscribe to our newsletter for the latest job openings and HR tips.
                        </p>
                        <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
                            <input
                                type="email"
                                placeholder="Your email"
                                className="w-full px-4 py-2 bg-[#2d2d35] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                            />
                            <button type="submit" className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                                <Send className="h-5 w-5" />
                            </button>
                        </form>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-500 text-center md:text-left">
                        © {new Date().getFullYear()} HIREMe. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-sm text-gray-500">
                        <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
                        <Link href="#" className="hover:text-white transition-colors">Cookie Policy</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
