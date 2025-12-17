'use client'

import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react'

export interface StatCardData {
    name: string
    value: number | string
    icon: LucideIcon
    change: string
    trend: 'up' | 'down' | 'neutral'
    color: string
    bg: string
    border: string
}

interface StatsGridProps {
    statCards: StatCardData[]
    isLoading: boolean
}

export default function StatsGrid({ statCards, isLoading }: StatsGridProps) {
    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((stat) => (
                <div
                    key={stat.name}
                    className="bg-[#1e1e24] border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-colors"
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <div className={`p-3 rounded-xl inline-flex ${stat.bg} ${stat.color} mb-4`}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                            <p className="text-sm font-medium text-gray-400">{stat.name}</p>
                            <h3 className="text-3xl font-bold text-white mt-1">
                                {isLoading ? '...' : stat.value}
                            </h3>
                            <p className="text-xs text-gray-500 mt-4">Update: {new Date().toLocaleDateString()}</p>
                        </div>
                        <div className={`flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${stat.trend === 'up' ? 'bg-green-900/30 text-green-400' :
                                stat.trend === 'down' ? 'bg-red-900/30 text-red-400' :
                                    'bg-gray-800 text-gray-400'
                            }`}>
                            {stat.trend === 'up' ? <ArrowUpRight className="h-3 w-3 mr-1" /> :
                                stat.trend === 'down' ? <ArrowDownRight className="h-3 w-3 mr-1" /> : null}
                            {stat.change}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
