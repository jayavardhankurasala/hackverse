'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  PlusCircle,
  Search,
  Filter,
  X,
  ClipboardList,
  Eye,
  ChevronRight,
} from 'lucide-react'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { PriorityBadge } from '@/components/ui/PriorityBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { LoadingState } from '@/components/ui/LoadingState'
import { getCurrentDemoUser, getStudentRequests } from '@/lib/demo/demo-service'
import { DemoRequest } from '@/lib/demo/types'

export default function RequestList() {
  const [requests, setRequests] = useState<DemoRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [categoryFilter, setCategoryFilter] = useState('ALL')

  const loadData = () => {
    const user = getCurrentDemoUser()
    const list = getStudentRequests(user.id)
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
  }, [])

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.ticketNumber?.toLowerCase().includes(search.toLowerCase()) ||
      req.title?.toLowerCase().includes(search.toLowerCase()) ||
      req.category?.toLowerCase().includes(search.toLowerCase()) ||
      req.location?.toLowerCase().includes(search.toLowerCase())

    const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter
    const matchesCategory = categoryFilter === 'ALL' || req.category === categoryFilter

    return matchesSearch && matchesStatus && matchesCategory
  })

  if (loading) {
    return <LoadingState message="Loading your service requests..." />
  }

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            My Service Requests
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            View, filter, and track all maintenance tickets submitted from your account.
          </p>
        </div>

        <Link
          href="/student/requests/new"
          className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs shadow-2xs transition-all self-start sm:self-auto cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report a Problem</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search by ticket #, title, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by Status"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
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
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filter by Category"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            >
              <option value="ALL">All Categories</option>
              <option value="IT Support">IT Support</option>
              <option value="Electrical">Electrical</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Hostel">Hostel</option>
              <option value="Cleaning">Cleaning</option>
              <option value="Transport">Transport</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredRequests.length === 0 ? (
          <div className="p-8 text-center">
            <EmptyState
              title="No Requests Found"
              description="No service requests matched your selected search criteria."
              actionLabel="Report a Problem"
              actionHref="/student/requests/new"
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-6">Ticket ID</th>
                  <th className="py-3 px-6">Problem Title</th>
                  <th className="py-3 px-6">Category</th>
                  <th className="py-3 px-6">Priority</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6">Created</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-bold text-emerald-700">
                      {req.ticketNumber}
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="font-semibold text-slate-900 line-clamp-1 max-w-sm">
                        {req.title}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {req.location} {req.room ? `• ${req.room}` : ''}
                      </div>
                    </td>
                    <td className="py-3.5 px-6 font-medium text-slate-600">
                      {req.category}
                    </td>
                    <td className="py-3.5 px-6">
                      <PriorityBadge priority={req.priority} />
                    </td>
                    <td className="py-3.5 px-6">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="py-3.5 px-6 text-slate-500 whitespace-nowrap">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-6 text-right whitespace-nowrap">
                      <Link
                        href={`/student/requests/${req.id}`}
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
