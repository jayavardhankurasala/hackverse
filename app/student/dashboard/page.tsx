'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  PlusCircle,
  ClipboardList,
  Clock,
  PlayCircle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Inbox,
  AlertCircle,
  ChevronRight,
  Eye,
} from 'lucide-react'
import { StatCard } from '@/components/ui/StatCard'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { PriorityBadge } from '@/components/ui/PriorityBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingState } from '@/components/ui/LoadingState'
import { getCurrentDemoUser, getStudentRequests } from '@/lib/demo/demo-service'
import { DemoRequest, DemoUser } from '@/lib/demo/types'

export default function StudentDashboard() {
  const [currentUser, setCurrentUser] = useState<DemoUser | null>(null)
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 })
  const [recentRequests, setRecentRequests] = useState<DemoRequest[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = () => {
    const demoUser = getCurrentDemoUser()
    setCurrentUser(demoUser)

    // Load requests for student from demo service
    const reqs = getStudentRequests(demoUser.id)
    setStats({
      total: reqs.length,
      pending: reqs.filter((r) => r.status === 'SUBMITTED' || r.status === 'ASSIGNED').length,
      inProgress: reqs.filter((r) => r.status === 'IN_PROGRESS').length,
      resolved: reqs.filter((r) => r.status === 'RESOLVED' || r.status === 'CLOSED').length,
    })
    setRecentRequests(reqs.slice(0, 6))
    setLoading(false)
  }

  useEffect(() => {
    loadData()

    const handleDataChange = () => loadData()
    window.addEventListener('demo-user-changed', handleDataChange)
    window.addEventListener('demo-data-changed', handleDataChange)

    return () => {
      window.removeEventListener('demo-user-changed', handleDataChange)
      window.removeEventListener('demo-data-changed', handleDataChange)
    }
  }, [])

  if (loading) {
    return <LoadingState message="Loading your campus service dashboard..." />
  }

  const firstName = currentUser?.name?.split(' ')[0] || 'Student'

  return (
    <div className="space-y-8 pb-12 font-sans">
      {/* Top Welcome Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Campus Service Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Good morning, {firstName}
          </h1>
          <p className="text-sm text-slate-600 font-normal">
            Track your open service tickets, request updates, and log new campus issues.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/student/requests"
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 transition-all flex items-center gap-2 shadow-2xs"
          >
            <ClipboardList className="w-4 h-4 text-slate-500" />
            <span>View All</span>
          </Link>

          <Link
            href="/student/requests/new"
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-2xs transition-all flex items-center gap-2 hover:scale-[1.01]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report a Problem</span>
          </Link>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Requests"
          value={stats.total}
          subtitle="All submitted requests"
          icon={ClipboardList}
          color="green"
        />

        <StatCard
          title="Pending"
          value={stats.pending}
          subtitle="Awaiting technician assignment"
          icon={Clock}
          color="blue"
        />

        <StatCard
          title="In Progress"
          value={stats.inProgress}
          subtitle="Actively being serviced"
          icon={PlayCircle}
          color="amber"
        />

        <StatCard
          title="Resolved"
          value={stats.resolved}
          subtitle="Successfully completed"
          icon={CheckCircle2}
          color="emerald"
        />
      </div>

      {/* Recent Requests Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent Service Requests</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Live status updates on your reported campus maintenance tickets
            </p>
          </div>
          <Link
            href="/student/requests"
            className="text-sm font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>See full history</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {recentRequests.length === 0 ? (
          <div className="p-10 text-center">
            <EmptyState
              title="No Requests Yet"
              description="You haven't submitted any service requests yet."
              actionLabel="Report a Problem"
              actionHref="/student/requests/new"
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Ticket ID</th>
                  <th className="py-3.5 px-6">Problem Title</th>
                  <th className="py-3.5 px-6">Category</th>
                  <th className="py-3.5 px-6">Priority</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Submitted</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {recentRequests.map((req) => (
                  <tr
                    key={req.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="py-4 px-6 font-mono text-xs font-bold text-emerald-800 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                        {req.ticketNumber}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-900 line-clamp-1 max-w-sm group-hover:text-emerald-700 transition-colors">
                        {req.title}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {req.location} {req.room ? `• Room ${req.room}` : ''}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-700 whitespace-nowrap">
                      {req.category}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <PriorityBadge priority={req.priority} />
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="py-4 px-6 text-slate-500 text-xs whitespace-nowrap">
                      {new Date(req.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <Link
                        href={`/student/requests/${req.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
