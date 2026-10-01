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
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { GlassCard } from '@/components/ui/GlassCard'
import { StatCard } from '@/components/ui/StatCard'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { PriorityBadge } from '@/components/ui/PriorityBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingState } from '@/components/ui/LoadingState'

export default function StudentDashboard() {
  const [userName, setUserName] = useState<string>('Student')
  const [stats, setStats] = useState({ total: 0, submitted: 0, inProgress: 0, resolved: 0 })
  const [recentRequests, setRecentRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Fetch student profile for personalized greeting
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('user_id', user.id)
          .maybeSingle()

        if (profile?.full_name) {
          setUserName(profile.full_name.split(' ')[0])
        }

        // Fetch requests
        const { data: requests } = await supabase
          .from('service_requests')
          .select('status, id, ticket_number, title, category, priority, created_at, location, building, room_number')
          .eq('created_by', user.id)
          .order('created_at', { ascending: false })

        if (requests) {
          setStats({
            total: requests.length,
            submitted: requests.filter((r) => r.status === 'SUBMITTED').length,
            inProgress: requests.filter((r) => r.status === 'IN_PROGRESS').length,
            resolved: requests.filter((r) => r.status === 'RESOLVED' || r.status === 'CLOSED').length,
          })
          setRecentRequests(requests.slice(0, 6))
        }
      } catch {
        // Fallback
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return <LoadingState message="Loading your campus service dashboard..." />
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Top Welcome Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/70 border border-blue-800/60 text-xs font-semibold text-blue-300 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Campus Service Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Good morning, {userName}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track your open maintenance tickets and submit new facilities requests.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/student/requests"
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-all flex items-center gap-2"
          >
            <ClipboardList className="w-4 h-4 text-slate-400" />
            <span>My Requests</span>
          </Link>

          <Link
            href="/student/requests/new"
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/25 border border-blue-400/30 transition-all flex items-center gap-2 hover:scale-[1.02]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Service Request</span>
          </Link>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Requests"
          value={stats.total}
          subtitle="All lifetime submissions"
          icon={ClipboardList}
          color="blue"
        />
        <StatCard
          title="Submitted"
          value={stats.submitted}
          subtitle="Awaiting technician dispatch"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="In Progress"
          value={stats.inProgress}
          subtitle="Technician actively working"
          icon={PlayCircle}
          color="purple"
        />
        <StatCard
          title="Resolved / Closed"
          value={stats.resolved}
          subtitle="Completed service requests"
          icon={CheckCircle2}
          color="emerald"
        />
      </div>

      {/* Recent Requests Section */}
      <GlassCard className="p-0 overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-800/80 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Recent Service Requests</h2>
            <p className="text-xs text-slate-400 mt-0.5">Your most recently logged maintenance issues</p>
          </div>
          <Link
            href="/student/requests"
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 inline-flex items-center gap-1"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentRequests.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={Inbox}
              title="No service requests yet"
              description="Have an electrical issue, plumbing repair, or IT malfunction? Create your first ticket to dispatch campus staff."
              actionLabel="Create Service Request"
              actionHref="/student/requests/new"
            />
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {recentRequests.map((req) => (
              <Link
                key={req.id}
                href={`/student/requests/${req.id}`}
                className="block p-4 sm:p-5 hover:bg-slate-800/40 transition-colors group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-bold text-blue-400">
                        {req.ticket_number}
                      </span>
                      <span className="text-slate-600">&bull;</span>
                      <h3 className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">
                        {req.title}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-400">
                      Category: <span className="text-slate-300">{req.category}</span>
                      {req.location && (
                        <>
                          {' '}&bull; Location: <span className="text-slate-300">{req.location}</span>
                        </>
                      )}
                      {' '}&bull; Logged: {new Date(req.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0">
                    <PriorityBadge priority={req.priority} />
                    <StatusBadge status={req.status} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  )
}
