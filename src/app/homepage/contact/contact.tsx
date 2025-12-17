'use client'

import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, Loader2 } from "lucide-react";

export default function Contact() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setLoading(false);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 5000);
    };

    return (
        <section id="contact" className="py-20 bg-[#13131a] relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                    {/* Contact Info */}
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                            Get in <span className="text-indigo-500">Touch</span>
                        </h2>
                        <p className="text-gray-400 text-lg mb-12 leading-relaxed">
                            Have questions about our HR solutions? Need help with your application?
                            Our team is here to help you navigate your career journey.
                        </p>

                        <div className="space-y-8">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-[#1e1e24] rounded-lg flex items-center justify-center border border-gray-800 shrink-0">
                                    <MapPin className="h-6 w-6 text-indigo-500" />
                                </div>
                                <div>
                                    <h3 className="text-white font-semibold text-lg mb-1">Our Office</h3>
                                    <p className="text-gray-400">Embassy Tech Village, Outer Ring Road<br />Bengaluru, Karnataka 560103</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-[#1e1e24] rounded-lg flex items-center justify-center border border-gray-800 shrink-0">
                                    <Mail className="h-6 w-6 text-indigo-500" />
                                </div>
                                <div>
                                    <h3 className="text-white font-semibold text-lg mb-1">Email Us</h3>
                                    <p className="text-gray-400">support@hireme.com<br />careers@hireme.com</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-[#1e1e24] rounded-lg flex items-center justify-center border border-gray-800 shrink-0">
                                    <Phone className="h-6 w-6 text-indigo-500" />
                                </div>
                                <div>
                                    <h3 className="text-white font-semibold text-lg mb-1">Call Us</h3>
                                    <p className="text-gray-400">+91 98765 43210<br />Mon-Fri, 9am - 6pm IST</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-[#1e1e24] rounded-2xl p-8 border border-gray-800 shadow-xl">
                        {success ? (
                            <div className="h-[400px] flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                                    <Send className="h-8 w-8 text-green-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Message Sent!</h3>
                                <p className="text-gray-400">We'll get back to you as soon as possible.</p>
                                <button
                                    onClick={() => setSuccess(false)}
                                    className="mt-8 text-indigo-400 hover:text-indigo-300 font-medium"
                                >
                                    Send another message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-2">Name</label>
                                        <input
                                            type="text"
                                            id="name"
                                            required
                                            className="w-full px-4 py-3 bg-[#2d2d35] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                                        <input
                                            type="email"
                                            id="email"
                                            required
                                            className="w-full px-4 py-3 bg-[#2d2d35] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-gray-400 mb-2">Subject</label>
                                    <select
                                        id="subject"
                                        className="w-full px-4 py-3 bg-[#2d2d35] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                                    >
                                        <option value="general">General Inquiry</option>
                                        <option value="support">Technical Support</option>
                                        <option value="careers">Careers & HR</option>
                                        <option value="billing">Billing</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-400 mb-2">Message</label>
                                    <textarea
                                        id="message"
                                        rows={4}
                                        required
                                        className="w-full px-4 py-3 bg-[#2d2d35] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors resize-none"
                                        placeholder="How can we help you?"
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                                >
                                    {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <>Send Message <Send className="h-5 w-5" /></>}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
