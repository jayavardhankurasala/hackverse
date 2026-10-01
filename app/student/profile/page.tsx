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
} from 'lucide-react'
import { getCurrentDemoUser, getStudentRequests } from '@/lib/demo/demo-service'
import { DemoUser } from '@/lib/demo/types'
import { StatCard } from '@/components/ui/StatCard'

export default function StudentProfilePage() {
  const [currentUser, setCurrentUser] = useState<DemoUser | null>(null)
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 })

  const loadData = () => {
    const user = getCurrentDemoUser()
    setCurrentUser(user)
    const reqs = getStudentRequests(user.id)
    setStats({
      total: reqs.length,
      pending: reqs.filter((r) => r.status === 'SUBMITTED' || r.status === 'ASSIGNED' || r.status === 'IN_PROGRESS').length,
      resolved: reqs.filter((r) => r.status === 'RESOLVED' || r.status === 'CLOSED').length,
    })
  }

  useEffect(() => {
    loadData()

    const handleUpdate = () => loadData()
    window.addEventListener('demo-user-changed', handleUpdate)
    window.addEventListener('demo-data-changed', handleUpdate)

    return () => {
      window.removeEventListener('demo-user-changed', handleUpdate)
      window.removeEventListener('demo-data-changed', handleUpdate)
    }
  }, [])

  if (!currentUser) return null

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
            <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-2xl shadow-2xs">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {currentUser.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
                  Student
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center space-x-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Campus Student Account</span>
              </p>
            </div>
          </div>
        </div>

        {/* Profile Information Grid (NO Department shown for students) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Student Identification</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex items-center space-x-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <CreditCard className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Student ID
                  </span>
                  <span className="font-semibold text-slate-800 block">
                    {currentUser.studentId || 'STU2026001'}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="truncate">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Institutional Email
                  </span>
                  <span className="font-semibold text-slate-800 truncate block">
                    {currentUser.email}
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
                    {currentUser.year || '3rd Year'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Home className="w-3.5 h-3.5 text-emerald-600" />
              <span>Campus Residence</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex items-center space-x-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <Building className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Hostel Residence Block
                  </span>
                  <span className="font-semibold text-slate-800 block">
                    {currentUser.hostel || 'Block A'}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <Home className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Room Number
                  </span>
                  <span className="font-semibold text-slate-800 block">
                    {currentUser.room || 'A-204'}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Account Status
                  </span>
                  <span className="font-semibold text-emerald-700 block">
                    Active • In Good Standing
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
              value={stats.total}
              subtitle="Lifetime tickets"
              icon={ClipboardList}
              color="green"
            />
            <StatCard
              title="Active / In Progress"
              value={stats.pending}
              subtitle="Open requests"
              icon={Clock}
              color="amber"
            />
            <StatCard
              title="Resolved"
              value={stats.resolved}
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
