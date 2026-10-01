import Link from 'next/link'
import { redirect } from 'next/navigation'
import { 
  ClipboardList, 
  Clock, 
  PlayCircle, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  MapPin, 
  Calendar,
  Building2,
  Wrench,
  Sparkles,
  ShieldAlert
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PriorityBadge } from '@/components/ui/PriorityBadge'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { GlassCard } from '@/components/ui/GlassCard'
import { StatCard } from '@/components/ui/StatCard'

export const dynamic = 'force-dynamic'

export default async function StaffDashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch staff profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, role, department_id, departments(name)')
    .eq('user_id', user.id)
    .maybeSingle()

  // Query only requests assigned to the currently authenticated staff user
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
      resolved_at
    `)
    .eq('assigned_to', user.id)
    .order('created_at', { ascending: false })

  const allRequests = requests || []

  // Compute live statistics
  const totalAssigned = allRequests.length
  const assignedWaiting = allRequests.filter((r) => r.status === 'ASSIGNED').length
  const inProgress = allRequests.filter((r) => r.status === 'IN_PROGRESS').length
  const resolved = allRequests.filter((r) => r.status === 'RESOLVED' || r.status === 'CLOSED').length

  // High/Critical priority requests needing attention
  const urgentRequests = allRequests.filter(
    (r) => (r.status === 'ASSIGNED' || r.status === 'IN_PROGRESS') && (r.priority === 'CRITICAL' || r.priority === 'HIGH')
  )

  // Recent 5 assigned requests
  const recentRequests = allRequests.slice(0, 5)

  const deptData: any = profile?.departments
  const departmentName = deptData?.name || 'Facilities Operations'

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Header & Greeting */}
      <GlassCard className="p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" glow>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Wrench className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Staff Field Operations
            </h1>
          </div>
          <p className="text-slate-400 text-sm">
            Welcome back, <span className="font-semibold text-slate-200">{profile?.full_name || 'Staff Member'}</span>
            <span className="text-slate-500"> • {departmentName} Division</span>
          </p>
        </div>

        <Link
          href="/staff/requests"
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/25"
        >
          <ClipboardList className="w-4 h-4" />
          <span>Active Assignment Queue</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </GlassCard>

      {/* Live Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Tickets"
          value={totalAssigned}
          icon={ClipboardList}
          color="indigo"
          subtitle="All queue assignments"
        />
        <StatCard
          title="Pending Start"
          value={assignedWaiting}
          icon={Clock}
          color="purple"
          subtitle="Awaiting commencement"
        />
        <StatCard
          title="In Progress"
          value={inProgress}
          icon={PlayCircle}
          color="amber"
          subtitle="Actively troubleshooting"
        />
        <StatCard
          title="Resolved"
          value={resolved}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Completed tickets"
        />
      </div>

      {/* Urgent Attention Alert Banner (If any) */}
      {urgentRequests.length > 0 && (
        <div className="p-6 rounded-2xl bg-rose-950/40 border border-rose-500/30 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-rose-400">
              <ShieldAlert className="w-5 h-5 text-rose-400 animate-pulse" />
              <h2 className="text-base font-bold tracking-tight text-white">
                Critical SLA Tickets Requiring Action ({urgentRequests.length})
              </h2>
            </div>
            <span className="text-[10px] font-bold text-rose-300 bg-rose-900/60 px-2.5 py-1 rounded-full uppercase tracking-wider border border-rose-700/50">
              Priority Escalation
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {urgentRequests.map((req) => (
              <Link
                key={req.id}
                href={`/staff/requests/${req.id}`}
                className="bg-slate-900/80 p-4 rounded-xl border border-rose-500/20 hover:border-rose-400/50 transition-all flex flex-col justify-between group shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-bold text-slate-300 bg-slate-950 px-2.5 py-0.5 rounded border border-slate-800">
                      {req.ticket_number || 'SR-0000'}
                    </span>
                    <div className="flex items-center space-x-1.5">
                      <PriorityBadge priority={req.priority} />
                      <StatusBadge status={req.status} />
                    </div>
                  </div>
                  <h3 className="font-semibold text-white group-hover:text-indigo-400 text-sm line-clamp-1 transition-colors">
                    {req.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {req.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>
                      {req.location || 'Campus'} {req.building ? `(${req.building})` : ''}
                    </span>
                  </span>
                  <span className="text-indigo-400 font-semibold group-hover:underline flex items-center space-x-1">
                    <span>Manage</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent Assigned Requests Section */}
      <GlassCard className="p-0 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-800/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <ClipboardList className="w-4 h-4 text-indigo-400" />
              <span>Recent Queue Assignments</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Most recently routed service tasks assigned to your technician account</p>
          </div>
          <Link
            href="/staff/requests"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition flex items-center space-x-1"
          >
            <span>View all assignments ({totalAssigned})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentRequests.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-white">No requests assigned yet</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Your queue is currently clear! New service requests dispatched to your department by administrators will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {recentRequests.map((req) => (
              <Link
                key={req.id}
                href={`/staff/requests/${req.id}`}
                className="block p-5 hover:bg-slate-900/60 transition-colors group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-950/50 px-2.5 py-0.5 rounded-lg border border-indigo-800/60">
                        {req.ticket_number || 'SR-0000'}
                      </span>
                      <PriorityBadge priority={req.priority} />
                      <StatusBadge status={req.status} />
                      <span className="text-xs font-medium text-slate-300 bg-slate-800/80 px-2.5 py-0.5 rounded-lg border border-slate-700/50">
                        {req.category}
                      </span>
                    </div>

                    <h3 className="text-base font-semibold text-white group-hover:text-indigo-400 transition-colors">
                      {req.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-400">
                      <span className="flex items-center space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>
                          {req.location || 'Campus'}
                          {req.building ? ` • ${req.building}` : ''}
                          {req.room_number ? ` • Room ${req.room_number}` : ''}
                        </span>
                      </span>

                      <span className="flex items-center space-x-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>Created: {new Date(req.created_at).toLocaleDateString()}</span>
                      </span>

                      {req.assigned_at && (
                        <span className="flex items-center space-x-1.5 text-indigo-300">
                          <Clock className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Assigned: {new Date(req.assigned_at).toLocaleDateString()}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center self-end md:self-center">
                    <span className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 text-slate-300 border border-slate-700/60 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-500 transition-all shadow-sm">
                      <span>Handle Ticket</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
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
