'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ShieldAlert,
  Mail,
  Calendar,
  Key,
  CheckCircle,
  Database,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  CreditCard,
  Building,
} from 'lucide-react'
import { getCurrentDemoUser, getDemoRequests, getAllDemoUsers } from '@/lib/demo/demo-service'
import { DemoUser } from '@/lib/demo/types'
import { StatCard } from '@/components/ui/StatCard'

export default function AdminProfilePage() {
  const [currentUser, setCurrentUser] = useState<DemoUser | null>(null)
  const [totalRequests, setTotalRequests] = useState(0)
  const [staffCount, setStaffCount] = useState(0)

  const loadData = () => {
    const user = getCurrentDemoUser()
    setCurrentUser(user)
    const reqs = getDemoRequests()
    setTotalRequests(reqs.length)
    const all = getAllDemoUsers()
    setStaffCount(all.filter((u) => u.role === 'STAFF').length)
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
          href="/admin/dashboard"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Command Center</span>
        </Link>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 text-emerald-400 flex items-center justify-center font-black text-2xl shadow-2xs">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {currentUser.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200 uppercase tracking-wider">
                  Admin Superuser
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Central Campus Operations & Facilities Governance</span>
              </p>
            </div>
          </div>
        </div>

        {/* Credentials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Identity & Security</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex items-center space-x-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <CreditCard className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Employee ID
                  </span>
                  <span className="font-semibold text-slate-800 block">
                    {currentUser.employeeId || 'ADMIN001'}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="truncate">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Administrative Contact
                  </span>
                  <span className="font-semibold text-slate-800 truncate block">
                    {currentUser.email}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <Building className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Governing Department
                  </span>
                  <span className="font-semibold text-slate-800 block">
                    {currentUser.department || 'Campus Administration'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span>System Telemetry</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex items-center space-x-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <Key className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Security Clearance
                  </span>
                  <span className="font-semibold text-emerald-700 block">
                    Tier-1 Full Facilities Dispatch Authority
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    System Mode
                  </span>
                  <span className="font-semibold text-slate-800 block">
                    Simulated Standalone Campus Demo
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Stats */}
        <div className="pt-4 border-t border-slate-100">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Platform Statistics
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatCard
              title="Total Requests Logged"
              value={totalRequests}
              subtitle="All student submissions"
              icon={CheckCircle}
              color="green"
            />
            <StatCard
              title="Registered Technicians"
              value={staffCount}
              subtitle="Specialist maintenance roster"
              icon={ShieldCheck}
              color="indigo"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
