'use client'

import { useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import {
  BarChart3,
  TrendingUp,
  Filter,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Flame,
  Zap,
  RotateCw,
  Building2,
  Wrench,
  Bus,
  ShieldAlert,
  Calendar,
  Layers,
  Check,
} from 'lucide-react'
import { AnalyticsCharts } from '@/components/admin/AnalyticsCharts'
import { CampusHeatmap } from '@/components/admin/CampusHeatmap'
import { StatCard } from '@/components/ui/StatCard'
import { LoadingState } from '@/components/ui/LoadingState'
import { getDemoRequests } from '@/lib/demo/demo-service'
import { DemoRequest } from '@/lib/demo/types'
import {
  getPredictiveMaintenanceInsights,
  PredictiveAnalysisResult,
} from '@/actions/analytics'

interface DepartmentMTTR {
  department: string
  mttrHours: number
  targetHours: number
  compliancePct: number
  status: 'EXCELLENT' | 'GOOD' | 'NEEDS_ATTENTION'
}

const BASELINE_MTTR: DepartmentMTTR[] = [
  { department: 'Cleaning', mttrHours: 0.8, targetHours: 1.5, compliancePct: 98, status: 'EXCELLENT' },
  { department: 'IT Support', mttrHours: 1.2, targetHours: 2.0, compliancePct: 96, status: 'EXCELLENT' },
  { department: 'Electrical', mttrHours: 1.8, targetHours: 2.5, compliancePct: 94, status: 'GOOD' },
  { department: 'Hostel', mttrHours: 1.9, targetHours: 3.0, compliancePct: 95, status: 'GOOD' },
  { department: 'Maintenance', mttrHours: 2.1, targetHours: 4.0, compliancePct: 92, status: 'GOOD' },
  { department: 'Plumbing', mttrHours: 2.4, targetHours: 3.0, compliancePct: 91, status: 'GOOD' },
  { department: 'Transport', mttrHours: 3.2, targetHours: 4.0, compliancePct: 89, status: 'NEEDS_ATTENTION' },
  { department: 'Administration', mttrHours: 4.0, targetHours: 6.0, compliancePct: 93, status: 'GOOD' },
]

export default function AdminAnalyticsPage() {
  const [requests, setRequests] = useState<DemoRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null)

  // AI Predictive Insights State
  const [aiInsights, setAiInsights] = useState<PredictiveAnalysisResult | null>(null)
  const [isPendingAi, startAiTransition] = useTransition()

  const loadData = () => {
    const all = getDemoRequests()
    setRequests(all)
    setLoading(false)
  }

  const loadPredictiveInsights = (currentRequests: DemoRequest[]) => {
    startAiTransition(async () => {
      const criticalCount = currentRequests.filter((r) => r.priority === 'CRITICAL').length
      const res = await getPredictiveMaintenanceInsights({
        totalTickets: currentRequests.length,
        criticalCount,
        topHotspots: [
          { name: 'Hostel Block B', count: 11, primaryDomain: 'Electrical & Plumbing' },
          { name: 'Hostel Block A', count: 7, primaryDomain: 'IT & Room Locks' },
          { name: 'Academic Block 1', count: 6, primaryDomain: 'CAD Lab AC & Network' },
          { name: 'Transport Fleet Terminal', count: 4, primaryDomain: 'Buses 4 & 14 Tire Pressure' },
        ],
        mttrSummary: BASELINE_MTTR.map((m) => ({
          department: m.department,
          mttrHours: m.mttrHours,
        })),
      })
      setAiInsights(res)
    })
  }

  useEffect(() => {
    loadData()
    const all = getDemoRequests()
    loadPredictiveInsights(all)

    const handleUpdate = () => {
      loadData()
      const updated = getDemoRequests()
      loadPredictiveInsights(updated)
    }
    window.addEventListener('demo-data-changed', handleUpdate)
    return () => window.removeEventListener('demo-data-changed', handleUpdate)
  }, [])

  if (loading) {
    return <LoadingState message="Loading administrative analytics telemetry..." />
  }

  const total = requests.length
  const resolved = requests.filter((r) => r.status === 'RESOLVED' || r.status === 'CLOSED').length
  const critical = requests.filter((r) => r.priority === 'CRITICAL').length
  const active = requests.filter(
    (r) => r.status === 'SUBMITTED' || r.status === 'ASSIGNED' || r.status === 'IN_PROGRESS'
  ).length

  // Overall average MTTR
  const avgMttr = (
    BASELINE_MTTR.reduce((acc, m) => acc + m.mttrHours, 0) / BASELINE_MTTR.length
  ).toFixed(1)

  // Status breakdown
  const statuses = ['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']
  const statusData = statuses.map((s) => ({
    name: s,
    count: requests.filter((r) => r.status === s).length,
  }))

  // Category breakdown
  const categoryCounts: Record<string, number> = {}
  requests.forEach((r) => {
    categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1
  })
  const categoryData = Object.entries(categoryCounts).map(([name, count]) => ({
    name,
    count,
  }))

  // Priority breakdown
  const priorityData = [
    { name: 'LOW', count: requests.filter((r) => r.priority === 'LOW').length },
    { name: 'MEDIUM', count: requests.filter((r) => r.priority === 'MEDIUM').length },
    { name: 'HIGH', count: requests.filter((r) => r.priority === 'HIGH').length },
    { name: 'CRITICAL', count: critical },
  ]

  const timelineData = [
    { date: 'Day 1', requests: 4 },
    { date: 'Day 3', requests: 6 },
    { date: 'Day 6', requests: 8 },
    { date: 'Day 9', requests: 14 },
    { date: 'Day 12', requests: 22 },
    { date: 'Today', requests: requests.length },
  ]

  // Failure Hot-Spots Computation
  const hotspotConfigs = [
    {
      name: 'Hostel Block B',
      code: 'HB-B',
      count: requests.filter((r) => (r.building || r.location || '').toLowerCase().includes('block b')).length,
      primaryIssue: 'Electrical short circuits & Main pipe bursts',
      risk: 'HIGH' as const,
      color: 'bg-rose-500',
    },
    {
      name: 'Hostel Block A',
      code: 'HB-A',
      count: requests.filter((r) => (r.building || r.location || '').toLowerCase().includes('block a')).length,
      primaryIssue: 'Wi-Fi disconnects & Door lock stiction',
      risk: 'MODERATE' as const,
      color: 'bg-amber-500',
    },
    {
      name: 'Academic Block 1 (Labs)',
      code: 'AB-1',
      count: requests.filter((r) => (r.building || r.location || '').toLowerCase().includes('academic') || (r.location || '').toLowerCase().includes('cad')).length,
      primaryIssue: 'CAD Lab 3rd floor AC short & projector ports',
      risk: 'MODERATE' as const,
      color: 'bg-amber-500',
    },
    {
      name: 'Transport Fleet Terminal',
      code: 'TRN',
      count: requests.filter((r) => r.category === 'Transport' || (r.building || r.location || '').toLowerCase().includes('bus')).length,
      primaryIssue: 'Buses 4 & 14 tire pressure & door latches',
      risk: 'MODERATE' as const,
      color: 'bg-indigo-500',
    },
    {
      name: 'Hostel Block C',
      code: 'HB-C',
      count: requests.filter((r) => (r.building || r.location || '').toLowerCase().includes('block c')).length,
      primaryIssue: 'Steel almirahs & mosquito net meshes',
      risk: 'LOW' as const,
      color: 'bg-emerald-500',
    },
    {
      name: 'Central Library',
      code: 'LIB',
      count: requests.filter((r) => (r.building || r.location || '').toLowerCase().includes('library')).length,
      primaryIssue: 'Wi-Fi red indicator lights & reading bay lamps',
      risk: 'LOW' as const,
      color: 'bg-emerald-500',
    },
  ]

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 font-sans">
      <div>
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Command Center</span>
        </Link>
      </div>

      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Campus Operations & Predictive Intelligence
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time MTTR telemetry, building failure hot-spots, and AI-forecasted preventive actions for Dean & Leadership.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>94.8% SLA Compliance</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Campus MTTR: {avgMttr}h</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total Service Volume"
          value={total}
          subtitle="Requests cataloged"
          icon={BarChart3}
          color="green"
        />
        <StatCard
          title="Active Work Orders"
          value={active}
          subtitle="In pipeline"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Mean Time To Resolve"
          value={`${avgMttr} hrs`}
          subtitle="Across 8 departments"
          icon={Zap}
          color="indigo"
        />
        <StatCard
          title="Resolved Successfully"
          value={resolved}
          subtitle="Closed satisfactorily"
          icon={CheckCircle2}
          color="emerald"
        />
      </div>

      {/* AI PREDICTIVE MAINTENANCE SUMMARY FOR CAMPUS DEAN */}
      <div className="bg-linear-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl border border-slate-700 shadow-lg p-6 sm:p-7 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/60 pb-5 mb-5 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1.5 border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>AI Facilities Intelligence</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Campus Dean Executive Forecast: 3 Key Preventive Actions
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              {aiInsights?.executiveSummary ||
                'Preemptive failure detection correlating active work orders, electrical surges, and transit wear.'}
            </p>
          </div>

          <button
            onClick={() => loadPredictiveInsights(requests)}
            disabled={isPendingAi}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition disabled:opacity-50 cursor-pointer shadow-xs self-start sm:self-auto shrink-0"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isPendingAi ? 'animate-spin' : ''}`} />
            <span>{isPendingAi ? 'Evaluating Telemetry...' : 'Refresh AI Forecast'}</span>
          </button>
        </div>

        {/* 3 Executive Insight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
          {aiInsights?.insights.map((insight, idx) => {
            const isCrit = insight.impact === 'CRITICAL'
            const isHigh = insight.impact === 'HIGH'
            return (
              <div
                key={idx}
                className="bg-slate-800/80 backdrop-blur-md rounded-xl border border-slate-700/80 p-4.5 flex flex-col justify-between space-y-3 hover:border-emerald-500/50 transition shadow-xs"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-2xs font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        isCrit
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : isHigh
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {insight.impact} RISK
                    </span>
                    <span className="text-2xs text-slate-400 font-mono flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {insight.timeframe}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white tracking-tight leading-snug">
                    {insight.title}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {insight.recommendation}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-2xs text-slate-400">
                  <span>Target: Dean / Facilities Director</span>
                  <span className="text-emerald-400 font-semibold">Priority Action</span>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-between text-2xs text-slate-400">
          <span>Generated: {aiInsights?.generatedAt || 'Just now'}</span>
          <span>Powered by Groq Llama-3.3-70b Facilities Reasoning Engine</span>
        </div>
      </div>

      {/* SECTION: MTTR BY DEPARTMENT */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-2xs font-semibold text-emerald-800 mb-1">
              <Zap className="w-3 h-3 text-emerald-600" />
              <span>Turnaround Speed Telemetry</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Department MTTR (Mean Time to Resolution)
            </h2>
            <p className="text-xs text-slate-500">
              Benchmark comparison of average hours to close requests vs college SLA targets.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg self-start sm:self-auto">
            Target SLA: &lt; 4.0 Hours
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {BASELINE_MTTR.map((dept) => {
            const isFast = dept.mttrHours < 2.0
            return (
              <div
                key={dept.department}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-emerald-300 hover:shadow-xs transition"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-bold text-slate-900">{dept.department}</h3>
                  <span
                    className={`text-2xs font-semibold px-2 py-0.5 rounded-full ${
                      dept.status === 'EXCELLENT'
                        ? 'bg-emerald-100 text-emerald-800'
                        : dept.status === 'GOOD'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {dept.compliancePct}% On-Time
                  </span>
                </div>

                <div className="flex items-baseline space-x-2 mb-2">
                  <span className="text-2xl font-black text-slate-900 font-mono">
                    {dept.mttrHours}h
                  </span>
                  <span className="text-2xs text-slate-500">
                    / Target: {dept.targetHours}h
                  </span>
                </div>

                {/* Visual Progress Bar */}
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      isFast ? 'bg-emerald-500' : 'bg-blue-500'
                    }`}
                    style={{
                      width: `${Math.min(100, (dept.mttrHours / dept.targetHours) * 100)}%`,
                    }}
                  />
                </div>

                <div className="mt-2 text-2xs text-slate-500 flex justify-between items-center">
                  <span>SLA Margin</span>
                  <span className="font-semibold text-emerald-700">
                    +{(dept.targetHours - dept.mttrHours).toFixed(1)}h ahead
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* SECTION: CAMPUS FAILURE HOT-SPOTS */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-2xs font-semibold text-rose-800 mb-1">
              <Flame className="w-3 h-3 text-rose-600" />
              <span>Incident Concentration Matrix</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Campus Failure Hot-Spots
            </h2>
            <p className="text-xs text-slate-500">
              Hostel blocks and academic facilities filing disproportionate maintenance volumes.
            </p>
          </div>
          <span className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1 rounded-lg self-start sm:self-auto">
            1 Critical Focus Zone
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hotspotConfigs.map((spot) => (
            <div
              key={spot.name}
              className={`p-4.5 rounded-xl border transition ${
                spot.risk === 'HIGH'
                  ? 'border-rose-200 bg-rose-50/40 ring-1 ring-rose-200'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {spot.code}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">{spot.name}</h3>
                </div>
                <span
                  className={`text-2xs font-extrabold uppercase px-2 py-0.5 rounded-full ${
                    spot.risk === 'HIGH'
                      ? 'bg-rose-100 text-rose-800'
                      : spot.risk === 'MODERATE'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {spot.risk} VOL
                </span>
              </div>

              <div className="text-2xl font-black text-slate-900 mb-1 font-mono">
                {spot.count} <span className="text-xs font-normal text-slate-500">Tickets</span>
              </div>

              <p className="text-xs text-slate-600 mb-3 line-clamp-1">
                <strong className="text-slate-800 font-semibold">Primary: </strong>
                {spot.primaryIssue}
              </p>

              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${spot.color}`}
                  style={{ width: `${Math.min(100, (spot.count / 15) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION: INTERACTIVE CAMPUS HEATMAP */}
      <CampusHeatmap
        requests={requests}
        selectedBlock={selectedBlock}
        onSelectBlock={setSelectedBlock}
      />

      {/* Standard Charts Component */}
      <AnalyticsCharts
        statusData={statusData}
        categoryData={categoryData}
        priorityData={priorityData}
        departmentData={[]}
        timelineData={timelineData}
      />
    </div>
  )
}
