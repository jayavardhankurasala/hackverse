'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { 
  Search, 
  RotateCcw, 
  ArrowRight, 
  MapPin, 
  Filter, 
  UserCheck, 
  Building2, 
  Loader2,
  AlertCircle,
  Inbox,
  User
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { PriorityBadge } from '@/components/ui/PriorityBadge'
import { StatusBadge } from '@/components/ui/StatusBadge'

interface RequestRecord {
  id: string
  ticket_number: string
  title: string
  description: string
  category: string
  priority: string
  status: string
  location?: string | null
  building?: string | null
  room_number?: string | null
  created_at: string
  updated_at: string
  department_id?: string | null
  assigned_to?: string | null
  departments?: any
  assignee?: { full_name: string } | null
}

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<RequestRecord[]>([])
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [priorityFilter, setPriorityFilter] = useState('ALL')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [deptFilter, setDeptFilter] = useState('ALL')

  const fetchRequests = async () => {
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Authentication required')
        setLoading(false)
        return
      }

      // Fetch all departments for filter
      const { data: deptData } = await supabase.from('departments').select('id, name')
      if (deptData) setDepartments(deptData)

      // Fetch all service requests with department
      const { data: reqData, error: reqErr } = await supabase
        .from('service_requests')
        .select(`
          id,
          ticket_number,
          title,
          description,
          category,
          priority,
          status,
          location,
          building,
          room_number,
          created_at,
          updated_at,
          department_id,
          assigned_to,
          departments ( name )
        `)
        .order('created_at', { ascending: false })

      if (reqErr) {
        setError(reqErr.message)
        setLoading(false)
        return
      }

      // Fetch staff names for assigned requests
      const assignedIds = Array.from(new Set((reqData || []).map((r) => r.assigned_to).filter(Boolean))) as string[]
      let staffMap: Record<string, string> = {}
      if (assignedIds.length > 0) {
        const { data: staffProfiles } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', assignedIds)

        if (staffProfiles) {
          staffProfiles.forEach((s) => {
            staffMap[s.user_id] = s.full_name
          })
        }
      }

      const formatted = (reqData || []).map((r) => ({
        ...r,
        assignee: r.assigned_to ? { full_name: staffMap[r.assigned_to] || 'Staff Member' } : null,
      }))

      setRequests(formatted)
    } catch (err: any) {
      setError(err?.message || 'Failed to load requests.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  // Filter requests
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const term = search.toLowerCase().trim()
      const matchesSearch =
        !term ||
        req.ticket_number.toLowerCase().includes(term) ||
        req.title.toLowerCase().includes(term) ||
        (req.description && req.description.toLowerCase().includes(term)) ||
        (req.location && req.location.toLowerCase().includes(term)) ||
        (req.assignee?.full_name && req.assignee.full_name.toLowerCase().includes(term))

      const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter
      const matchesPriority = priorityFilter === 'ALL' || req.priority === priorityFilter
      const matchesCategory = categoryFilter === 'ALL' || req.category === categoryFilter
      const matchesDept = deptFilter === 'ALL' || req.department_id === deptFilter

      return matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesDept
    })
  }, [requests, search, statusFilter, priorityFilter, categoryFilter, deptFilter])

  const hasActiveFilters =
    search !== '' ||
    statusFilter !== 'ALL' ||
    priorityFilter !== 'ALL' ||
    categoryFilter !== 'ALL' ||
    deptFilter !== 'ALL'

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('ALL')
    setPriorityFilter('ALL')
    setCategoryFilter('ALL')
    setDeptFilter('ALL')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Campus Service Requests
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Global management, triage, and assignment for all campus service tickets
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-900 text-white shadow-xs">
            {filteredRequests.length} of {requests.length} Requests
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search ticket, title, staff..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition font-medium text-gray-700"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED">SUBMITTED (Unassigned)</option>
              <option value="ASSIGNED">ASSIGNED</option>
              <option value="IN_PROGRESS">IN PROGRESS</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition font-medium text-gray-700"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition font-medium text-gray-700"
            >
              <option value="ALL">All Categories</option>
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

          {/* Department Filter */}
          <div>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition font-medium text-gray-700"
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-500">
            <span>Filtered results active</span>
            <button
              onClick={clearFilters}
              className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-xs">
          <Loader2 className="w-8 h-8 mx-auto animate-spin text-blue-600 mb-3" />
          <p className="text-sm font-medium text-gray-700">Loading campus requests...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center shadow-xs">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
          <h3 className="text-base font-bold text-red-800">Error loading requests</h3>
          <p className="text-xs text-red-600 mt-1">{error}</p>
          <button
            onClick={fetchRequests}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-xs">
          <Inbox className="w-10 h-10 text-gray-400 mx-auto mb-2" />
          <h3 className="text-base font-bold text-gray-900">No requests match criteria</h3>
          <p className="text-xs text-gray-500 mt-1">Try modifying your filters or search keywords.</p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 inline-flex items-center space-x-1 px-3.5 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Filters</span>
            </button>
          )}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/80">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Ticket ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Title & Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Assigned Staff
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredRequests.map((req) => (
                  <tr
                    key={req.id}
                    className="hover:bg-blue-50/40 transition-colors group cursor-pointer"
                    onClick={() => {
                      window.location.href = `/admin/requests/${req.id}`
                    }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-100">
                        {req.ticket_number}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition">
                        {req.title}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {req.category}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <PriorityBadge priority={req.priority} />
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-700">
                      {(Array.isArray(req.departments) ? req.departments[0]?.name : req.departments?.name) ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 font-medium">
                          <Building2 className="w-3 h-3 text-indigo-500" />
                          <span>{Array.isArray(req.departments) ? req.departments[0]?.name : req.departments?.name}</span>
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">Unassigned Dept</span>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-600">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span>{req.location || 'Campus'}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={req.status} />
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-xs">
                      {req.assignee ? (
                        <span className="inline-flex items-center space-x-1 text-gray-800 font-medium bg-purple-50 text-purple-800 border border-purple-200 px-2 py-0.5 rounded-full">
                          <UserCheck className="w-3 h-3 text-purple-600" />
                          <span>{req.assignee.full_name}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full text-[11px] font-semibold">
                          <span>Unassigned</span>
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                      {new Date(req.created_at).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                      <Link
                        href={`/admin/requests/${req.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg font-semibold bg-gray-100 text-gray-700 group-hover:bg-slate-900 group-hover:text-white transition shadow-2xs"
                      >
                        <span>Manage</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
