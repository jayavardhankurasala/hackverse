'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Wrench,
  ClipboardList,
  Clock,
  PlayCircle,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  MapPin,
  Calendar,
  Building2,
  Sparkles,
  Search,
  Filter,
  Eye,
  Check,
  User,
  ShieldAlert,
  Sliders,
  Layers,
} from 'lucide-react'
import { PriorityBadge } from '@/components/ui/PriorityBadge'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { StatCard } from '@/components/ui/StatCard'
import { LoadingState } from '@/components/ui/LoadingState'
import { EmptyState } from '@/components/ui/EmptyState'
import {
  getCurrentDemoUser,
  getStaffAssignedRequests,
  getDepartmentRequests,
  getDemoStaffDomain,
  setDemoStaffDomain,
  startWorkDemoRequest,
  resolveDemoRequest,
} from '@/lib/demo/demo-service'
import { DemoRequest, DemoUser, ServiceCategory } from '@/lib/demo/types'
import { createClient } from '@/utils/supabase/client'

const DOMAINS: string[] = [
  'IT Support',
  'Electrical',
  'Plumbing',
  'Hostel',
  'Cleaning',
  'Maintenance',
  'Administration',
]

export default function StaffDashboardPage() {
  const [currentUser, setCurrentUser] = useState<DemoUser | null>(null)
  const [activeDomain, setActiveDomain] = useState<string>('IT Support')
  const [activeTab, setActiveTab] = useState<'my-assigned' | 'department-queue'>('my-assigned')

  const [assignedRequests, setAssignedRequests] = useState<DemoRequest[]>([])
  const [deptRequests, setDeptRequests] = useState<DemoRequest[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')

  // Resolve Modal
  const [resolvingTicket, setResolvingTicket] = useState<DemoRequest | null>(null)
  const [resolutionNote, setResolutionNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadData = async () => {
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user || (await supabase.auth.getUser()).data.user

      if (user) {
        // Fetch staff profile and service requests concurrently
        const [profileRes, requestsRes] = await Promise.all([
          supabase
            .from('profiles')
            .select('*, departments(id, name)')
            .eq('user_id', user.id)
            .maybeSingle(),
          supabase
            .from('service_requests')
            .select('*')
            .order('created_at', { ascending: false }),
        ])

        const profile = profileRes.data
        const dbRequests = requestsRes.data
        const departmentName = profile?.departments?.name || profile?.department_id || 'IT Support'
        const staffName = profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Staff Member'

        const staffObj: DemoUser = {
          id: user.id,
          name: staffName,
          email: user.email || '',
          role: 'STAFF',
          department: departmentName,
        }
        setCurrentUser(staffObj)
        setActiveDomain(departmentName)

        if (dbRequests && dbRequests.length > 0) {
          const mapped: DemoRequest[] = dbRequests.map((r: any) => ({
            id: r.id,
            ticketNumber: r.ticket_number,
            title: r.title,
            description: r.description,
            category: (r.category || 'General') as any,
            priority: (r.priority || 'LOW') as any,
            status: r.status || 'SUBMITTED',
            location: r.location || '',
            building: r.building || 'Campus',
            room: r.room_number || '',
            studentId: r.created_by,
            studentName: 'Student Requester',
            department: r.category || departmentName,
            assignedStaffId: r.assigned_to,
            createdAt: r.created_at,
            updatedAt: r.updated_at,
          }))

          // STRICT FILTER: Service requests corresponding strictly to their department
          const deptOnly = mapped.filter(
            (r) =>
              r.category?.toLowerCase().includes(departmentName.toLowerCase()) ||
              departmentName.toLowerCase().includes(r.category?.toLowerCase() || '')
          )
          const myOnly = mapped.filter((r) => r.assignedStaffId === user.id)

          setDeptRequests(deptOnly)
          setAssignedRequests(myOnly.length > 0 ? myOnly : deptOnly.slice(0, 3))
          setLoading(false)
          return
        }

        // Fallback to mock data strictly filtered by this registered department
        const demoDept = getDepartmentRequests(departmentName)
        const demoAssigned = getStaffAssignedRequests(user.id).filter(
          (r) =>
            r.category?.toLowerCase().includes(departmentName.toLowerCase()) ||
            departmentName.toLowerCase().includes(r.category?.toLowerCase() || '')
        )
        setDeptRequests(demoDept)
        setAssignedRequests(demoAssigned.length > 0 ? demoAssigned : demoDept.slice(0, 2))
        setLoading(false)
        return
      }
    } catch (err) {
      console.warn('Live staff load notice:', err)
    }

    // Demo user fallback with strict department filtering
    const user = getCurrentDemoUser()
    setCurrentUser(user)
    const domain = (user as any).department || getDemoStaffDomain(user.id) || 'IT Support'
    setActiveDomain(domain)

    const dReqs = getDepartmentRequests(domain)
    setDeptRequests(dReqs)

    const myReqs = getStaffAssignedRequests(user.id).filter(
      (r) =>
        r.category?.toLowerCase().includes(domain.toLowerCase()) ||
        domain.toLowerCase().includes(r.category?.toLowerCase() || '')
    )
    setAssignedRequests(myReqs.length > 0 ? myReqs : dReqs.slice(0, 2))
    setLoading(false)
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
    setActiveDomain(newDomain)
    setDemoStaffDomain(currentUser.id, newDomain)
    setDeptRequests(getDepartmentRequests(newDomain))
  }

  const handleStartWork = (ticketId: string) => {
    if (!currentUser) return
    startWorkDemoRequest(ticketId, currentUser.name)
    loadData()
  }

  const handleOpenResolve = (ticket: DemoRequest) => {
    setResolvingTicket(ticket)
    setResolutionNote(
      ticket.category === 'IT Support'
        ? 'Inspected access point router on floor, updated network credentials, and validated signal strength.'
        : 'Replaced defective component, verified electrical safety standards, and restored full operation.'
    )
  }

  const handleConfirmResolve = (e: React.FormEvent) => {
    e.preventDefault()
    if (!resolvingTicket || !currentUser) return
    setIsSubmitting(true)
    resolveDemoRequest(resolvingTicket.id, resolutionNote, currentUser.name)
    setIsSubmitting(false)
    setResolvingTicket(null)
    loadData()
  }

  if (loading || !currentUser) {
    return <LoadingState message="Loading technician operations dashboard..." />
  }

  // Active list to display based on selected tab
  const baseList = activeTab === 'my-assigned' ? assignedRequests : deptRequests

  const filteredRequests = baseList.filter((req) => {
    const matchesSearch =
      req.ticketNumber?.toLowerCase().includes(search.toLowerCase()) ||
      req.title?.toLowerCase().includes(search.toLowerCase()) ||
      req.studentName?.toLowerCase().includes(search.toLowerCase()) ||
      req.location?.toLowerCase().includes(search.toLowerCase())

    const matchesPriority = priorityFilter === 'ALL' || req.priority === priorityFilter
    const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter

    return matchesSearch && matchesPriority && matchesStatus
  })

  // Priority sorting
  const priorityOrder: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 }
  const sortedRequests = [...filteredRequests].sort((a, b) => {
    const diff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0)
    if (diff !== 0) return diff
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  // Stats
  const statAssigned = assignedRequests.filter((r) => r.status === 'ASSIGNED').length
  const statInProgress = assignedRequests.filter((r) => r.status === 'IN_PROGRESS').length
  const statResolved = assignedRequests.filter((r) => r.status === 'RESOLVED' || r.status === 'CLOSED').length
  const statHighPriority = assignedRequests.filter(
    (r) => (r.priority === 'HIGH' || r.priority === 'CRITICAL') && r.status !== 'RESOLVED' && r.status !== 'CLOSED'
  ).length

  return (
    <div className="space-y-8 pb-16 font-sans">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 sm:p-7 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 mb-1">
            <Wrench className="w-3.5 h-3.5 text-emerald-600" />
            <span>Field Technician Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            My Assigned Requests
          </h1>
          <p className="text-sm text-slate-600 font-normal">
            Technician: <strong className="text-slate-900">{currentUser.name}</strong> • Active Domain:{' '}
            <span className="text-emerald-700 font-semibold">{activeDomain}</span>
          </p>
        </div>

        {/* REGISTERED WORK DOMAIN BADGE */}
        <div className="flex items-center gap-3 bg-blue-50/80 px-4 py-3 rounded-2xl border border-blue-200 shadow-2xs">
          <Building2 className="w-5 h-5 text-blue-700 shrink-0" />
          <div>
            <span className="block text-[10px] font-bold text-blue-600 uppercase tracking-wider">
              Assigned Department Queue
            </span>
            <span className="text-sm font-extrabold text-blue-950">
              {activeDomain}
            </span>
          </div>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned"
          value={statAssigned}
          subtitle="Waiting to start work"
          icon={Clock}
          color="blue"
        />

        <StatCard
          title="In Progress"
          value={statInProgress}
          subtitle="Active on-site repair"
          icon={PlayCircle}
          color="amber"
        />

        <StatCard
          title="Resolved"
          value={statResolved}
          subtitle="Successfully completed"
          icon={CheckCircle2}
          color="emerald"
        />

        <StatCard
          title="High / Critical Priority"
          value={statHighPriority}
          subtitle="Requires urgent attention"
          icon={AlertCircle}
          color="rose"
        />
      </div>

      {/* Main Queue Container with Tab Switcher */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Tab Headers */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 px-6 pt-5 pb-3 gap-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('my-assigned')}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'my-assigned'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>My Assigned Queue ({assignedRequests.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('department-queue')}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'department-queue'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>{activeDomain} Department Repair Queue ({deptRequests.length})</span>
            </button>
          </div>

          <span className="text-xs text-slate-500 font-medium">
            Sorted by Priority SLA (Critical → High → Med)
          </span>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-4 bg-slate-50/50 border-b border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6 relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search ticket #, issue title, student name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="sm:col-span-3">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                aria-label="Filter by Priority"
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ALL">All Priorities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter by Status"
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Requests Table */}
        {sortedRequests.length === 0 ? (
          <div className="p-12 text-center">
            <EmptyState
              title={activeTab === 'my-assigned' ? 'No Assigned Requests' : 'Department Queue Clear'}
              description={
                activeTab === 'my-assigned'
                  ? 'You currently have no repair tickets directly assigned to your queue.'
                  : `There are currently no repair tickets awaiting attention in the ${activeDomain} domain.`
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Ticket</th>
                  <th className="py-3.5 px-6">Request & Location</th>
                  <th className="py-3.5 px-6">Category</th>
                  <th className="py-3.5 px-6">Priority</th>
                  <th className="py-3.5 px-6">Student</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {sortedRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-mono text-xs font-bold text-emerald-800 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                        {req.ticketNumber}
                      </span>
                    </td>

                    <td className="py-4 px-6 max-w-sm">
                      <div className="font-semibold text-slate-900 line-clamp-1">
                        {req.title}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{req.location} {req.room ? `• ${req.room}` : ''}</span>
                      </div>
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
                      <StatusBadge status={req.status} />
                    </td>

                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        {req.status === 'ASSIGNED' && (
                          <button
                            type="button"
                            onClick={() => handleStartWork(req.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 shadow-2xs transition cursor-pointer"
                          >
                            Start Work
                          </button>
                        )}

                        {req.status === 'IN_PROGRESS' && (
                          <button
                            type="button"
                            onClick={() => handleOpenResolve(req)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-2xs transition cursor-pointer"
                          >
                            Resolve
                          </button>
                        )}

                        <Link
                          href={`/staff/requests/${req.id}`}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition"
                        >
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RESOLUTION MODAL */}
      {resolvingTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Resolve Service Ticket {resolvingTicket.ticketNumber}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{resolvingTicket.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setResolvingTicket(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmResolve} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Resolution Notes <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="Detail the work carried out, root cause fixed, and verification checks performed..."
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="p-3.5 bg-emerald-50 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Resolving this ticket updates the student's status and requests quality feedback.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setResolvingTicket(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !resolutionNote.trim()}
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-2xs transition disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Recording Resolution...' : 'Confirm Resolution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
