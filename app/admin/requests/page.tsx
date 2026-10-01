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
  User,
  ShieldCheck,
  Layers,
  Sparkles
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { PriorityBadge } from '@/components/ui/PriorityBadge'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { GlassCard } from '@/components/ui/GlassCard'
import { EmptyState } from '@/components/ui/EmptyState'

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
        req.ticket_number?.toLowerCase().includes(term) ||
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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <GlassCard className="p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" glow>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Layers className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Campus Service Request Directory
            </h1>
          </div>
          <p className="text-sm text-slate-400">
            Global management, triage, technician delegation, and lifecycle controls for all campus service tickets.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-cyan-400 shadow-sm">
            {filteredRequests.length} of {requests.length} Requests
          </span>
        </div>
      </GlassCard>

      {/* Filter and Search Bar */}
      <GlassCard className="p-4 sm:p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search ticket, title, staff..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-xs bg-slate-900/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-900/80 border border-slate-800 rounded-xl text-white outline-none focus:border-cyan-500 transition"
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
              className="w-full px-3 py-2 text-xs bg-slate-900/80 border border-slate-800 rounded-xl text-white outline-none focus:border-cyan-500 transition"
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
              className="w-full px-3 py-2 text-xs bg-slate-900/80 border border-slate-800 rounded-xl text-white outline-none focus:border-cyan-500 transition"
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
              className="w-full px-3 py-2 text-xs bg-slate-900/80 border border-slate-800 rounded-xl text-white outline-none focus:border-cyan-500 transition"
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
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
            <span className="text-slate-400">
              Showing <span className="font-semibold text-white">{filteredRequests.length}</span> matching tickets
            </span>
            <button
              onClick={clearFilters}
              className="inline-flex items-center space-x-1.5 text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        )}
      </GlassCard>

      {/* Main Content Area */}
      <GlassCard className="p-0 overflow-hidden">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 mx-auto animate-spin text-cyan-400" />
            <p className="text-xs text-slate-400">Loading campus requests database...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
            <p className="text-sm font-semibold text-white">Error Loading Requests</p>
            <p className="text-xs text-slate-400">{error}</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="py-16">
            <EmptyState
              icon={Inbox}
              title="No requests match criteria"
              description="Try adjusting your filters or search keywords to view tickets."
              actionLabel={hasActiveFilters ? "Clear Filters" : undefined}
              onAction={hasActiveFilters ? clearFilters : undefined}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800/80">
              <thead className="bg-slate-900/60">
                <tr>
                  <th className="px-6 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Ticket #
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Title & Category
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Assigned Staff
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3.5 text-right text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-900/40 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
                        {req.ticket_number || 'SR-0000'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white text-xs line-clamp-1 max-w-xs">{req.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{req.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <PriorityBadge priority={req.priority} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {req.assignee?.full_name ? (
                        <span className="inline-flex items-center space-x-1.5 text-xs text-indigo-300 font-medium">
                          <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{req.assignee.full_name}</span>
                        </span>
                      ) : (
                        <span className="text-xs text-amber-400 font-medium italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400">
                      <span>{req.location || 'Campus'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                      <Link
                        href={`/admin/requests/${req.id}`}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-cyan-500 hover:text-slate-950 text-slate-300 font-semibold transition"
                      >
                        <span>Manage</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  )
}
