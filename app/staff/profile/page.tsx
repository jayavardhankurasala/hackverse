import { redirect } from 'next/navigation'
import { 
  User, 
  Mail, 
  ShieldCheck, 
  Building2, 
  ClipboardList, 
  CheckCircle2, 
  Clock, 
  Calendar 
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function StaffProfilePage() {
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
    .single()

  // Get request statistics for this staff member
  const { data: requests } = await supabase
    .from('service_requests')
    .select('status')
    .eq('assigned_to', user.id)

  const allReqs = requests || []
  const totalAssigned = allReqs.length
  const inProgress = allReqs.filter((r) => r.status === 'IN_PROGRESS').length
  const resolved = allReqs.filter((r) => r.status === 'RESOLVED').length

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xl ring-4 ring-blue-50">
              {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : 'S'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                  {profile?.full_name || 'Staff Member'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                  Staff
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Campus Maintenance & Service Support Staff
              </p>
            </div>
          </div>
        </div>

        {/* Profile Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider text-gray-500">
              Account Credentials
            </h3>

            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                <div className="truncate">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                    Email
                  </span>
                  <span className="text-xs font-semibold text-gray-800 truncate block">
                    {profile?.email || user.email}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                <ShieldCheck className="w-4 h-4 text-gray-400 shrink-0" />
                <div>
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                    System Role
                  </span>
                  <span className="text-xs font-semibold text-gray-800">
                    {profile?.role || 'STAFF'}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                <div>
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                    Member Since
                  </span>
                  <span className="text-xs font-semibold text-gray-800">
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider text-gray-500">
              Department & Workload
            </h3>

            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                <Building2 className="w-4 h-4 text-gray-400 shrink-0" />
                <div>
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                    Assigned Department
                  </span>
                  <span className="text-xs font-semibold text-gray-800">
                    {/* @ts-expect-error department join */}
                    {profile?.departments?.name || 'General Operations / Facilities'}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-blue-50/60 border border-blue-100 space-y-2">
                <span className="text-xs font-bold text-blue-900 block">
                  Service Resolution Summary
                </span>
                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="bg-white p-2 rounded border border-blue-100">
                    <span className="text-lg font-extrabold text-gray-900 block">{totalAssigned}</span>
                    <span className="text-[10px] text-gray-500 font-medium">Assigned</span>
                  </div>
                  <div className="bg-white p-2 rounded border border-blue-100">
                    <span className="text-lg font-extrabold text-amber-600 block">{inProgress}</span>
                    <span className="text-[10px] text-amber-700 font-medium">Active</span>
                  </div>
                  <div className="bg-white p-2 rounded border border-blue-100">
                    <span className="text-lg font-extrabold text-emerald-600 block">{resolved}</span>
                    <span className="text-[10px] text-emerald-700 font-medium">Resolved</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
