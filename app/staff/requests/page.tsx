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
  Loader2,
  Wrench,
  Sparkles
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { PriorityBadge } from '@/components/ui/PriorityBadge'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { GlassCard } from '@/components/ui/GlassCard'
import { EmptyState } from '@/components/ui/EmptyState'

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
    return Array.from(cats).sort()
  }, [requests])

  // Client-side filtering logic
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      // 1. Search Query
      if (search.trim()) {
        const query = search.toLowerCase()
        const matchTitle = req.title.toLowerCase().includes(query)
        const matchTicket = req.ticket_number?.toLowerCase().includes(query)
        const matchDesc = req.description?.toLowerCase().includes(query)
        const matchBuilding = req.building?.toLowerCase().includes(query)
        const matchLocation = req.location?.toLowerCase().includes(query)
        if (!matchTitle && !matchTicket && !matchDesc && !matchBuilding && !matchLocation) {
          return false
        }
      }

      // 2. Status Filter
      if (statusFilter !== 'ALL' && req.status !== statusFilter) {
        return false
      }

      // 3. Priority Filter
      if (priorityFilter !== 'ALL' && req.priority !== priorityFilter) {
        return false
      }

      // 4. Category Filter
      if (categoryFilter !== 'ALL' && req.category !== categoryFilter) {
        return false
      }

      return true
    })
  }, [requests, search, statusFilter, priorityFilter, categoryFilter])

  const handleResetFilters = () => {
    setSearch('')
    setStatusFilter('ALL')
    setPriorityFilter('ALL')
    setCategoryFilter('ALL')
  }

  const isFiltered = search || statusFilter !== 'ALL' || priorityFilter !== 'ALL' || categoryFilter !== 'ALL'

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <GlassCard className="p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" glow>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Wrench className="w-5 h-5" />
            </span>
            <span>Assigned Service Queue</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage, execute, and mark resolutions for campus tickets dispatched to your account.
          </p>
        </div>

        <button
          onClick={fetchRequests}
          disabled={loading}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 text-xs font-semibold transition"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </GlassCard>

      {/* Filter and Search Bar */}
      <GlassCard className="p-4 sm:p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search ticket #, title, room..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-xs bg-slate-900/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
            />
          </div>

          {/* Status Dropdown */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-900/80 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500 transition"
            >
              <option value="ALL">All Statuses</option>
              <option value="ASSIGNED">Assigned (Waiting)</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          {/* Priority Dropdown */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-900/80 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500 transition"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-900/80 border border-slate-800 rounded-xl text-white outline-none focus:border-indigo-500 transition"
            >
              <option value="ALL">All Categories</option>
              {availableCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filters Active Counter & Reset */}
        {isFiltered && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
            <span className="text-slate-400">
              Showing <span className="font-semibold text-white">{filteredRequests.length}</span> of {requests.length} tickets
            </span>
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center space-x-1.5 text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        )}
      </GlassCard>

      {/* Main Request Queue List */}
      <GlassCard className="p-0 overflow-hidden">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 mx-auto animate-spin text-indigo-400" />
            <p className="text-xs text-slate-400">Loading your assignment queue...</p>
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
              title={isFiltered ? "No matching tickets" : "No tickets in your queue"}
              description={isFiltered ? "Try loosening your search terms or filters." : "You have completed all assigned tickets or haven't been assigned any new tasks yet."}
              actionLabel={isFiltered ? "Clear Filters" : undefined}
              onAction={isFiltered ? handleResetFilters : undefined}
            />
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {filteredRequests.map((req) => (
              <Link
                key={req.id}
                href={`/staff/requests/${req.id}`}
                className="block p-5 hover:bg-slate-900/60 transition-colors group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-950/60 px-2.5 py-0.5 rounded-lg border border-indigo-800/60">
                        {req.ticket_number || 'SR-0000'}
                      </span>
                      <PriorityBadge priority={req.priority} />
                      <StatusBadge status={req.status} />
                      <span className="text-xs font-medium text-slate-300 bg-slate-800/80 px-2.5 py-0.5 rounded-lg border border-slate-700/50">
                        {req.category}
                      </span>
                    </div>

                    <h3 className="text-base font-semibold text-white group-hover:text-indigo-400 transition-colors">
                      {req.title}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-1">
                      {req.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-400 pt-1">
                      <span className="flex items-center space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>
                          {req.location || 'Campus'}
                          {req.building ? ` • ${req.building}` : ''}
                          {req.room_number ? ` • Room ${req.room_number}` : ''}
                        </span>
                      </span>

                      <span className="flex items-center space-x-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>Created: {new Date(req.created_at).toLocaleDateString()}</span>
                      </span>

                      {req.assigned_at && (
                        <span className="flex items-center space-x-1.5 text-indigo-300">
                          <Clock className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Assigned: {new Date(req.assigned_at).toLocaleDateString()}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center self-end md:self-center">
                    <span className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 text-slate-300 border border-slate-700/60 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-500 transition-all shadow-sm">
                      <span>Action Ticket</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  )
}
