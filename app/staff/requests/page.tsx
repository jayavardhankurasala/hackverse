'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Search,
  Filter,
  RotateCcw,
  ArrowRight,
  MapPin,
  Calendar,
  Clock,
  AlertCircle,
  Inbox,
  Wrench,
  Sliders,
  Layers,
  Eye,
} from 'lucide-react'
import { PriorityBadge } from '@/components/ui/PriorityBadge'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingState } from '@/components/ui/LoadingState'
import {
  getCurrentDemoUser,
  getStaffAssignedRequests,
  getDepartmentRequests,
  getDemoStaffDomain,
} from '@/lib/demo/demo-service'
import { DemoRequest, DemoUser } from '@/lib/demo/types'
import { createClient } from '@/utils/supabase/client'

export default function StaffRequestsPage() {
  const [currentUser, setCurrentUser] = useState<DemoUser | null>(null)
  const [requests, setRequests] = useState<DemoRequest[]>([])
  const [loading, setLoading] = useState(true)

  // Filters state
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [priorityFilter, setPriorityFilter] = useState('ALL')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [viewScope, setViewScope] = useState<'assigned' | 'department'>('assigned')

  const loadData = async () => {
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user || (await supabase.auth.getUser()).data.user

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*, departments(id, name)')
          .eq('user_id', user.id)
          .maybeSingle()

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

        const { data: dbRequests } = await supabase
          .from('service_requests')
          .select('*')
          .order('created_at', { ascending: false })

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

          // STRICT FILTER: Only tickets in their assigned department
          const deptOnly = mapped.filter(
            (r) =>
              r.category?.toLowerCase().includes(departmentName.toLowerCase()) ||
              departmentName.toLowerCase().includes(r.category?.toLowerCase() || '')
          )
          const myOnly = mapped.filter((r) => r.assignedStaffId === user.id)

          setRequests(viewScope === 'assigned' ? (myOnly.length > 0 ? myOnly : deptOnly) : deptOnly)
          setLoading(false)
          return
        }

        const demoDept = getDepartmentRequests(departmentName)
        const demoAssigned = getStaffAssignedRequests(user.id).filter(
          (r) =>
            r.category?.toLowerCase().includes(departmentName.toLowerCase()) ||
            departmentName.toLowerCase().includes(r.category?.toLowerCase() || '')
        )
        setRequests(viewScope === 'assigned' ? (demoAssigned.length > 0 ? demoAssigned : demoDept) : demoDept)
        setLoading(false)
        return
      }
    } catch (err) {
      console.warn('Live staff requests notice:', err)
    }

    const user = getCurrentDemoUser()
    setCurrentUser(user)
    const domain = (user as any).department || getDemoStaffDomain(user.id) || 'IT Support'

    const list =
      viewScope === 'assigned'
        ? getStaffAssignedRequests(user.id).filter(
            (r) =>
              r.category?.toLowerCase().includes(domain.toLowerCase()) ||
              domain.toLowerCase().includes(r.category?.toLowerCase() || '')
          )
        : getDepartmentRequests(domain)

    setRequests(list)
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
  }, [viewScope])

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.ticketNumber?.toLowerCase().includes(search.toLowerCase()) ||
      req.title?.toLowerCase().includes(search.toLowerCase()) ||
      req.studentName?.toLowerCase().includes(search.toLowerCase()) ||
      req.location?.toLowerCase().includes(search.toLowerCase())

    const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter
    const matchesPriority = priorityFilter === 'ALL' || req.priority === priorityFilter
    const matchesCategory = categoryFilter === 'ALL' || req.category === categoryFilter

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory
  })

  if (loading || !currentUser) {
    return <LoadingState message="Loading technician requests..." />
  }

  return (
    <div className="space-y-6 pb-16 font-sans">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Assigned Work Orders
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete list of facilities requests assigned to technician{' '}
            <strong className="text-slate-800">{currentUser.name}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setViewScope('assigned')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              viewScope === 'assigned'
                ? 'bg-white text-emerald-800 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Assigned ({getStaffAssignedRequests(currentUser.id).length})
          </button>
          <button
            onClick={() => setViewScope('department')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              viewScope === 'department'
                ? 'bg-white text-emerald-800 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Department Queue ({getDepartmentRequests(getDemoStaffDomain(currentUser.id)).length})
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-4 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search ticket #, title, student..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by Status"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Statuses</option>
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
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filter by Category"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Categories</option>
              <option value="IT Support">IT Support</option>
              <option value="Electrical">Electrical</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Hostel">Hostel</option>
              <option value="Cleaning">Cleaning</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredRequests.length === 0 ? (
          <div className="p-10 text-center">
            <EmptyState
              title="No Work Orders Found"
              description="No tickets matched your current search filters."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-6">Ticket</th>
                  <th className="py-3 px-6">Problem & Location</th>
                  <th className="py-3 px-6">Category</th>
                  <th className="py-3 px-6">Priority</th>
                  <th className="py-3 px-6">Student</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-bold text-emerald-700 whitespace-nowrap">
                      {req.ticketNumber}
                    </td>

                    <td className="py-3.5 px-6 max-w-sm">
                      <div className="font-semibold text-slate-900 line-clamp-1">
                        {req.title}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {req.location} {req.room ? `• ${req.room}` : ''}
                      </div>
                    </td>

                    <td className="py-3.5 px-6 font-medium text-slate-600 whitespace-nowrap">
                      {req.category}
                    </td>

                    <td className="py-3.5 px-6 whitespace-nowrap">
                      <PriorityBadge priority={req.priority} />
                    </td>

                    <td className="py-3.5 px-6 font-medium text-slate-700 whitespace-nowrap">
                      {req.studentName}
                    </td>

                    <td className="py-3.5 px-6 whitespace-nowrap">
                      <StatusBadge status={req.status} />
                    </td>

                    <td className="py-3.5 px-6 text-right whitespace-nowrap">
                      <Link
                        href={`/staff/requests/${req.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
