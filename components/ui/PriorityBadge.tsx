import React from 'react'
import { RequestPriority } from '@/types/database'
import { AlertTriangle, AlertCircle, ArrowUpCircle, Info } from 'lucide-react'

interface PriorityBadgeProps {
  priority: RequestPriority | string
  className?: string
  showIcon?: boolean
}

export function PriorityBadge({ priority, className = '', showIcon = true }: PriorityBadgeProps) {
  const p = priority?.toUpperCase()

  switch (p) {
    case 'CRITICAL':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide uppercase bg-rose-950/70 text-rose-300 border border-rose-800/80 shadow-[0_0_12px_rgba(244,63,94,0.25)] backdrop-blur-md ${className}`}
        >
          {showIcon && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
          )}
          <span>Critical</span>
        </span>
      )
    case 'HIGH':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide uppercase bg-orange-950/60 text-orange-300 border border-orange-800/60 shadow-xs backdrop-blur-md ${className}`}
        >
          {showIcon && <ArrowUpCircle className="w-3 h-3 text-orange-400" />}
          <span>High</span>
        </span>
      )
    case 'MEDIUM':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide uppercase bg-amber-950/60 text-amber-300 border border-amber-800/60 shadow-xs backdrop-blur-md ${className}`}
        >
          {showIcon && <AlertCircle className="w-3 h-3 text-amber-400" />}
          <span>Medium</span>
        </span>
      )
    case 'LOW':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide uppercase bg-sky-950/60 text-sky-300 border border-sky-800/60 shadow-xs backdrop-blur-md ${className}`}
        >
          {showIcon && <Info className="w-3 h-3 text-sky-400" />}
          <span>Low</span>
        </span>
      )
  }
}
