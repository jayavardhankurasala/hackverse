'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  BarChart3,
  TrendingUp,
  Filter,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react'
import { AnalyticsCharts } from '@/components/admin/AnalyticsCharts'
import { StatCard } from '@/components/ui/StatCard'
import { LoadingState } from '@/components/ui/LoadingState'
import { getDemoRequests } from '@/lib/demo/demo-service'
import { DemoRequest } from '@/lib/demo/types'

export default function AdminAnalyticsPage() {
  const [requests, setRequests] = useState<DemoRequest[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = () => {
    const all = getDemoRequests()
    setRequests(all)
    setLoading(false)
  }

  useEffect(() => {
    loadData()

    const handleUpdate = () => loadData()
    window.addEventListener('demo-data-changed', handleUpdate)
    return () => window.removeEventListener('demo-data-changed', handleUpdate)
  }, [])

  if (loading) {
    return <LoadingState message="Loading administrative analytics telemetry..." />
  }

  const total = requests.length
  const resolved = requests.filter((r) => r.status === 'RESOLVED' || r.status === 'CLOSED').length
  const critical = requests.filter((r) => r.priority === 'CRITICAL').length
  const active = requests.filter((r) => r.status === 'SUBMITTED' || r.status === 'ASSIGNED' || r.status === 'IN_PROGRESS').length

  // Status breakdown
  const statuses = ['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']
  const statusData = statuses.map((s) => ({
    name: s,
    count: requests.filter((r) => r.status === s).length,
  }))

  // Category breakdown
  const categoryCounts: Record<string, number> = {}
  requests.forEach((r) => {
    categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1
  })
  const categoryData = Object.entries(categoryCounts).map(([name, count]) => ({
    name,
    count,
  }))

  // Priority breakdown
  const priorityData = [
    { name: 'LOW', count: requests.filter((r) => r.priority === 'LOW').length },
    { name: 'MEDIUM', count: requests.filter((r) => r.priority === 'MEDIUM').length },
    { name: 'HIGH', count: requests.filter((r) => r.priority === 'HIGH').length },
    { name: 'CRITICAL', count: critical },
  ]

  const timelineData = [
    { date: 'Day 1', requests: 4 },
    { date: 'Day 3', requests: 6 },
    { date: 'Day 6', requests: 3 },
    { date: 'Day 9', requests: 7 },
    { date: 'Day 12', requests: 9 },
    { date: 'Today', requests: requests.length },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      <div>
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Command Center</span>
        </Link>
      </div>

      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Campus Operations Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Realtime SLA compliance, category volume distribution, and service intake telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <span>94.2% On-Time SLA Benchmark</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Service Volume"
          value={total}
          subtitle="Requests analyzed"
          icon={BarChart3}
          color="green"
        />
        <StatCard
          title="Active Work Orders"
          value={active}
          subtitle="In pipeline"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Resolved Successfully"
          value={resolved}
          subtitle="Completed tickets"
          icon={CheckCircle2}
          color="emerald"
        />
      </div>

      {/* Charts Component */}
      <AnalyticsCharts
        statusData={statusData}
        categoryData={categoryData}
        priorityData={priorityData}
        departmentData={[]}
        timelineData={timelineData}
      />
    </div>
  )
}
