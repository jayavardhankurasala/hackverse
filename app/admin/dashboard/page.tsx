'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ClipboardList,
  Clock,
  PlayCircle,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Users,
  BarChart3,
  ShieldCheck,
  AlertTriangle,
  MapPin,
  Sparkles,
  Layers,
  Search,
  Check,
  UserCheck,
  Eye,
  Filter,
  Flame,
  Radio,
  PhoneCall,
} from 'lucide-react'
import { PriorityBadge } from '@/components/ui/PriorityBadge'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { StatCard } from '@/components/ui/StatCard'
import { LoadingState } from '@/components/ui/LoadingState'
import { AnalyticsCharts } from '@/components/admin/AnalyticsCharts'
import { CampusHeatmap } from '@/components/admin/CampusHeatmap'
import {
  getDemoRequests,
  getPriorityQueue,
  assignDemoRequest,
  getAllDemoUsers,
} from '@/lib/demo/demo-service'
import { DemoRequest, DemoUser } from '@/lib/demo/types'
import { getTimeGreeting } from '@/lib/utils/greeting'

export default function AdminDashboardPage() {
  const [requests, setRequests] = useState<DemoRequest[]>([])
  const [priorityQueue, setPriorityQueue] = useState<DemoRequest[]>([])
  const [staffMembers, setStaffMembers] = useState<DemoUser[]>([])
  const [loading, setLoading] = useState(true)
  const [greeting, setGreeting] = useState('Good day')

  // Filters for bottom table and heatmap
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [priorityFilter, setPriorityFilter] = useState('ALL')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null)

  // One-click assign state feedback
  const [justAssignedId, setJustAssignedId] = useState<string | null>(null)

  const loadData = () => {
    const all = getDemoRequests()
    setRequests(all)
    setPriorityQueue(getPriorityQueue())
    const users = getAllDemoUsers()
    setStaffMembers(users.filter((u) => u.role === 'STAFF'))
    setLoading(false)
  }

  useEffect(() => {
    setGreeting(getTimeGreeting())
    loadData()

    const handleUpdate = () => loadData()
    window.addEventListener('demo-data-changed', handleUpdate)
    window.addEventListener('demo-user-changed', handleUpdate)

    return () => {
      window.removeEventListener('demo-data-changed', handleUpdate)
      window.removeEventListener('demo-user-changed', handleUpdate)
    }
  }, [])

  const handleQuickAssign = (requestId: string, staffNameOrId: string) => {
    assignDemoRequest(requestId, staffNameOrId)
    setJustAssignedId(requestId)
    setTimeout(() => setJustAssignedId(null), 3000)
    loadData()
  }

  if (loading) {
    return <LoadingState message="Loading administrative command center..." />
  }

  // Calculate live statistics
  const total = requests.length
  const submitted = requests.filter((r) => r.status === 'SUBMITTED').length
  const inProgress = requests.filter((r) => r.status === 'IN_PROGRESS' || r.status === 'ASSIGNED').length
  const resolved = requests.filter((r) => r.status === 'RESOLVED' || r.status === 'CLOSED').length
  const critical = requests.filter((r) => r.priority === 'CRITICAL').length
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0

  // Chart datasets
  const statusData = [
    { name: 'SUBMITTED', count: submitted },
    { name: 'ASSIGNED', count: requests.filter((r) => r.status === 'ASSIGNED').length },
    { name: 'IN_PROGRESS', count: requests.filter((r) => r.status === 'IN_PROGRESS').length },
    { name: 'RESOLVED', count: requests.filter((r) => r.status === 'RESOLVED').length },
    { name: 'CLOSED', count: requests.filter((r) => r.status === 'CLOSED').length },
  ]

  const categoryCounts: Record<string, number> = {}
  requests.forEach((r) => {
    categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1
  })
  const categoryData = Object.entries(categoryCounts).map(([name, count]) => ({
    name,
    count,
  }))

  const priorityData = [
    { name: 'CRITICAL', count: critical },
    { name: 'HIGH', count: requests.filter((r) => r.priority === 'HIGH').length },
    { name: 'MEDIUM', count: requests.filter((r) => r.priority === 'MEDIUM').length },
    { name: 'LOW', count: requests.filter((r) => r.priority === 'LOW').length },
  ]

  const timelineData = [
    { date: 'Day 1', requests: 4 },
    { date: 'Day 3', requests: 6 },
    { date: 'Day 6', requests: 3 },
    { date: 'Day 9', requests: 7 },
    { date: 'Day 12', requests: 9 },
    { date: 'Today', requests: requests.length },
  ]

  const activeCriticalTickets = requests.filter(
    (r) => r.priority === 'CRITICAL' && r.status !== 'RESOLVED' && r.status !== 'CLOSED'
  )

  // Filtered requests for main table
  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.ticketNumber?.toLowerCase().includes(search.toLowerCase()) ||
      req.title?.toLowerCase().includes(search.toLowerCase()) ||
      req.studentName?.toLowerCase().includes(search.toLowerCase()) ||
      req.location?.toLowerCase().includes(search.toLowerCase())

    const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter
    const matchesPriority = priorityFilter === 'ALL' || req.priority === priorityFilter
    const matchesCategory = categoryFilter === 'ALL' || req.category === categoryFilter

    const matchesBlock = !selectedBlock || (() => {
      const text = `${req.building || ''} ${req.location || ''} ${req.category || ''} ${req.title || ''}`.toLowerCase()
      const target = selectedBlock.toLowerCase()
      if (target.includes('block b')) return text.includes('block b') || text.includes('hb-b')
      if (target.includes('block a')) return text.includes('block a') || text.includes('hb-a')
      if (target.includes('block c')) return text.includes('block c') || text.includes('hb-c')
      if (target.includes('academic block 1')) return text.includes('academic block 1') || text.includes('ab-1') || text.includes('cad lab') || text.includes('cse')
      if (target.includes('academic block 2')) return text.includes('academic block 2') || text.includes('ab-2') || text.includes('ece') || text.includes('eee') || text.includes('mechanical')
      if (target.includes('library')) return text.includes('library')
      if (target.includes('canteen')) return text.includes('canteen') || text.includes('food court')
      if (target.includes('transport')) return text.includes('bus') || text.includes('transport') || text.includes('shuttle')
      if (target.includes('administrative')) return text.includes('admin') || text.includes('exam')
      return true
    })()

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesBlock
  })

  // Unassigned or urgent requests waiting in Priority Queue
  const urgentQueue = priorityQueue.slice(0, 6)

  return (
    <div className="space-y-8 pb-16 font-sans">
      {/* Top Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 sm:p-7 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Central Facilities Governance Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {greeting}, Administrator
          </h1>
          <p className="text-sm text-slate-600 font-normal">
            Campus-wide request oversight, AI dispatch recommendations, and resource analytics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/requests"
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 shadow-2xs transition"
          >
            Manage Requests ({total})
          </Link>
          <Link
            href="/admin/staff"
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-2xs transition flex items-center gap-2 hover:scale-[1.01]"
          >
            <Users className="w-4 h-4" />
            <span>Staff Directory</span>
          </Link>
        </div>
      </div>

      {/* Real-time Emergency Critical Hazard Broadcast Banner */}
      {activeCriticalTickets.length > 0 && (
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-rose-700 via-red-600 to-amber-700 text-white p-5 sm:p-6 shadow-md border border-red-500/40 animate-in fade-in duration-300">
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
            <div className="flex items-start space-x-3.5">
              <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 ring-2 ring-white/40 shadow-inner">
                <AlertTriangle className="w-6 h-6 text-white animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xs font-extrabold uppercase tracking-wider bg-white text-rose-700 px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                    LIVE EMERGENCY BROADCAST
                  </span>
                  <span className="text-xs text-rose-100 font-semibold">
                    {activeCriticalTickets.length} Critical Hazard Ticket{activeCriticalTickets.length > 1 ? 's' : ''} Active
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold tracking-tight text-white">
                  {activeCriticalTickets[0].title}
                </h3>
                <div className="text-xs text-red-100 flex items-center gap-2 flex-wrap pt-0.5">
                  <span className="font-semibold">📍 {activeCriticalTickets[0].building || activeCriticalTickets[0].location}</span>
                  <span>•</span>
                  <span>Domain: <strong>{activeCriticalTickets[0].category}</strong></span>
                  <span>•</span>
                  <span className="bg-black/30 px-2 py-0.5 rounded text-2xs font-mono flex items-center gap-1">
                    <PhoneCall className="w-3 h-3 text-emerald-300" />
                    Dispatch: SMS & WhatsApp Webhook to {activeCriticalTickets[0].assignedStaffName || 'Specialist Technician'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
              <button
                type="button"
                onClick={() => {
                  setPriorityFilter('CRITICAL')
                  setSelectedBlock(null)
                  const el = document.getElementById('all-requests-table')
                  el?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-rose-800 hover:bg-rose-50 transition shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <span>Inspect All {activeCriticalTickets.length} Hazards</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Requests"
          value={total}
          subtitle="All submitted campus tickets"
          icon={ClipboardList}
          color="green"
        />

        <StatCard
          title="Open Requests"
          value={submitted + inProgress}
          subtitle="Awaiting resolution"
          icon={Clock}
          color="blue"
        />

        <StatCard
          title="Resolved"
          value={resolved}
          subtitle="Completed tickets"
          icon={CheckCircle2}
          color="emerald"
        />

        <StatCard
          title="Critical Issues"
          value={critical}
          subtitle="Highest severity SLA"
          icon={AlertTriangle}
          color="rose"
        />

        <StatCard
          title="Resolution Rate"
          value={`${resolutionRate}%`}
          subtitle="Overall success benchmark"
          icon={BarChart3}
          color="indigo"
        />
      </div>

      {/* Interactive Campus Facilities Heatmap */}
      <CampusHeatmap
        requests={requests}
        selectedBlock={selectedBlock}
        onSelectBlock={(block) => {
          setSelectedBlock(block)
          if (block) {
            const el = document.getElementById('all-requests-table')
            el?.scrollIntoView({ behavior: 'smooth' })
          }
        }}
      />

      {/* AI PRIORITY QUEUE & AUTOMATIC STAFF RECOMMENDATIONS */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-linear-to-r from-emerald-50/50 via-white to-slate-50">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Intelligent Dispatch Queue</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              AI Priority Queue & Automatic Staff Assignment
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Ranked automatically by SLA Severity (Critical → High) with specialist matching
            </p>
          </div>
          <span className="text-xs font-semibold text-emerald-800 bg-white px-3 py-1.5 rounded-xl border border-emerald-200 shadow-2xs self-start sm:self-auto">
            {urgentQueue.length} Priority Tickets
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {urgentQueue.map((req) => {
            const suggestedStaff =
              req.aiRecommendation?.suggestedStaff ||
              (req.category === 'IT Support'
                ? 'Vikram Rao'
                : req.category === 'Electrical'
                ? 'Suresh Kumar'
                : 'Anjali Devi')

            const isAssigned = req.status !== 'SUBMITTED'

            return (
              <div
                key={req.id}
                className="p-5 sm:p-6 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-800 px-2.5 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                      {req.ticketNumber}
                    </span>
                    <PriorityBadge priority={req.priority} />
                    <StatusBadge status={req.status} />
                    <span className="text-xs font-medium text-slate-500">
                      {req.category}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{req.location}</span>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">
                    {req.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 line-clamp-1">
                    {req.description}
                  </p>

                  {/* AI Recommendation Reason */}
                  {req.aiRecommendation && (
                    <div className="text-xs text-emerald-900 bg-emerald-50/80 px-3 py-1.5 rounded-lg border border-emerald-200 inline-flex items-center gap-1.5 mt-1">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>
                        AI Reason: <em>{req.aiRecommendation.reasoning}</em>
                      </span>
                    </div>
                  )}
                </div>

                {/* Assignment Controls */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-bold text-slate-400">
                      Suggested Staff:
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-slate-900">
                      {req.assignedStaffName || suggestedStaff}
                    </div>
                  </div>

                  {!isAssigned ? (
                    <button
                      type="button"
                      onClick={() => handleQuickAssign(req.id, suggestedStaff)}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Assign to {suggestedStaff.split(' ')[0]}</span>
                    </button>
                  ) : (
                    <span className="px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Assigned to {req.assignedStaffName}</span>
                    </span>
                  )}

                  <Link
                    href={`/admin/requests/${req.id}`}
                    className="p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition"
                    title="Review Ticket Details"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Analytics Charts */}
      <AnalyticsCharts
        statusData={statusData}
        categoryData={categoryData}
        priorityData={priorityData}
        departmentData={[]}
        timelineData={timelineData}
      />

      {/* Admin Full Request Table */}
      <div id="all-requests-table" className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden scroll-mt-6">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">All Campus Service Tickets</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Live operational register with multi-attribute filtering & campus block correlation
            </p>
          </div>
          <Link
            href="/admin/requests"
            className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Open Dedicated Table →
          </Link>
        </div>

        {/* Filters */}
        <div className="p-4 bg-slate-50/50 border-b border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-4 relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search ticket #, title, student, location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="sm:col-span-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter by Status"
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                aria-label="Filter by Priority"
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ALL">All Priorities</option>
                <option value="CRITICAL">Critical Hazard</option>
                <option value="HIGH">High Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="LOW">Low Priority</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                aria-label="Filter by Category"
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ALL">All 8 Departments</option>
                <option value="IT Support">IT Support</option>
                <option value="Electrical">Electrical</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Hostel">Hostel</option>
                <option value="Transport">Transport</option>
                <option value="Cleaning">Cleaning</option>
                <option value="Administration">Administration</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-500 text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-6">Ticket</th>
                <th className="py-3.5 px-6">Issue & Location</th>
                <th className="py-3.5 px-6">Category</th>
                <th className="py-3.5 px-6">Priority</th>
                <th className="py-3.5 px-6">Student</th>
                <th className="py-3.5 px-6">Assigned Staff</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-6 font-mono text-xs font-bold text-emerald-800 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                      {req.ticketNumber}
                    </span>
                  </td>
                  <td className="py-4 px-6 max-w-sm">
                    <div className="font-semibold text-slate-900 line-clamp-1">{req.title}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{req.location}</div>
                  </td>
                  <td className="py-4 px-6 font-medium text-slate-700 whitespace-nowrap">
                    {req.category}
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <PriorityBadge priority={req.priority} />
                  </td>
                  <td className="py-4 px-6 font-medium text-slate-800 whitespace-nowrap">
                    {req.studentName}
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    {req.assignedStaffName ? (
                      <span className="font-semibold text-slate-800">{req.assignedStaffName}</span>
                    ) : (
                      <span className="text-slate-400 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <StatusBadge status={req.status} />
                  </td>
                  <td className="py-4 px-6 text-right whitespace-nowrap">
                    <Link
                      href={`/admin/requests/${req.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Review</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
