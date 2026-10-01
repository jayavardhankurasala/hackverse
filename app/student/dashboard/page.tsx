'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function StudentDashboard() {
  const [stats, setStats] = useState({ total: 0, submitted: 0, inProgress: 0, resolved: 0 })
  const [recentRequests, setRecentRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch stats
      const { data: requests } = await supabase
        .from('service_requests')
        .select('status, id, ticket_number, title, category, priority, created_at')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false })

      if (requests) {
        setStats({
          total: requests.length,
          submitted: requests.filter(r => r.status === 'SUBMITTED').length,
          inProgress: requests.filter(r => r.status === 'IN_PROGRESS').length,
          resolved: requests.filter(r => r.status === 'RESOLVED').length
        })
        setRecentRequests(requests.slice(0, 5))
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) {
    return <div className="p-8">Loading dashboard...</div>
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
          <Link 
            href="/student/requests/new"
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
          >
            Create Service Request
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-gray-500 text-sm font-medium">Total Requests</h3>
            <p className="text-3xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-gray-500 text-sm font-medium">Submitted</h3>
            <p className="text-3xl font-bold">{stats.submitted}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-gray-500 text-sm font-medium">In Progress</h3>
            <p className="text-3xl font-bold">{stats.inProgress}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-gray-500 text-sm font-medium">Resolved</h3>
            <p className="text-3xl font-bold">{stats.resolved}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border overflow-hidden">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h2 className="text-xl font-semibold">Recent Requests</h2>
            <Link href="/student/requests" className="text-blue-600 text-sm hover:underline">
              View all
            </Link>
          </div>
          {recentRequests.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No requests found. Create one to get started!
            </div>
          ) : (
            <div className="divide-y">
              {recentRequests.map(req => (
                <Link 
                  key={req.id} 
                  href={`/student/requests/${req.id}`}
                  className="block hover:bg-gray-50 p-6 transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900">{req.ticket_number} - {req.title}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Category: {req.category} | Created: {new Date(req.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {req.priority}
                      </span>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                        {req.status}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
  )
}
