'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function RequestList() {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  useEffect(() => {
    async function fetchRequests() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('service_requests')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false })

      if (data) setRequests(data)
      setLoading(false)
    }
    fetchRequests()
  }, [])

  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.ticket_number.toLowerCase().includes(search.toLowerCase()) || 
                          req.title.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) return <div className="p-8">Loading requests...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">My Service Requests</h1>
        <Link href="/student/requests/new" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs shadow-xs transition">
          New Request
        </Link>
      </div>

        <div className="flex space-x-4 bg-white p-4 rounded-lg shadow border">
          <input 
            type="text" 
            placeholder="Search ticket or title..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUBMITTED">SUBMITTED</option>
            <option value="ASSIGNED">ASSIGNED</option>
            <option value="IN_PROGRESS">IN PROGRESS</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="CLOSED">CLOSED</option>
          </select>
        </div>

        <div className="bg-white rounded-lg shadow border overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ticket ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.map(req => (
                <tr key={req.id} className="hover:bg-gray-50 transition cursor-pointer" onClick={() => window.location.href = `/student/requests/${req.id}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{req.ticket_number}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{req.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">{req.priority}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{req.status}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(req.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredRequests.length === 0 && (
            <div className="p-8 text-center text-gray-500">No requests found matching criteria.</div>
          )}
        </div>
      </div>
  )
}
