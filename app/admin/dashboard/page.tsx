import Link from 'next/link'
import { redirect } from 'next/navigation'
import { 
  ClipboardList, 
  Clock, 
  PlayCircle, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Users, 
  BarChart3, 
  CheckCircle, 
  XCircle,
  Timer,
  ShieldCheck,
  AlertTriangle,
  UserCheck,
  MapPin,
  Sparkles,
  Layers
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PriorityBadge } from '@/components/ui/PriorityBadge'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { GlassCard } from '@/components/ui/GlassCard'
import { StatCard } from '@/components/ui/StatCard'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch admin profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('user_id', user.id)
    .maybeSingle()

  if (profile?.role !== 'ADMIN') {
    redirect('/login')
  }

  // Query all campus service requests
  const { data: requests, error } = await supabase
    .from('service_requests')
    .select(`
      id,
      ticket_number,
      title,
      description,
      category,
      priority,
      status,
      location,
      building,
      room_number,
      created_at,
      assigned_at,
      resolved_at,
      closed_at,
      departments ( name )
    `)
    .order('created_at', { ascending: false })

  const allRequests = requests || []

  // Metrics
  const total = allRequests.length
  const submitted = allRequests.filter((r) => r.status === 'SUBMITTED').length
  const assigned = allRequests.filter((r) => r.status === 'ASSIGNED').length
  const inProgress = allRequests.filter((r) => r.status === 'IN_PROGRESS').length
  const resolved = allRequests.filter((r) => r.status === 'RESOLVED').length
  const closed = allRequests.filter((r) => r.status === 'CLOSED').length
  const critical = allRequests.filter((r) => r.priority === 'CRITICAL').length

  // Calculate Average Resolution Time
  const resolvedRequests = allRequests.filter((r) => r.resolved_at && r.created_at)
  let avgResolutionTimeStr = 'N/A'
  if (resolvedRequests.length > 0) {
    const totalMs = resolvedRequests.reduce((sum, r) => {
      const created = new Date(r.created_at).getTime()
      const resolvedDate = new Date(r.resolved_at!).getTime()
      return sum + Math.max(0, resolvedDate - created)
    }, 0)
    const avgHours = Math.round((totalMs / resolvedRequests.length) / (1000 * 60 * 60))
    if (avgHours < 24) {
      avgResolutionTimeStr = `${avgHours} hrs`
    } else {
      const avgDays = (avgHours / 24).toFixed(1)
      avgResolutionTimeStr = `${avgDays} days`
    }
  }

  // Requests needing staff assignment
  const unassignedRequests = allRequests.filter((r) => r.status === 'SUBMITTED').slice(0, 5)

  // Critical/High priority requests
  const urgentRequests = allRequests.filter(
    (r) => (r.priority === 'CRITICAL' || r.priority === 'HIGH') && r.status !== 'RESOLVED' && r.status !== 'CLOSED'
  ).slice(0, 5)

  // Recent 6 requests
  const recentRequests = allRequests.slice(0, 6)

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner / Welcome */}
      <GlassCard className="p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" glow>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Administrative Command Center
            </h1>
          </div>
          <p className="text-slate-400 text-sm">
            Superuser Session: <span className="font-semibold text-slate-200">{profile?.full_name || 'Administrator'}</span>
            <span className="text-slate-500"> • Realtime Campus Service & Facilities Matrix</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/staff"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-semibold rounded-xl text-xs transition"
          >
            <Users className="w-4 h-4 text-indigo-400" />
            <span>Staff Directory</span>
          </Link>

          <Link
            href="/admin/analytics"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-cyan-500/20"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Operations Analytics</span>
          </Link>
        </div>
      </GlassCard>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
        <StatCard
          title="Total Volume"
          value={total}
          icon={ClipboardList}
          color="blue"
          subtitle="All tickets"
        />
        <StatCard
          title="Unassigned"
          value={submitted}
          icon={Clock}
          color="amber"
          subtitle="Pending staff"
        />
        <StatCard
          title="In Queue"
          value={assigned}
          icon={UserCheck}
          color="purple"
          subtitle="With technicians"
        />
        <StatCard
          title="In Progress"
          value={inProgress}
          icon={PlayCircle}
          color="indigo"
          subtitle="Under repair"
        />
        <StatCard
          title="Resolved"
          value={resolved}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Awaiting signoff"
        />
        <StatCard
          title="Closed"
          value={closed}
          icon={CheckCircle}
          color="blue"
          subtitle="Completed"
        />
        <StatCard
          title="Critical"
          value={critical}
          icon={AlertCircle}
          color="rose"
          subtitle="Urgent triage"
        />
      </div>

      {/* SLA Resolution Performance Card */}
      <GlassCard className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Timer className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <span>Campus Service Resolution Velocity</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 uppercase">
                SLA Metric
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Average elapsed time from initial student submission to verified technical resolution</p>
          </div>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-extrabold text-cyan-400 font-mono">{avgResolutionTimeStr}</span>
          <span className="text-xs text-slate-500">mean turnaround</span>
        </div>
      </GlassCard>

      {/* Grid: Unassigned Waiting Queue & High Priority Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Unassigned Waiting Queue */}
        <GlassCard className="p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
                <span>Unassigned Requests ({submitted})</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Requires administrative staff delegation</p>
            </div>
            <Link
              href="/admin/requests?status=SUBMITTED"
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {unassignedRequests.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No unassigned tickets pending. All student requests have been delegated.
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {unassignedRequests.map((req) => (
                <Link
                  key={req.id}
                  href={`/admin/requests/${req.id}`}
                  className="p-4 hover:bg-slate-900/60 transition flex items-center justify-between gap-3 block group"
                >
                  <div className="space-y-1 truncate">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-cyan-400">{req.ticket_number || 'SR-0000'}</span>
                      <PriorityBadge priority={req.priority} />
                      <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded">{req.category}</span>
                    </div>
                    <p className="text-xs font-semibold text-white group-hover:text-cyan-400 transition truncate">{req.title}</p>
                    <p className="text-[11px] text-slate-500">{req.location || 'Campus'} {req.building ? `• ${req.building}` : ''}</p>
                  </div>
                  <span className="shrink-0 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold group-hover:bg-amber-500 group-hover:text-slate-950 transition">
                    Assign Staff
                  </span>
                </Link>
              ))}
            </div>
          )}
        </GlassCard>

        {/* High / Critical Priority Issues */}
        <GlassCard className="p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span>Urgent / High Priority Issues ({critical})</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">High SLA sensitivity demanding oversight</p>
            </div>
            <Link
              href="/admin/requests?priority=CRITICAL"
              className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {urgentRequests.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No critical or high-priority tickets requiring immediate attention.
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {urgentRequests.map((req) => (
                <Link
                  key={req.id}
                  href={`/admin/requests/${req.id}`}
                  className="p-4 hover:bg-slate-900/60 transition flex items-center justify-between gap-3 block group"
                >
                  <div className="space-y-1 truncate">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-rose-400">{req.ticket_number || 'SR-0000'}</span>
                      <PriorityBadge priority={req.priority} />
                      <StatusBadge status={req.status} />
                    </div>
                    <p className="text-xs font-semibold text-white group-hover:text-rose-400 transition truncate">{req.title}</p>
                    <p className="text-[11px] text-slate-500">{req.location || 'Campus'} {req.building ? `• ${req.building}` : ''}</p>
                  </div>
                  <span className="shrink-0 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-bold group-hover:bg-rose-500 group-hover:text-white transition">
                    Inspect
                  </span>
                </Link>
              ))}
            </div>
          )}
        </GlassCard>
      </div>

      {/* Recent Requests Feed */}
      <GlassCard className="p-0 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Campus Service Activity Stream</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Most recently submitted requests across all campus departments</p>
          </div>
          <Link
            href="/admin/requests"
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
          >
            <span>Full Ticket Database ({total})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentRequests.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500">
            No service requests registered in the campus platform database yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {recentRequests.map((req) => (
              <Link
                key={req.id}
                href={`/admin/requests/${req.id}`}
                className="p-5 hover:bg-slate-900/60 transition flex flex-col md:flex-row md:items-center justify-between gap-4 block group"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/60 px-2.5 py-0.5 rounded-lg border border-cyan-800/60">
                      {req.ticket_number || 'SR-0000'}
                    </span>
                    <PriorityBadge priority={req.priority} />
                    <StatusBadge status={req.status} />
                    <span className="text-xs font-medium text-slate-300 bg-slate-800/80 px-2.5 py-0.5 rounded-lg border border-slate-700/50">
                      {req.category}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-cyan-400 transition">
                    {req.title}
                  </h3>
                  <div className="flex items-center space-x-4 text-xs text-slate-400">
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>{req.location || 'Campus'} {req.building ? `• ${req.building}` : ''}</span>
                    </span>
                    <span>Created: {new Date(req.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center self-end md:self-center">
                  <span className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 group-hover:bg-cyan-500 group-hover:text-slate-950 transition">
                    <span>Manage</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  )
}
