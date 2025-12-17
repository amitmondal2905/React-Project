'use client'

import { MoreHorizontal } from 'lucide-react'

export default function AttendanceChart() {
    // Mock data for visual purpose to match the image
    const data = [
        { day: 'Mon', value: 85, color1: 'bg-purple-500', color2: 'bg-orange-400' },
        { day: 'Tue', value: 65, color1: 'bg-purple-500', color2: 'bg-orange-400' },
        { day: 'Wed', value: 90, color1: 'bg-purple-500', color2: 'bg-orange-400' },
        { day: 'Thu', value: 75, color1: 'bg-purple-500', color2: 'bg-orange-400' },
        { day: 'Fri', value: 80, color1: 'bg-purple-500', color2: 'bg-orange-400' },
        { day: 'Sat', value: 45, color1: 'bg-purple-500', color2: 'bg-orange-400' },
        { day: 'Sun', value: 50, color1: 'bg-purple-500', color2: 'bg-orange-400' },
    ]

    return (
        <div className="bg-[#1e1e24] border border-gray-800 rounded-2xl p-6 h-full">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold text-white">Attendance Overview</h3>
                <button className="text-gray-400 hover:text-white">
                    <span className="text-xs bg-[#2d2d35] px-3 py-1.5 rounded-lg border border-gray-700">Today</span>
                </button>
            </div>

            <div className="h-64 flex items-end justify-between gap-4 px-2">
                {/* Y-Axis Labels (Mock) */}
                {/* Visual only, real implementation would separate axis */}

                {data.map((item) => (
                    <div key={item.day} className="flex flex-col items-center flex-1 h-full justify-end group">
                        <div className="relative w-2 sm:w-3 h-full bg-[#2d2d35] rounded-full overflow-hidden flex flex-col justify-end">
                            {/* Stacked Bars */}
                            {/* Top part (Orange) */}
                            <div
                                className={`w-full ${item.color2} rounded-full absolute bottom-0 opacity-80 group-hover:opacity-100 transition-all duration-300`}
                                style={{ height: `${item.value}%`, marginBottom: `${item.value * 0.6}%` }} // Offset logic for stacked look
                            ></div>
                            {/* Bottom part (Purple) */}
                            <div
                                className={`w-full ${item.color1} rounded-full absolute bottom-0 opacity-80 group-hover:opacity-100 transition-all duration-300`}
                                style={{ height: `${item.value * 0.6}%` }}
                            ></div>
                        </div>
                        <span className="text-xs text-gray-500 mt-3 font-medium">{item.day}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
