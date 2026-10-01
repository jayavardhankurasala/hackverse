import React from 'react'
import { AlertCircle, AlertTriangle, ArrowUpCircle, Info } from 'lucide-react'

interface PriorityBadgeProps {
  priority: string
  className?: string
  showIcon?: boolean
}

export function PriorityBadge({ priority, className = '', showIcon = true }: PriorityBadgeProps) {
  const p = priority?.toUpperCase()

  switch (p) {
    case 'CRITICAL':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200 ${className}`}
        >
          {showIcon && (
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-600"></span>
            </span>
          )}
          <span>Critical</span>
        </span>
      )
    case 'HIGH':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200 ${className}`}
        >
          {showIcon && <ArrowUpCircle className="w-3.5 h-3.5 text-amber-600" />}
          <span>High</span>
        </span>
      )
    case 'MEDIUM':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 ${className}`}
        >
          {showIcon && <AlertCircle className="w-3.5 h-3.5 text-blue-600" />}
          <span>Medium</span>
        </span>
      )
    case 'LOW':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 ${className}`}
        >
          {showIcon && <Info className="w-3.5 h-3.5 text-slate-500" />}
          <span>Low</span>
        </span>
      )
  }
}
