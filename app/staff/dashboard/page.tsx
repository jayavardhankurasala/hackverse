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
  Wrench
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PriorityBadge } from '@/components/ui/PriorityBadge'
import { StatusBadge } from '@/components/ui/StatusBadge'

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
    .single()

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
  const resolved = allRequests.filter((r) => r.status === 'RESOLVED').length

  // High/Critical priority requests needing attention
  const urgentRequests = allRequests.filter(
    (r) => (r.status === 'ASSIGNED' || r.status === 'IN_PROGRESS') && (r.priority === 'CRITICAL' || r.priority === 'HIGH')
  )

  // Recent 5 assigned requests
  const recentRequests = allRequests.slice(0, 5)

  return (
    <div className="space-y-8">
      {/* Top Header & Greeting */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Staff Workload Overview
            </h1>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            Welcome back, <span className="font-semibold text-gray-800">{profile?.full_name || 'Staff Member'}</span>
            {/* @ts-expect-error departments join type */}
            {profile?.departments?.name ? ` • ${profile.departments.name} Department` : ''}
          </p>
        </div>

        <Link
          href="/staff/requests"
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors shadow-xs"
        >
          <ClipboardList className="w-4 h-4" />
          <span>View All Assigned Requests</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Live Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Assigned */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs hover:border-blue-200 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Total Assigned
            </span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ClipboardList className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-gray-900">{totalAssigned}</span>
            <span className="text-xs text-gray-400">All-time tickets</span>
          </div>
        </div>

        {/* Assigned / Waiting */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs hover:border-purple-200 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Waiting / Queued
            </span>
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-purple-700">{assignedWaiting}</span>
            <span className="text-xs text-purple-600 font-medium">Ready to start</span>
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs hover:border-amber-200 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              In Progress
            </span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <PlayCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-amber-600">{inProgress}</span>
            <span className="text-xs text-amber-700 font-medium">Active work</span>
          </div>
        </div>

        {/* Resolved */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs hover:border-emerald-200 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Resolved
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-emerald-700">{resolved}</span>
            <span className="text-xs text-emerald-600 font-medium">Completed</span>
          </div>
        </div>
      </div>

      {/* Urgent Attention Section (If any) */}
      {urgentRequests.length > 0 && (
        <div className="bg-red-50/70 border border-red-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <h2 className="text-base font-bold tracking-tight">
                High & Critical Priority Requests ({urgentRequests.length})
              </h2>
            </div>
            <span className="text-xs font-semibold text-red-600 bg-red-100/80 px-2.5 py-0.5 rounded-full uppercase">
              Immediate Action Recommended
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {urgentRequests.map((req) => (
              <Link
                key={req.id}
                href={`/staff/requests/${req.id}`}
                className="bg-white p-4 rounded-lg border border-red-200 hover:border-red-400 hover:shadow-sm transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-bold text-gray-700">
                      {req.ticket_number}
                    </span>
                    <div className="flex items-center space-x-1.5">
                      <PriorityBadge priority={req.priority} />
                      <StatusBadge status={req.status} />
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 text-sm line-clamp-1 transition-colors">
                    {req.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {req.description}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    <span>
                      {req.location || 'Campus'} {req.building ? `(${req.building})` : ''}
                    </span>
                  </span>
                  <span className="text-blue-600 font-medium group-hover:underline flex items-center space-x-0.5">
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
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Recent Assigned Requests</h2>
            <p className="text-xs text-gray-500">Most recently assigned requests for your review and resolution</p>
          </div>
          <Link
            href="/staff/requests"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center space-x-1"
          >
            <span>View all ({totalAssigned})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentRequests.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">No requests assigned yet</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              You are currently caught up with your workload! Newly assigned tickets from the administration will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentRequests.map((req) => (
              <Link
                key={req.id}
                href={`/staff/requests/${req.id}`}
                className="block p-5 hover:bg-slate-50/80 transition-colors group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
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

                    <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {req.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-gray-500">
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span>
                          {req.location || 'Campus'}
                          {req.building ? ` • ${req.building}` : ''}
                          {req.room_number ? ` • Room ${req.room_number}` : ''}
                        </span>
                      </span>

                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>Created: {new Date(req.created_at).toLocaleDateString()}</span>
                      </span>

                      {req.assigned_at && (
                        <span className="flex items-center space-x-1 text-purple-600 font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Assigned: {new Date(req.assigned_at).toLocaleDateString()}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center self-end md:self-center">
                    <span className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <span>Manage Ticket</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
