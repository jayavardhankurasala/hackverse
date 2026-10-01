import { redirect } from 'next/navigation'
import { BarChart3, TrendingUp, Filter, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { AnalyticsCharts } from '@/components/admin/AnalyticsCharts'
import { GlassCard } from '@/components/ui/GlassCard'

export const dynamic = 'force-dynamic'

export default async function AdminAnalyticsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Check admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle()

  if (profile?.role !== 'ADMIN') {
    redirect('/login')
  }

  // Fetch all requests
  const { data: requests } = await supabase
    .from('service_requests')
    .select(`
      id,
      category,
      priority,
      status,
      created_at,
      department_id,
      departments ( name )
    `)

  const allReqs = requests || []

  // 1. Status Data
  const statuses = ['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']
  const statusData = statuses.map((s) => ({
    name: s,
    count: allReqs.filter((r) => r.status === s).length,
  }))

  // 2. Priority Data
  const priorityData = [
    { name: 'LOW', count: allReqs.filter((r) => r.priority === 'LOW').length, color: '#38bdf8' },
    { name: 'MEDIUM', count: allReqs.filter((r) => r.priority === 'MEDIUM').length, color: '#f59e0b' },
    { name: 'HIGH', count: allReqs.filter((r) => r.priority === 'HIGH').length, color: '#f97316' },
    { name: 'CRITICAL', count: allReqs.filter((r) => r.priority === 'CRITICAL').length, color: '#f43f5e' },
  ]

  // 3. Category Data
  const categoryCounts: Record<string, number> = {}
  allReqs.forEach((r) => {
    categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1
  })
  const categoryData = Object.entries(categoryCounts).map(([name, count]) => ({
    name,
    count,
  })).sort((a, b) => b.count - a.count)

  // 4. Department Data
  const deptCounts: Record<string, number> = {}
  allReqs.forEach((r) => {
    // @ts-expect-error join
    const deptName = r.departments?.name || 'Unassigned'
    deptCounts[deptName] = (deptCounts[deptName] || 0) + 1
  })
  const departmentData = Object.entries(deptCounts).map(([name, count]) => ({
    name,
    count,
  })).sort((a, b) => b.count - a.count)

  // 5. Timeline Data (Last 14 days)
  const timelineMap: Record<string, number> = {}
  const now = new Date()
  for (let i = 13; i >= 0; i--) {
    const d = new Date()
    d.setDate(now.getDate() - i)
    const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    timelineMap[key] = 0
  }

  allReqs.forEach((r) => {
    const d = new Date(r.created_at)
    const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    if (timelineMap[key] !== undefined) {
      timelineMap[key]++
    }
  })

  const timelineData = Object.entries(timelineMap).map(([date, requests]) => ({
    date,
    requests,
  }))

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <GlassCard className="p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" glow>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Operational Analytics & Intelligence
            </h1>
          </div>
          <p className="text-sm text-slate-400">
            Realtime telemetry on campus service requests, SLA velocity, category distribution, and department load.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-cyan-400 shadow-sm">
            {allReqs.length} Total Data Points
          </span>
        </div>
      </GlassCard>

      {/* Analytics Charts */}
      <AnalyticsCharts
        statusData={statusData}
        categoryData={categoryData}
        priorityData={priorityData}
        departmentData={departmentData}
        timelineData={timelineData}
      />
    </div>
  )
}
