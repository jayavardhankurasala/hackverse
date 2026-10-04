'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  User,
  Mail,
  ShieldCheck,
  Building2,
  ClipboardList,
  CheckCircle2,
  Clock,
  Calendar,
  Wrench,
  ArrowLeft,
  CreditCard,
  Phone,
  Camera,
  Loader2,
} from 'lucide-react'
import { StatCard } from '@/components/ui/StatCard'
import { createClient } from '@/lib/supabase/client'
import { DEMO_USERS } from '@/lib/demo/mock-data'
import { getCurrentDemoUser, getStaffAssignedRequests } from '@/lib/demo/demo-service'

interface StaffProfileData {
  id: string
  name: string
  email: string
  employeeId: string
  phone: string
  department: string
  avatarUrl: string | null
  stats: {
    total: number
    pending: number
    resolved: number
  }
}

export default function StaffProfilePage() {
  const [staff, setStaff] = useState<StaffProfileData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function loadStaffProfile() {
      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        const user = session?.user || (await supabase.auth.getUser()).data.user

        if (user && isMounted) {
          // Fetch authenticated staff profile and statistics concurrently from Supabase
          const [profileRes, staffTicketsRes] = await Promise.all([
            supabase
              .from('profiles')
              .select('*, departments(id, name)')
              .eq('user_id', user.id)
              .maybeSingle(),
            supabase
              .from('service_requests')
              .select('status')
              .eq('assigned_to', user.id),
          ])

          const profile = profileRes.data
          const staffTickets = staffTicketsRes.data

          const fullName = profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Campus Specialist'
          const email = profile?.email || user.email || ''
          const employeeId = profile?.roll_number || profile?.student_id || 'EMP-SVEC-' + user.id.slice(0, 5).toUpperCase()
          const phone = profile?.phone || user.user_metadata?.phone || '+91 98765 43220'
          const department = profile?.departments?.name || profile?.department_id || 'General Campus Facilities'
          const avatarUrl = profile?.avatar_url || null

          const total = staffTickets?.length || 0
          const pending = staffTickets?.filter((r) => r.status === 'ASSIGNED' || r.status === 'IN_PROGRESS').length || 0
          const resolved = staffTickets?.filter((r) => r.status === 'RESOLVED' || r.status === 'CLOSED').length || 0

          setStaff({
            id: user.id,
            name: fullName,
            email,
            employeeId,
            phone,
            department,
            avatarUrl,
            stats: { total, pending, resolved },
          })
          setLoading(false)
          return
        }

        // Demo user fallback: specifically load Staff persona (never student persona)
        const demoUser = getCurrentDemoUser()
        const activeStaff = (demoUser?.role === 'STAFF' ? demoUser : DEMO_USERS['staff-1']) || DEMO_USERS['staff-1']

        const demoReqs = getStaffAssignedRequests(activeStaff.id)
        if (isMounted) {
          setStaff({
            id: activeStaff.id,
            name: activeStaff.name,
            email: activeStaff.email,
            employeeId: activeStaff.employeeId || 'EMP202601',
            phone: '+91 98765 43210',
            department: (activeStaff as any).department || 'IT Support',
            avatarUrl: activeStaff.avatarUrl || null,
            stats: {
              total: demoReqs.length,
              pending: demoReqs.filter((r) => r.status === 'ASSIGNED' || r.status === 'IN_PROGRESS').length,
              resolved: demoReqs.filter((r) => r.status === 'RESOLVED' || r.status === 'CLOSED').length,
            },
          })
          setLoading(false)
        }
      } catch (err) {
        console.warn('Staff profile fetch notice:', err)
        if (isMounted) {
          const fallback = DEMO_USERS['staff-1']
          setStaff({
            id: fallback.id,
            name: fallback.name,
            email: fallback.email,
            employeeId: 'EMP202601',
            phone: '+91 98765 43210',
            department: fallback.department || 'IT Support',
            avatarUrl: null,
            stats: { total: 4, pending: 2, resolved: 2 },
          })
          setLoading(false)
        }
      }
    }

    loadStaffProfile()

    return () => {
      isMounted = false
    }
  }, [])

  if (loading || !staff) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center text-slate-400 text-sm">
        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
        <span>Loading technician profile...</span>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 font-sans">
      <div>
        <Link
          href="/staff/dashboard"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-blue-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Operations Queue</span>
        </Link>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-2xl shadow-2xs overflow-hidden">
              {staff.avatarUrl ? (
                <img src={staff.avatarUrl} alt={staff.name} className="w-full h-full object-cover" />
              ) : (
                <span>{staff.name.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {staff.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200 uppercase tracking-wider">
                  Technician
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center space-x-1.5">
                <Wrench className="w-3.5 h-3.5 text-blue-600" />
                <span>Certified SVEC Facilities Specialist</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-blue-50 px-3.5 py-2 rounded-xl border border-blue-200">
            <Building2 className="w-4 h-4 text-blue-700" />
            <div className="text-left">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">Domain</span>
              <span className="text-xs font-extrabold text-blue-900 block">{staff.department}</span>
            </div>
          </div>
        </div>

        {/* Profile Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Official Staff Identification</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex items-center space-x-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <CreditCard className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Employee / Staff ID
                  </span>
                  <span className="font-semibold text-slate-800 font-mono block">
                    {staff.employeeId}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                <div className="truncate">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Official College Email
                  </span>
                  <span className="font-semibold text-slate-800 truncate block">
                    {staff.email}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <Phone className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Contact Phone
                  </span>
                  <span className="font-semibold text-slate-800 block">
                    {staff.phone}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Operational Department & Role</span>
            </h2>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Designated Service Department
                </span>
                <div className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-blue-600" />
                  <span>{staff.department}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                Your account is strictly configured to receive, track, and resolve facility grievances reported under the{' '}
                <strong className="text-slate-800">{staff.department}</strong> queue across SVEC campus and hostels.
              </p>
            </div>
          </div>
        </div>

        {/* Assigned Performance Metrics */}
        <div className="pt-4 border-t border-slate-100">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Assigned Work Order Performance
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Total Assigned"
              value={staff.stats.total}
              subtitle="All assigned tasks"
              icon={ClipboardList}
              color="blue"
            />
            <StatCard
              title="In Progress"
              value={staff.stats.pending}
              subtitle="Pending resolution"
              icon={Clock}
              color="amber"
            />
            <StatCard
              title="Completed / Resolved"
              value={staff.stats.resolved}
              subtitle="Successfully fixed"
              icon={CheckCircle2}
              color="emerald"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
