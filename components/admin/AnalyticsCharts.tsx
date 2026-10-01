'use client'

import React from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts'
import { GlassCard } from '@/components/ui/GlassCard'
import { Sparkles, BarChart3, PieChart as PieIcon, Activity } from 'lucide-react'

interface AnalyticsChartsProps {
  statusData: { name: string; count: number }[]
  categoryData: { name: string; count: number }[]
  priorityData: { name: string; count: number; color: string }[]
  departmentData: { name: string; count: number }[]
  timelineData: { date: string; requests: number }[]
}

const STATUS_COLORS: Record<string, string> = {
  SUBMITTED: '#64748b',
  ASSIGNED: '#818cf8',
  IN_PROGRESS: '#38bdf8',
  RESOLVED: '#34d399',
  CLOSED: '#475569',
}

const CATEGORY_COLORS = ['#38bdf8', '#818cf8', '#f472b6', '#fb923c', '#34d399', '#22d3ee', '#a78bfa', '#facc15']

// Custom Dark Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/90 border border-slate-700/80 px-3.5 py-2.5 rounded-xl shadow-xl backdrop-blur-md text-xs">
        <p className="font-bold text-white mb-1">{label || payload[0]?.name}</p>
        <p className="text-cyan-400 font-semibold">
          Count: <span className="text-white">{payload[0]?.value}</span>
        </p>
      </div>
    )
  }
  return null
}

export function AnalyticsCharts({
  statusData,
  categoryData,
  priorityData,
  departmentData,
  timelineData,
}: AnalyticsChartsProps) {
  return (
    <div className="space-y-6">
      {/* Row 1: Timeline Over Time (Full width) */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Campus Service Intake Timeline (Last 14 Days)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Daily volume of newly logged student service requests</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
            Realtime Velocity
          </span>
        </div>

        <div className="h-72 w-full pt-2">
          {timelineData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-500 italic">
              No timeline intake activity recorded yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReqsDark" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#334155' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#334155' }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="requests" stroke="#06b6d4" strokeWidth={2.5} fillOpacity={1} fill="url(#colorReqsDark)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </GlassCard>

      {/* Row 2: Status & Priority (2 columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <GlassCard className="p-6">
          <div className="mb-4">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              <span>Requests by Lifecycle Status</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Active stage breakdown across platform operations</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: '#334155' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#334155' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Priority Distribution */}
        <GlassCard className="p-6">
          <div className="mb-4">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <PieIcon className="w-4 h-4 text-rose-400" />
              <span>Priority Level Distribution</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Urgency rating allocated across active campus tickets</p>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            {priorityData.every((p) => p.count === 0) ? (
              <div className="text-xs text-slate-500 italic">No tickets to display priority breakdown.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomTooltip />} />
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {priorityData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => <span className="text-xs text-slate-300 font-medium">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Row 3: Category & Department (2 columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <GlassCard className="p-6">
          <div className="mb-4">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <span>Top Request Categories</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Most common facility and infrastructure demands</p>
          </div>
          <div className="h-64 w-full">
            {categoryData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500 italic">
                No category data available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryData.slice(0, 6)}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 30, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: '#334155' }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={{ stroke: '#334155' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                    {categoryData.slice(0, 6).map((entry, index) => (
                      <Cell key={`cat-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </GlassCard>

        {/* Department Volume */}
        <GlassCard className="p-6">
          <div className="mb-4">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              <span>Volume by Campus Department</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Workload distribution across maintenance divisions</p>
          </div>
          <div className="h-64 w-full">
            {departmentData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500 italic">
                No departmental allocations recorded.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={departmentData}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: '#334155' }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={{ stroke: '#334155' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="#818cf8" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
