import { redirect } from 'next/navigation'
import { ShieldAlert, Mail, Calendar, Key, CheckCircle, Database } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

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
    .single()

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
      <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-xl ring-4 ring-red-50">
              {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                  {profile?.full_name || 'System Administrator'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200 uppercase">
                  Admin
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Full System Superuser &bull; Central Campus Request Platform
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Administrator Credentials
            </h3>

            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                <div className="truncate">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Email</span>
                  <span className="text-xs font-semibold text-gray-800 truncate block">{profile?.email || user.email}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
                <div>
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Security Clearance</span>
                  <span className="text-xs font-semibold text-red-700">Level 1 - System Administrator</span>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                <div>
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Account Created</span>
                  <span className="text-xs font-semibold text-gray-800">
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Campus Platform Overview
            </h3>

            <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3">
              <div className="flex items-center space-x-2 text-xs font-semibold text-red-400">
                <Database className="w-4 h-4" />
                <span>Database Status: Active</span>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                  <span className="text-2xl font-extrabold block">{totalReqs || 0}</span>
                  <span className="text-[11px] text-slate-400">Total Requests</span>
                </div>
                <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                  <span className="text-2xl font-extrabold block">{staffCount || 0}</span>
                  <span className="text-[11px] text-slate-400">Active Staff</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
