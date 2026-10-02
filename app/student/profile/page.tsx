'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  User,
  Mail,
  ShieldCheck,
  ClipboardList,
  CheckCircle2,
  Clock,
  Calendar,
  GraduationCap,
  Building,
  ArrowLeft,
  Home,
  CreditCard,
  Phone,
  BookOpen,
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { getCurrentDemoUser, getStudentRequests } from '@/lib/demo/demo-service'
import { DEMO_USERS } from '@/lib/demo/mock-data'
import { StatCard } from '@/components/ui/StatCard'

interface StudentProfileData {
  id: string
  name: string
  email: string
  rollNumber: string
  branch: string
  year: string
  phone: string
  hostel: string
  room: string
  avatarUrl: string | null
  stats: {
    total: number
    pending: number
    resolved: number
  }
}

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<StudentProfileData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function loadStudentData() {
      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        const user = session?.user || (await supabase.auth.getUser()).data.user

        if (user && isMounted) {
          const { data: dbProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle()

          const fullName = dbProfile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Student'
          const email = dbProfile?.email || user.email || ''
          const rollNumber = dbProfile?.roll_number || dbProfile?.student_id || user.user_metadata?.roll_number || user.user_metadata?.student_id || 'CS2026-001'
          const branch = dbProfile?.branch || user.user_metadata?.branch || 'CSE'
          const year = dbProfile?.year || user.user_metadata?.year || '3rd Year'
          const phone = dbProfile?.phone || user.user_metadata?.phone || '+91 98765 43210'
          const avatarUrl = dbProfile?.avatar_url || user.user_metadata?.avatar_url || null

          // Fetch actual student ticket stats
          const { data: tickets } = await supabase
            .from('service_requests')
            .select('status')
            .eq('created_by', user.id)

          const total = tickets?.length || 0
          const pending = tickets?.filter((r) => r.status === 'SUBMITTED' || r.status === 'ASSIGNED' || r.status === 'IN_PROGRESS').length || 0
          const resolved = tickets?.filter((r) => r.status === 'RESOLVED' || r.status === 'CLOSED').length || 0

          setProfile({
            id: user.id,
            name: fullName,
            email,
            rollNumber,
            branch,
            year,
            phone,
            hostel: 'Hostel Block A',
            room: 'Room 204',
            avatarUrl,
            stats: { total, pending, resolved },
          })
          setLoading(false)
          return
        }

        // Demo fallback
        const demoUser = getCurrentDemoUser()
        const activeStudent = (demoUser?.role === 'STUDENT' ? demoUser : DEMO_USERS['student-1']) || DEMO_USERS['student-1']
        const reqs = getStudentRequests(activeStudent.id)

        if (isMounted) {
          setProfile({
            id: activeStudent.id,
            name: activeStudent.name,
            email: activeStudent.email,
            rollNumber: (activeStudent as any).rollNo || activeStudent.studentId || '24A81A05L9',
            branch: (activeStudent as any).branch || 'CSE',
            year: (activeStudent as any).year || '3rd Year',
            phone: '+91 98765 43210',
            hostel: activeStudent.hostel || 'Hostel Block A',
            room: activeStudent.room || '204',
            avatarUrl: activeStudent.avatarUrl || null,
            stats: {
              total: reqs.length,
              pending: reqs.filter((r) => r.status === 'SUBMITTED' || r.status === 'ASSIGNED' || r.status === 'IN_PROGRESS').length,
              resolved: reqs.filter((r) => r.status === 'RESOLVED' || r.status === 'CLOSED').length,
            },
          })
        }
      } catch (err) {
        console.warn('Student profile data notice:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadStudentData()

    return () => {
      isMounted = false
    }
  }, [])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 flex items-center justify-center text-xs text-slate-500">
        Loading student profile...
      </div>
    )
  }

  if (!profile) return null

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 font-sans">
      <div>
        <Link
          href="/student/dashboard"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Student Dashboard</span>
        </Link>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-2xl shadow-2xs overflow-hidden">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                profile.name.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {profile.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
                  Student
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center space-x-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                <span>Sri Vasavi Engineering College &bull; Verified Student Account</span>
              </p>
            </div>
          </div>
        </div>

        {/* Profile Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Academic Identification</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex items-center space-x-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <CreditCard className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    College Roll Number
                  </span>
                  <span className="font-semibold text-slate-800 font-mono block">
                    {profile.rollNumber}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <BookOpen className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Branch / Department
                  </span>
                  <span className="font-semibold text-slate-800 block">
                    {profile.branch} (Engineering)
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Academic Year
                  </span>
                  <span className="font-semibold text-slate-800 block">
                    {profile.year}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Home className="w-3.5 h-3.5 text-emerald-600" />
              <span>Contact & Campus Residence</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex items-center space-x-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="truncate">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Institutional Email
                  </span>
                  <span className="font-semibold text-slate-800 truncate block">
                    {profile.email}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Contact Phone Number
                  </span>
                  <span className="font-semibold text-slate-800 font-mono block">
                    {profile.phone}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <Building className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Campus Accommodation
                  </span>
                  <span className="font-semibold text-slate-800 block">
                    {profile.hostel} &bull; {profile.room}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="pt-4 border-t border-slate-100">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Service Request Activity
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Total Submitted"
              value={profile.stats.total}
              subtitle="Lifetime tickets"
              icon={ClipboardList}
              color="green"
            />
            <StatCard
              title="Active / In Progress"
              value={profile.stats.pending}
              subtitle="Open requests"
              icon={Clock}
              color="amber"
            />
            <StatCard
              title="Resolved"
              value={profile.stats.resolved}
              subtitle="Closed tickets"
              icon={CheckCircle2}
              color="emerald"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
