import { redirect } from 'next/navigation'
import { 
  User, 
  Mail, 
  ShieldCheck, 
  Building2, 
  ClipboardList, 
  CheckCircle2, 
  Clock, 
  Calendar,
  Sparkles,
  GraduationCap
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { GlassCard } from '@/components/ui/GlassCard'
import { StatCard } from '@/components/ui/StatCard'

export const dynamic = 'force-dynamic'

export default async function StudentProfilePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      email,
      role,
      student_id,
      phone,
      created_at,
      departments ( name, description )
    `)
    .eq('user_id', user.id)
    .maybeSingle()

  // Get request statistics for this student
  const { data: requests } = await supabase
    .from('service_requests')
    .select('status')
    .eq('student_id', user.id)

  const allReqs = requests || []
  const total = allReqs.length
  const inProgress = allReqs.filter((r) => r.status === 'IN_PROGRESS' || r.status === 'ASSIGNED').length
  const resolved = allReqs.filter((r) => r.status === 'RESOLVED' || r.status === 'CLOSED').length

  const deptData: any = profile?.departments
  const departmentName = deptData?.name || 'General Campus Division'

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <GlassCard className="p-6 sm:p-8 space-y-6" glow>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg shadow-cyan-500/20 ring-2 ring-cyan-400/30">
              {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'S'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  {profile?.full_name || 'Student Member'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 uppercase tracking-wider">
                  Student
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center space-x-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                <span>Verified Campus Student Account</span>
              </p>
            </div>
          </div>
        </div>

        {/* Profile Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Identity & Security</span>
            </h3>

            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                <div className="truncate">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Institutional Email
                  </span>
                  <span className="text-xs font-semibold text-slate-200 truncate block">
                    {profile?.email || user.email}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <GraduationCap className="w-4 h-4 text-cyan-400 shrink-0" />
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Student ID / Matriculation No.
                  </span>
                  <span className="text-xs font-semibold text-slate-200 font-mono">
                    {profile?.student_id || 'Not Specified'}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <Calendar className="w-4 h-4 text-cyan-400 shrink-0" />
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Member Since
                  </span>
                  <span className="text-xs font-semibold text-slate-200">
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Active Term'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Building2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Academic Department</span>
            </h3>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Enrolled Department / Faculty
              </span>
              <p className="text-sm font-bold text-white">
                {departmentName}
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Service requests submitted under this profile are automatically prioritized and routed according to campus zoning rules.
              </p>
            </div>
          </div>
        </div>

        {/* Activity Summary */}
        <div className="pt-6 border-t border-slate-800">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center space-x-1.5">
            <ClipboardList className="w-3.5 h-3.5 text-cyan-400" />
            <span>Service Request Activity Metrics</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Total Raised"
              value={total}
              icon={ClipboardList}
              color="blue"
              subtitle="All time requests"
            />
            <StatCard
              title="In Progress"
              value={inProgress}
              icon={Clock}
              color="amber"
              subtitle="Currently being resolved"
            />
            <StatCard
              title="Resolved"
              value={resolved}
              icon={CheckCircle2}
              color="emerald"
              subtitle="Successfully completed"
            />
          </div>
        </div>
      </GlassCard>
    </div>
  )
}
