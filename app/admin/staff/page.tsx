import Link from 'next/link'
import { redirect } from 'next/navigation'
import { 
  Users, 
  Mail, 
  Building2, 
  ClipboardList, 
  ArrowRight, 
  UserCheck, 
  CheckCircle2, 
  Clock,
  ShieldCheck
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function AdminStaffPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch admin profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (profile?.role !== 'ADMIN') {
    redirect('/login')
  }

  // Fetch all staff members with department
  const { data: staffMembers } = await supabase
    .from('profiles')
    .select(`
      id,
      user_id,
      full_name,
      email,
      role,
      phone,
      department_id,
      created_at,
      departments ( name, description )
    `)
    .eq('role', 'STAFF')
    .order('full_name', { ascending: true })

  // Fetch all service requests to count workload per staff member
  const { data: requests } = await supabase
    .from('service_requests')
    .select('assigned_to, status')

  const allReqs = requests || []
  const staffList = staffMembers || []

  // Calculate workloads
  const staffWorkloads = staffList.map((staff) => {
    const assignedReqs = allReqs.filter((r) => r.assigned_to === staff.user_id)
    const active = assignedReqs.filter((r) => r.status === 'ASSIGNED' || r.status === 'IN_PROGRESS').length
    const resolved = assignedReqs.filter((r) => r.status === 'RESOLVED' || r.status === 'CLOSED').length

    return {
      ...staff,
      totalAssigned: assignedReqs.length,
      activeCount: active,
      resolvedCount: resolved,
    }
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Staff Directory & Workload
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitor active technicians, maintenance staff, and their current workload allocations
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
            {staffList.length} Active Staff Specialists
          </span>
        </div>
      </div>

      {/* Staff Grid */}
      {staffWorkloads.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-xs">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-900">No staff members found</h3>
          <p className="text-xs text-gray-500 mt-1">
            Staff accounts registered in the platform with role = STAFF will automatically appear in this directory.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {staffWorkloads.map((staff) => (
            <div
              key={staff.id}
              className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs hover:border-blue-300 hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-base ring-2 ring-purple-50">
                      {staff.full_name ? staff.full_name.charAt(0).toUpperCase() : 'S'}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-base leading-tight">
                        {staff.full_name}
                      </h3>
                      <span className="inline-flex items-center space-x-1 text-[11px] text-emerald-700 font-medium mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>Active</span>
                      </span>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
                    Staff
                  </span>
                </div>

                <div className="space-y-2 text-xs text-gray-600 border-t border-gray-100 pt-3">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="truncate">{staff.email}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    {/* @ts-expect-error department join */}
                    <span>{staff.departments?.name || 'General Operations'}</span>
                  </div>
                </div>
              </div>

              {/* Workload Summary Bar */}
              <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                    <span className="text-base font-extrabold text-gray-900 block">{staff.totalAssigned}</span>
                    <span className="text-[10px] text-gray-500 font-medium">All Time</span>
                  </div>
                  <div className="bg-amber-50 p-2 rounded-lg border border-amber-100">
                    <span className="text-base font-extrabold text-amber-700 block">{staff.activeCount}</span>
                    <span className="text-[10px] text-amber-700 font-medium">Active</span>
                  </div>
                  <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                    <span className="text-base font-extrabold text-emerald-700 block">{staff.resolvedCount}</span>
                    <span className="text-[10px] text-emerald-700 font-medium">Resolved</span>
                  </div>
                </div>

                <div className="mt-3">
                  <Link
                    href={`/admin/requests?search=${encodeURIComponent(staff.full_name)}`}
                    className="w-full inline-flex items-center justify-center space-x-1.5 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition"
                  >
                    <span>View Staff Workload</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
