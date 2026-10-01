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
  MapPin
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PriorityBadge } from '@/components/ui/PriorityBadge'
import { StatusBadge } from '@/components/ui/StatusBadge'

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
    .single()

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
    <div className="space-y-8">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Administrative Control Center
            </h1>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            Logged in as <span className="font-semibold text-gray-800">{profile?.full_name || 'Administrator'}</span> &bull; Campus Infrastructure & Facilities Management
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/staff"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg text-xs transition"
          >
            <Users className="w-4 h-4 text-slate-600" />
            <span>Staff Directory</span>
          </Link>

          <Link
            href="/admin/analytics"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg text-xs transition border border-blue-200"
          >
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <span>View Analytics</span>
          </Link>
        </div>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
        {/* Total */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs col-span-2 sm:col-span-2">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Requests</span>
            <ClipboardList className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-gray-900">{total}</div>
          <span className="text-[11px] text-gray-400">Campus-wide requests</span>
        </div>

        {/* Submitted */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Submitted</span>
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-800">{submitted}</div>
          <span className="text-[10px] text-slate-500">Pending Assignment</span>
        </div>

        {/* Assigned */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-purple-600">
            <span className="text-[11px] font-bold uppercase tracking-wider">Assigned</span>
            <UserCheck className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-purple-700">{assigned}</div>
          <span className="text-[10px] text-purple-600">In Staff Queue</span>
        </div>

        {/* In Progress */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-[11px] font-bold uppercase tracking-wider">In Progress</span>
            <PlayCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-amber-600">{inProgress}</div>
          <span className="text-[10px] text-amber-700">Being Worked On</span>
        </div>

        {/* Resolved */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-[11px] font-bold uppercase tracking-wider">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-emerald-700">{resolved}</div>
          <span className="text-[10px] text-emerald-600">Awaiting Close</span>
        </div>

        {/* Closed */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Closed</span>
            <CheckCircle className="w-4 h-4 text-gray-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-gray-700">{closed}</div>
          <span className="text-[10px] text-gray-400">Completed Cycle</span>
        </div>

        {/* Critical */}
        <div className="bg-white p-4 rounded-xl border border-red-200 bg-red-50/20 shadow-xs">
          <div className="flex items-center justify-between text-red-600">
            <span className="text-[11px] font-bold uppercase tracking-wider">Critical</span>
            <AlertCircle className="w-4 h-4 text-red-600" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-red-600">{critical}</div>
          <span className="text-[10px] text-red-500">High Risk</span>
        </div>
      </div>

      {/* Average Resolution Time Card */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Timer className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Average Resolution Turnaround</h3>
            <p className="text-xs text-gray-500">Calculated across all resolved campus service tickets from submission to resolution</p>
          </div>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-extrabold text-blue-700">{avgResolutionTimeStr}</span>
          <span className="text-xs text-gray-400">avg per ticket</span>
        </div>
      </div>

      {/* Section: Requests Waiting for Assignment */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-slate-50/50">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <h2 className="text-base font-bold text-gray-900">
                Requests Waiting for Assignment ({submitted})
              </h2>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Newly submitted student requests requiring triage and staff assignment
            </p>
          </div>

          <Link
            href="/admin/requests?status=SUBMITTED"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
          >
            <span>View All Pending</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {unassignedRequests.length === 0 ? (
          <div className="py-8 px-4 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-800">All caught up!</p>
            <p className="text-xs text-gray-500">There are currently no unassigned requests waiting in queue.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {unassignedRequests.map((req) => (
              <div key={req.id} className="p-4 sm:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 hover:bg-slate-50 transition">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {req.ticket_number}
                    </span>
                    <PriorityBadge priority={req.priority} />
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      {req.category}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900">{req.title}</h3>
                  <div className="flex items-center space-x-3 text-xs text-gray-500">
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      <span>{req.location || 'Campus'}</span>
                    </span>
                    <span>&bull;</span>
                    <span>Submitted: {new Date(req.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <Link
                  href={`/admin/requests/${req.id}`}
                  className="shrink-0 inline-flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Assign Staff</span>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section: Urgent / Critical Requests (if any) */}
      {urgentRequests.length > 0 && (
        <div className="bg-red-50/60 border border-red-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2 text-red-900">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h2 className="text-base font-bold">
                Critical & High Priority Tickets Requiring Oversight ({urgentRequests.length})
              </h2>
            </div>
            <Link
              href="/admin/requests?priority=CRITICAL"
              className="text-xs font-semibold text-red-700 hover:text-red-900 underline"
            >
              Filter critical
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {urgentRequests.map((req) => (
              <Link
                key={req.id}
                href={`/admin/requests/${req.id}`}
                className="bg-white p-4 rounded-lg border border-red-200 hover:border-red-400 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-gray-700">{req.ticket_number}</span>
                    <div className="flex items-center space-x-1.5">
                      <PriorityBadge priority={req.priority} />
                      <StatusBadge status={req.status} />
                    </div>
                  </div>
                  <h3 className="font-semibold text-sm text-gray-900 line-clamp-1">{req.title}</h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{req.description}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                  <span>{req.location || 'Campus'}</span>
                  <span className="text-blue-600 font-semibold flex items-center space-x-0.5">
                    <span>Manage</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Section: Recent Requests Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-base font-bold text-gray-900">Recent Service Requests</h2>
            <p className="text-xs text-gray-500">Live feed of all campus tickets</p>
          </div>
          <Link
            href="/admin/requests"
            className="text-xs font-semibold text-blue-600 hover:underline flex items-center space-x-1"
          >
            <span>View all ({total})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-gray-100">
          {recentRequests.map((req) => (
            <Link
              key={req.id}
              href={`/admin/requests/${req.id}`}
              className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-slate-50 transition group"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                    {req.ticket_number}
                  </span>
                  <PriorityBadge priority={req.priority} />
                  <StatusBadge status={req.status} />
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    {req.category}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition">
                  {req.title}
                </h3>
                <p className="text-xs text-gray-500">
                  {req.location || 'Campus'} &bull; Created {new Date(req.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center space-x-2 text-xs font-semibold text-gray-600 group-hover:text-blue-600">
                <span>View Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
