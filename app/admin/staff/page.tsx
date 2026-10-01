'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
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
  Sparkles,
  Wrench,
  CreditCard,
  ArrowLeft,
} from 'lucide-react'
import { getAllDemoUsers, getDemoRequests } from '@/lib/demo/demo-service'
import { DemoUser, DemoRequest } from '@/lib/demo/types'
import { LoadingState } from '@/components/ui/LoadingState'

export default function AdminStaffPage() {
  const [staffList, setStaffList] = useState<DemoUser[]>([])
  const [requests, setRequests] = useState<DemoRequest[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = () => {
    const all = getAllDemoUsers()
    setStaffList(all.filter((u) => u.role === 'STAFF'))
    setRequests(getDemoRequests())
    setLoading(false)
  }

  useEffect(() => {
    loadData()

    const handleUpdate = () => loadData()
    window.addEventListener('demo-data-changed', handleUpdate)
    window.addEventListener('demo-user-changed', handleUpdate)

    return () => {
      window.removeEventListener('demo-data-changed', handleUpdate)
      window.removeEventListener('demo-user-changed', handleUpdate)
    }
  }, [])

  if (loading) {
    return <LoadingState message="Loading staff specialist directory..." />
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      <div>
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Command Center</span>
        </Link>
      </div>

      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Facilities Staff Directory & Workload
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Realtime technician assignment monitoring, specialization tags, and active queue counts.
          </p>
        </div>

        <div className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
          Active Specialists: {staffList.length}
        </div>
      </div>

      {/* Staff Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {staffList.map((staff) => {
          const myReqs = requests.filter(
            (r) => r.assignedStaffId === staff.id || r.assignedStaffName === staff.name
          )
          const activeCount = myReqs.filter(
            (r) => r.status === 'ASSIGNED' || r.status === 'IN_PROGRESS'
          ).length
          const resolvedCount = myReqs.filter(
            (r) => r.status === 'RESOLVED' || r.status === 'CLOSED'
          ).length

          return (
            <div
              key={staff.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-5 hover:border-emerald-300 transition-all"
            >
              <div className="flex items-center space-x-3.5 border-b border-slate-100 pb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold text-lg shadow-2xs">
                  {staff.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{staff.name}</h3>
                  <div className="text-xs font-semibold text-emerald-700 mt-0.5">
                    {staff.department}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {staff.employeeId}
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{staff.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wrench className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{staff.specialization}</span>
                </div>
              </div>

              {/* Workload Stats */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Active Queue
                  </span>
                  <span className="text-base font-extrabold text-amber-600">
                    {activeCount}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Resolved
                  </span>
                  <span className="text-base font-extrabold text-emerald-600">
                    {resolvedCount}
                  </span>
                </div>
              </div>

              <Link
                href="/admin/requests"
                className="w-full py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition flex items-center justify-center gap-1.5"
              >
                <span>View Assigned Tickets</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}
