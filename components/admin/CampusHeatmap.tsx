'use client'

import React, { useMemo } from 'react'
import {
  Building2,
  AlertTriangle,
  Flame,
  CheckCircle2,
  MapPin,
  Bus,
  BookOpen,
  Coffee,
  Building,
  GraduationCap,
  Sparkles,
  Filter,
  X,
  ShieldAlert,
} from 'lucide-react'
import { DemoRequest } from '@/lib/demo/types'

interface CampusBlockConfig {
  id: string
  name: string
  shortCode: string
  type: 'HOSTEL' | 'ACADEMIC' | 'FACILITY' | 'TRANSPORT'
  icon: any
  matchKeywords: string[]
  description: string
}

const SVEC_CAMPUS_BLOCKS: CampusBlockConfig[] = [
  {
    id: 'hostel-b',
    name: 'Hostel Block B',
    shortCode: 'HB-B',
    type: 'HOSTEL',
    icon: Building2,
    matchKeywords: ['block b', 'hostel block b', 'hb-b', 'hostel b'],
    description: 'Senior Student Residency & Common Dining',
  },
  {
    id: 'hostel-a',
    name: 'Hostel Block A',
    shortCode: 'HB-A',
    type: 'HOSTEL',
    icon: Building2,
    matchKeywords: ['block a', 'hostel block a', 'hb-a', 'hostel a'],
    description: 'Junior Student Residency Wing',
  },
  {
    id: 'hostel-c',
    name: 'Hostel Block C',
    shortCode: 'HB-C',
    type: 'HOSTEL',
    icon: Building2,
    matchKeywords: ['block c', 'hostel block c', 'hb-c', 'hostel c'],
    description: 'Women Student Residency & Study Wing',
  },
  {
    id: 'acad-1',
    name: 'Academic Block 1',
    shortCode: 'AB-1',
    type: 'ACADEMIC',
    icon: GraduationCap,
    matchKeywords: ['academic block 1', 'ab-1', 'cse', 'it lab', 'cad lab', 'seminar hall'],
    description: 'Computer Science, AI & Engineering Labs',
  },
  {
    id: 'acad-2',
    name: 'Academic Block 2',
    shortCode: 'AB-2',
    type: 'ACADEMIC',
    icon: Building,
    matchKeywords: ['academic block 2', 'ab-2', 'ece', 'eee', 'mechanical', 'civil'],
    description: 'Core Engineering Depts & Workshops',
  },
  {
    id: 'library',
    name: 'Central Library',
    shortCode: 'LIB',
    type: 'FACILITY',
    icon: BookOpen,
    matchKeywords: ['library', 'central library', 'digital library', 'reading room'],
    description: 'Digital Knowledge Resource Center',
  },
  {
    id: 'canteen',
    name: 'Canteen & Food Court',
    shortCode: 'FC',
    type: 'FACILITY',
    icon: Coffee,
    matchKeywords: ['canteen', 'food court', 'cafeteria', 'mess'],
    description: 'Central Campus Dining & Student Plaza',
  },
  {
    id: 'transport',
    name: 'Transport Terminal',
    shortCode: 'TRN',
    type: 'TRANSPORT',
    icon: Bus,
    matchKeywords: ['bus', 'transport', 'shuttle', 'fleet', 'parking'],
    description: 'College Bus Fleet & EV Shuttle Bays',
  },
  {
    id: 'admin',
    name: 'Administrative Complex',
    shortCode: 'ADM',
    type: 'FACILITY',
    icon: Building2,
    matchKeywords: ['admin', 'office', 'principal', 'exam cell', 'accounts'],
    description: 'Principal Secretariat & Exam Registry',
  },
]

interface CampusHeatmapProps {
  requests: DemoRequest[]
  selectedBlock: string | null
  onSelectBlock: (blockName: string | null) => void
}

