'use client'

import { useEffect, useState, useMemo } from 'react'
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
  Loader2
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { PriorityBadge } from '@/components/ui/PriorityBadge'
import { StatusBadge } from '@/components/ui/StatusBadge'

interface RequestItem {
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
  assigned_at?: string | null
}

export default function StaffRequestsPage() {
  const [requests, setRequests] = useState<RequestItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters state
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [priorityFilter, setPriorityFilter] = useState('ALL')
  const [categoryFilter, setCategoryFilter] = useState('ALL')

  const fetchRequests = async () => {
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const { data: { user }, error: authErr } = await supabase.auth.getUser()
      if (authErr || !user) {
        setError('You must be logged in to view assigned requests.')
        setLoading(false)
        return
      }

      // Query only requests assigned to the currently authenticated staff user
      const { data, error: fetchErr } = await supabase
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
          assigned_at
        `)
        .eq('assigned_to', user.id)
        .order('created_at', { ascending: false })

      if (fetchErr) {
        setError(fetchErr.message)
      } else {
        setRequests(data || [])
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred while fetching requests.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  // Extract distinct categories from requests
  const availableCategories = useMemo(() => {
    const cats = new Set<string>()
    requests.forEach((r) => {
      if (r.category) cats.add(r.category)
    })
    return Array.from(cats)
  }, [requests])

  // Filter requests
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const term = search.toLowerCase().trim()
      const matchesSearch =
        !term ||
        req.ticket_number.toLowerCase().includes(term) ||
        req.title.toLowerCase().includes(term) ||
        (req.description && req.description.toLowerCase().includes(term)) ||
        (req.location && req.location.toLowerCase().includes(term))

      const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter
      const matchesPriority = priorityFilter === 'ALL' || req.priority === priorityFilter
      const matchesCategory = categoryFilter === 'ALL' || req.category === categoryFilter

      return matchesSearch && matchesStatus && matchesPriority && matchesCategory
    })
  }, [requests, search, statusFilter, priorityFilter, categoryFilter])

  const hasActiveFilters =
    search !== '' || statusFilter !== 'ALL' || priorityFilter !== 'ALL' || categoryFilter !== 'ALL'

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('ALL')
    setPriorityFilter('ALL')
    setCategoryFilter('ALL')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Assigned Service Requests
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Review, track, and update all service tickets assigned to you
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            {filteredRequests.length} of {requests.length} Requests
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search ticket #, title, location..."
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
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition font-medium text-gray-700"
            >
              <option value="ALL">All Statuses</option>
              <option value="ASSIGNED">ASSIGNED (Queued)</option>
              <option value="IN_PROGRESS">IN PROGRESS (Active)</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition font-medium text-gray-700"
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
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition font-medium text-gray-700"
            >
              <option value="ALL">All Categories</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear Filters Indicator */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-500">
            <span>Filters active</span>
            <button
              onClick={clearFilters}
              className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset all filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-xs">
          <Loader2 className="w-8 h-8 mx-auto animate-spin text-blue-600 mb-3" />
          <p className="text-sm font-medium text-gray-700">Loading your assigned requests...</p>
          <p className="text-xs text-gray-400 mt-1">Fetching live data from Supabase</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center shadow-xs">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
          <h3 className="text-base font-bold text-red-800">Failed to load requests</h3>
          <p className="text-xs text-red-600 mt-1">{error}</p>
          <button
            onClick={fetchRequests}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-xs">
          <div className="w-12 h-12 mx-auto rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-gray-900">No requests assigned</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            You currently have no service requests assigned to your queue. Any assignments made by campus administration will automatically appear here.
          </p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-xs">
          <Filter className="w-8 h-8 mx-auto text-gray-400 mb-2" />
          <h3 className="text-sm font-bold text-gray-900">No matching requests found</h3>
          <p className="text-xs text-gray-500 mt-1">
            No service requests matched your current search and filter criteria.
          </p>
          <button
            onClick={clearFilters}
            className="mt-4 inline-flex items-center space-x-1.5 px-3.5 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Filters</span>
          </button>
        </div>
      ) : (
        /* Requests Table / Cards */
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
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
                    Location
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Created / Updated
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
                      window.location.href = `/staff/requests/${req.id}`
                    }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-100">
                        {req.ticket_number}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {req.title}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {req.category}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <PriorityBadge priority={req.priority} />
                    </td>

                    <td className="px-6 py-4 text-xs text-gray-600">
                      <div className="flex items-center space-x-1 font-medium text-gray-800">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>{req.location || 'Campus'}</span>
                      </div>
                      {(req.building || req.room_number) && (
                        <div className="text-gray-400 text-[11px] pl-4 mt-0.5">
                          {req.building ? `${req.building}` : ''}
                          {req.room_number ? ` • Room ${req.room_number}` : ''}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={req.status} />
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                      <div>Created: {new Date(req.created_at).toLocaleDateString()}</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        Updated: {new Date(req.updated_at).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                      <Link
                        href={`/staff/requests/${req.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg font-semibold bg-gray-100 text-gray-700 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-2xs"
                      >
                        <span>View</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile & Tablet Card View */}
          <div className="block lg:hidden divide-y divide-gray-100">
            {filteredRequests.map((req) => (
              <Link
                key={req.id}
                href={`/staff/requests/${req.id}`}
                className="block p-4 sm:p-5 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                    {req.ticket_number}
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <PriorityBadge priority={req.priority} />
                    <StatusBadge status={req.status} />
                  </div>
                </div>

                <h3 className="text-base font-semibold text-gray-900 mb-1">
                  {req.title}
                </h3>

                <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                  {req.description}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    <span>{req.location || 'Campus'} {req.building ? `(${req.building})` : ''}</span>
                  </span>

                  <span className="text-blue-600 font-semibold inline-flex items-center space-x-1">
                    <span>Manage</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
