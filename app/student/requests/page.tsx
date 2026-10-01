'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  PlusCircle,
  Search,
  Filter,
  X,
  ClipboardList,
  Inbox,
  ArrowUpDown,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { GlassCard } from '@/components/ui/GlassCard'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { PriorityBadge } from '@/components/ui/PriorityBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { TableSkeleton } from '@/components/ui/LoadingState'

export default function RequestList() {
  const router = useRouter()
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [categoryFilter, setCategoryFilter] = useState('ALL')

  useEffect(() => {
    async function fetchRequests() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
          .from('service_requests')
          .select('*')
          .eq('created_by', user.id)
          .order('created_at', { ascending: false })

        if (data) setRequests(data)
      } catch {
        // Fallback
      } finally {
        setLoading(false)
      }
    }
    fetchRequests()
  }, [])

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.ticket_number?.toLowerCase().includes(search.toLowerCase()) ||
      req.title?.toLowerCase().includes(search.toLowerCase()) ||
      req.category?.toLowerCase().includes(search.toLowerCase()) ||
      req.location?.toLowerCase().includes(search.toLowerCase())

    const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter
    const matchesCategory = categoryFilter === 'ALL' || req.category === categoryFilter

    return matchesSearch && matchesStatus && matchesCategory
  })

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            My Service Requests
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            View, filter, and track all maintenance tickets submitted from your account.
          </p>
        </div>

        <Link
          href="/student/requests/new"
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs shadow-lg shadow-blue-600/25 border border-blue-400/30 transition-all hover:scale-[1.02] self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Request</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <GlassCard className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="sm:col-span-6 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search by ticket #, title, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="sm:col-span-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
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
        </div>
      </GlassCard>

      {/* Requests Table */}
      <GlassCard className="p-0 overflow-hidden shadow-2xl">
        {loading ? (
          <TableSkeleton rows={5} />
        ) : filteredRequests.length === 0 ? (
          <div className="p-10">
            <EmptyState
              icon={Inbox}
              title={requests.length === 0 ? 'No requests logged yet' : 'No matching tickets found'}
              description={
                requests.length === 0
                  ? 'Submit your first facilities or IT maintenance ticket to get campus staff dispatched.'
                  : 'Try clearing your search query or switching your status filter.'
              }
              actionLabel={requests.length === 0 ? 'Create Service Request' : 'Reset Filters'}
              actionHref={requests.length === 0 ? '/student/requests/new' : undefined}
              onAction={requests.length > 0 ? () => { setSearch(''); setStatusFilter('ALL'); setCategoryFilter('ALL'); } : undefined}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800 text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-3.5">Ticket ID</th>
                  <th className="px-6 py-3.5">Title & Location</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Priority</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Date Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredRequests.map((req) => (
                  <tr
                    key={req.id}
                    onClick={() => router.push(`/student/requests/${req.id}`)}
                    className="hover:bg-slate-800/50 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap font-mono font-bold text-blue-400 group-hover:text-blue-300">
                      {req.ticket_number}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white group-hover:text-blue-300 transition-colors">
                        {req.title}
                      </div>
                      {req.location && (
                        <div className="text-[11px] text-slate-500 mt-0.5 truncate max-w-xs">
                          {req.location} {req.building ? `(${req.building})` : ''}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-400">
                      {req.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <PriorityBadge priority={req.priority} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                      {new Date(req.created_at).toLocaleDateString()}
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
