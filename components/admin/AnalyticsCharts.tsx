'use client'

import React from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts'
import { Activity, BarChart3, PieChart as PieIcon, Layers } from 'lucide-react'

interface AnalyticsChartsProps {
  statusData: { name: string; count: number }[]
  categoryData: { name: string; count: number }[]
  priorityData: { name: string; count: number; color?: string }[]
  departmentData: { name: string; count: number }[]
  timelineData: { date: string; requests: number }[]
}

const STATUS_COLORS: Record<string, string> = {
  SUBMITTED: '#64748B',
  ASSIGNED: '#818CF8',
  IN_PROGRESS: '#F59E0B',
  RESOLVED: '#16A34A',
  CLOSED: '#334155',
}

const CATEGORY_COLORS = [
  '#16A34A',
  '#2563EB',
  '#F59E0B',
  '#8B5CF6',
  '#0D9488',
  '#E11D48',
  '#64748B',
  '#475569',
]

// Professional Light Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 px-3 py-2 rounded-xl shadow-md text-xs font-sans">
        <p className="font-bold text-slate-800 mb-0.5">{label || payload[0]?.name}</p>
        <p className="text-emerald-700 font-semibold">
          Count: <span className="text-slate-900">{payload[0]?.value}</span>
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
    <div className="space-y-6 font-sans">
      {/* Row 1: Intake Timeline */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>Campus Service Intake Timeline (Last 14 Days)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Daily volume of newly logged student service requests
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            Intake Velocity
          </span>
        </div>

        <div className="h-64 w-full pt-2">
          {timelineData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">
              No timeline intake activity recorded yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReqsLight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16A34A" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#16A34A" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={{ stroke: '#E2E8F0' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} axisLine={{ stroke: '#E2E8F0' }} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="requests"
                  stroke="#16A34A"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorReqsLight)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Row 2: Category Breakdown & Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                <span>Requests by Service Category</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Distribution across campus trade disciplines</p>
            </div>
          </div>

          <div className="h-64 w-full">
            {categoryData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">
                No category data available yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} axisLine={{ stroke: '#E2E8F0' }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={{ stroke: '#E2E8F0' }} width={80} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} fill="#16A34A">
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Priority & Status Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <PieIcon className="w-4 h-4 text-emerald-600" />
                <span>Work Order Status Lifecycle</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Tickets by current resolution state</p>
            </div>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {statusData.length === 0 ? (
              <div className="text-xs text-slate-400 italic">No status data available yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomTooltip />} />
                  <Pie
                    data={statusData}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {statusData.map((entry, index) => (
                      <Cell
                        key={`pie-cell-${index}`}
                        fill={STATUS_COLORS[entry.name] || '#64748B'}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-[11px] font-medium text-slate-600">
            {statusData.map((s) => (
              <div key={s.name} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: STATUS_COLORS[s.name] || '#64748B' }}
                />
                <span>
                  {s.name}: <strong>{s.count}</strong>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