export function CampusHeatmap({
  requests,
  selectedBlock,
  onSelectBlock,
}: CampusHeatmapProps) {
  // Aggregate telemetry for each campus block
  const blockStats = useMemo(() => {
    return SVEC_CAMPUS_BLOCKS.map((block) => {
      // Find all tickets related to this block
      const matchingTickets = requests.filter((r) => {
        const text = `${r.building || ''} ${r.location || ''} ${r.category || ''} ${r.title || ''}`.toLowerCase()
        return block.matchKeywords.some((kw) => text.includes(kw))
      })

      const activeTickets = matchingTickets.filter(
        (r) => r.status !== 'RESOLVED' && r.status !== 'CLOSED'
      )
      const criticalTickets = activeTickets.filter((r) => r.priority === 'CRITICAL')
      const highTickets = activeTickets.filter((r) => r.priority === 'HIGH')
      const resolvedTickets = matchingTickets.filter(
        (r) => r.status === 'RESOLVED' || r.status === 'CLOSED'
      )

      // Determine severity state
      let severity: 'CRITICAL' | 'WARNING' | 'NORMAL' = 'NORMAL'
      if (criticalTickets.length > 0) {
        severity = 'CRITICAL'
      } else if (activeTickets.length > 0) {
        severity = 'WARNING'
      }

      return {
        ...block,
        matchingTickets,
        activeTickets,
        criticalTickets,
        highTickets,
        resolvedTickets,
        total: matchingTickets.length,
        activeCount: activeTickets.length,
        criticalCount: criticalTickets.length,
        severity,
      }
    })
  }, [requests])

  // Count summaries
  const criticalZones = blockStats.filter((b) => b.severity === 'CRITICAL').length
  const warningZones = blockStats.filter((b) => b.severity === 'WARNING').length
  const normalZones = blockStats.filter((b) => b.severity === 'NORMAL').length

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 font-sans space-y-5">
      {/* Header with Title and Summary Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Interactive Campus Facilities Heatmap</span>
                <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Live Telemetry
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Visual real-time density of open maintenance tickets and critical hazards across SVEC blocks.
              </p>
            </div>
          </div>
        </div>

        {/* Legend / Status Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-semibold">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
            <span>Critical Hazard: {criticalZones}</span>
          </div>
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Moderate: {warningZones}</span>
          </div>
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Optimal: {normalZones}</span>
          </div>
        </div>
      </div>

      {/* Selected Filter Notice */}
      {selectedBlock && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-emerald-900">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-emerald-700" />
            <span>
              Filtering queue by <strong className="font-semibold">{selectedBlock}</strong> (
              {blockStats.find((b) => b.name === selectedBlock)?.activeCount || 0} active tickets)
            </span>
          </div>
          <button
            onClick={() => onSelectBlock(null)}
            className="inline-flex items-center space-x-1 text-emerald-700 hover:text-emerald-900 font-bold hover:underline"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset Filter</span>
          </button>
        </div>
      )}

      {/* Grid of Campus Blocks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {blockStats.map((block) => {
          const isSelected = selectedBlock === block.name
          const IconComponent = block.icon

          // Styling according to severity
          let cardStyle =
            'border-slate-200 bg-white hover:border-emerald-300 hover:shadow-xs'
          let badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200'
          let iconColor = 'text-emerald-600'
          let statusText = 'Normal SLA'

          if (block.severity === 'CRITICAL') {
            cardStyle =
              'border-rose-300 bg-gradient-to-br from-rose-50/80 via-white to-rose-50/40 hover:border-rose-400 shadow-xs ring-1 ring-rose-200'
            badgeStyle = 'bg-rose-100 text-rose-800 border-rose-200 font-bold animate-pulse'
            iconColor = 'text-rose-600'
            statusText = `${block.criticalCount} Critical Hazard${block.criticalCount > 1 ? 's' : ''}`
          } else if (block.severity === 'WARNING') {
            cardStyle =
              'border-amber-200 bg-gradient-to-br from-amber-50/60 via-white to-white hover:border-amber-300 hover:shadow-xs'
            badgeStyle = 'bg-amber-100 text-amber-800 border-amber-200 font-semibold'
            iconColor = 'text-amber-600'
            statusText = `${block.activeCount} Pending`
          }

          if (isSelected) {
            cardStyle += ' ring-2 ring-emerald-600 border-emerald-600'
          }

          return (
            <div
              key={block.id}
              onClick={() => onSelectBlock(isSelected ? null : block.name)}
              className={`relative cursor-pointer rounded-xl border p-4.5 transition-all duration-200 text-left ${cardStyle}`}
            >
              {/* Card Top Row */}
              <div className="flex items-start justify-between gap-2 mb-2.5">
                <div className="flex items-center space-x-2.5">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      block.severity === 'CRITICAL'
                        ? 'bg-rose-100 text-rose-700'
                        : block.severity === 'WARNING'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                      <span>{block.name}</span>
                      <span className="text-2xs font-mono font-normal text-slate-400 px-1.5 py-0.5 rounded bg-slate-100">
                        {block.shortCode}
                      </span>
                    </h3>
                    <p className="text-2xs text-slate-500 line-clamp-1">{block.description}</p>
                  </div>
                </div>

                <span
                  className={`text-2xs px-2 py-0.5 rounded-full border whitespace-nowrap ${badgeStyle}`}
                >
                  {statusText}
                </span>
              </div>

              {/* Ticket Metrics */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3 text-slate-600">
                  <span>
                    Active: <strong className="font-semibold text-slate-900">{block.activeCount}</strong>
                  </span>
                  <span>
                    Resolved: <strong className="font-semibold text-slate-900">{block.resolvedTickets.length}</strong>
                  </span>
                </div>

                <span className="text-2xs font-bold text-emerald-700 hover:text-emerald-800">
                  {isSelected ? 'Selected' : 'Filter →'}
                </span>
              </div>

              {/* Critical Alert Mini Ribbon */}
              {block.severity === 'CRITICAL' && block.criticalTickets[0] && (
                <div className="mt-2 text-2xs font-medium text-rose-800 bg-rose-100/90 rounded-md px-2 py-1 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span className="truncate">{block.criticalTickets[0].title}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
