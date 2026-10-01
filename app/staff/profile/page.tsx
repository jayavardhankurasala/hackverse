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
  Sparkles,
  ArrowLeft,
  CreditCard,
  Sliders,
} from 'lucide-react'
import { StatCard } from '@/components/ui/StatCard'
import {
  getCurrentDemoUser,
  getStaffAssignedRequests,
  getDemoStaffDomain,
  setDemoStaffDomain,
} from '@/lib/demo/demo-service'
import { DemoUser } from '@/lib/demo/types'

const DOMAINS: string[] = [
  'IT Support',
  'Electrical',
  'Plumbing',
  'Hostel',
  'Cleaning',
  'Maintenance',
  'Administration',
]

export default function StaffProfilePage() {
  const [currentUser, setCurrentUser] = useState<DemoUser | null>(null)
  const [domain, setDomain] = useState('IT Support')
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 })

  const loadData = () => {
    const user = getCurrentDemoUser()
    setCurrentUser(user)

    const activeDom = getDemoStaffDomain(user.id)
    setDomain(activeDom)

    const myReqs = getStaffAssignedRequests(user.id)
    setStats({
      total: myReqs.length,
      pending: myReqs.filter((r) => r.status === 'ASSIGNED' || r.status === 'IN_PROGRESS').length,
      resolved: myReqs.filter((r) => r.status === 'RESOLVED' || r.status === 'CLOSED').length,
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

  const handleDomainChange = (newDomain: string) => {
    if (!currentUser) return
    setDomain(newDomain)
    setDemoStaffDomain(currentUser.id, newDomain)
  }

  if (!currentUser) return null

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 font-sans">
      <div>
        <Link
          href="/staff/dashboard"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors"
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
            <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-2xl shadow-2xs">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {currentUser.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200 uppercase tracking-wider">
                  Technician
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center space-x-1.5">
                <Wrench className="w-3.5 h-3.5 text-blue-600" />
                <span>Certified Campus Facilities Specialist</span>
              </p>
            </div>
          </div>
        </div>

        {/* Profile Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Staff Credentials</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex items-center space-x-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <CreditCard className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Employee ID
                  </span>
                  <span className="font-semibold text-slate-800 block">
                    {currentUser.employeeId || 'EMP202601'}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="truncate">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Official Email
                  </span>
                  <span className="font-semibold text-slate-800 truncate block">
                    {currentUser.email}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <Wrench className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Specialization
                  </span>
                  <span className="font-semibold text-slate-800 block">
                    {currentUser.specialization || 'Network, Wi-Fi, Computers'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Sliders className="w-3.5 h-3.5 text-emerald-600" />
              <span>Work Domain Setting</span>
            </h2>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Active Department / Work Pool:
                </label>
                <select
                  value={domain}
                  onChange={(e) => handleDomainChange(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  {DOMAINS.map((dom) => (
                    <option key={dom} value={dom}>
                      {dom}
                    </option>
                  ))}
                </select>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                Tickets categorized under <strong className="text-slate-800">{domain}</strong> will appear in your Department Repair Queue.
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="pt-4 border-t border-slate-100">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Assigned Work Order Performance
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Total Assigned"
              value={stats.total}
              subtitle="All assigned tickets"
              icon={ClipboardList}
              color="blue"
            />
            <StatCard
              title="In Progress"
              value={stats.pending}
              subtitle="Pending completion"
              icon={Clock}
              color="amber"
            />
            <StatCard
              title="Completed / Resolved"
              value={stats.resolved}
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
