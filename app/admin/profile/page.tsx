import { redirect } from 'next/navigation'
import { ShieldAlert, Mail, Calendar, Key, CheckCircle, Database, ShieldCheck, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { GlassCard } from '@/components/ui/GlassCard'
import { StatCard } from '@/components/ui/StatCard'

export const dynamic = 'force-dynamic'

export default async function AdminProfilePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (profile?.role !== 'ADMIN') {
    redirect('/login')
  }

  const { count: totalReqs } = await supabase
    .from('service_requests')
    .select('*', { count: 'exact', head: true })

  const { count: staffCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'STAFF')

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <GlassCard className="p-6 sm:p-8 space-y-6" glow>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500 to-red-600 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-rose-500/20 ring-2 ring-rose-400/30">
              {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  {profile?.full_name || 'System Administrator'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-950/80 text-rose-300 border border-rose-800/60 uppercase tracking-wider">
                  Admin Superuser
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                <span>Central Campus Operations & Facilities Governance</span>
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
              <span>Superuser Credentials</span>
            </h3>

            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <Mail className="w-4 h-4 text-rose-400 shrink-0" />
                <div className="truncate">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Admin Email</span>
                  <span className="text-xs font-semibold text-slate-200 truncate block">{profile?.email || user.email}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Security Clearance</span>
                  <span className="text-xs font-semibold text-rose-300">Level 1 - Campus Platform Superuser</span>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <Calendar className="w-4 h-4 text-rose-400 shrink-0" />
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Account Created</span>
                  <span className="text-xs font-semibold text-slate-200">
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Active Term'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>Campus Data Lake Overview</span>
            </h3>

            <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-4">
              <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>PostgreSQL Cluster Operational</span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-2xl font-black text-white block">{totalReqs || 0}</span>
                  <span className="text-[11px] text-slate-400 font-medium">Logged Tickets</span>
                </div>
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-2xl font-black text-indigo-400 block">{staffCount || 0}</span>
                  <span className="text-[11px] text-slate-400 font-medium">Staff Members</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}
