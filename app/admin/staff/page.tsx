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
  ShieldCheck,
  Sparkles
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { GlassCard } from '@/components/ui/GlassCard'
import { EmptyState } from '@/components/ui/EmptyState'

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
    .maybeSingle()

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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <GlassCard className="p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" glow>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Users className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Staff Directory & Field Workload
            </h1>
          </div>
          <p className="text-sm text-slate-400">
            Monitor active technicians, maintenance staff, and active workload allocations across departments.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 shadow-sm">
            {staffList.length} Active Specialists
          </span>
        </div>
      </GlassCard>

      {/* Staff Grid */}
      {staffWorkloads.length === 0 ? (
        <GlassCard className="p-16 text-center">
          <EmptyState
            icon={Users}
            title="No staff members registered"
            description="Staff accounts registered in the platform with role = STAFF will automatically appear in this operational directory."
          />
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {staffWorkloads.map((staff) => (
            <GlassCard
              key={staff.id}
              className="p-5 flex flex-col justify-between hover:border-indigo-500/40 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-black text-base shadow-md ring-2 ring-indigo-400/20">
                      {staff.full_name ? staff.full_name.charAt(0).toUpperCase() : 'S'}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base leading-tight">
                        {staff.full_name}
                      </h3>
                      <span className="inline-flex items-center space-x-1.5 text-[11px] text-emerald-400 font-medium mt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>Operational Ready</span>
                      </span>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-950/80 text-indigo-300 border border-indigo-800/60">
                    Staff
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-300 border-t border-slate-800 pt-3">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{staff.email}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    {/* @ts-expect-error department join */}
                    <span>{staff.departments?.name || 'General Operations'}</span>
                  </div>
                </div>
              </div>

              {/* Workload Summary Bar */}
              <div className="mt-4 pt-3 border-t border-slate-800">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-base font-extrabold text-white block">{staff.totalAssigned}</span>
                    <span className="text-[10px] text-slate-500 font-medium">All Time</span>
                  </div>
                  <div className="bg-amber-950/30 p-2.5 rounded-xl border border-amber-500/20">
                    <span className="text-base font-extrabold text-amber-400 block">{staff.activeCount}</span>
                    <span className="text-[10px] text-amber-400/80 font-medium">Active</span>
                  </div>
                  <div className="bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-500/20">
                    <span className="text-base font-extrabold text-emerald-400 block">{staff.resolvedCount}</span>
                    <span className="text-[10px] text-emerald-400/80 font-medium">Resolved</span>
                  </div>
                </div>

                <div className="mt-3">
                  <Link
                    href={`/admin/requests?search=${encodeURIComponent(staff.full_name)}`}
                    className="w-full inline-flex items-center justify-center space-x-1.5 py-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 hover:bg-slate-900 rounded-xl border border-slate-800 transition"
                  >
                    <span>Inspect Assigned Tickets</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  )
}
