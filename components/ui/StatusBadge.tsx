import React from 'react'
import { RequestStatus } from '@/types/database'
import { CheckCircle2, Clock, PlayCircle, UserCheck, AlertCircle } from 'lucide-react'

interface StatusBadgeProps {
  status: RequestStatus | string
  className?: string
  showIcon?: boolean
}

export function StatusBadge({ status, className = '', showIcon = true }: StatusBadgeProps) {
  const s = status?.toUpperCase()

  switch (s) {
    case 'SUBMITTED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-slate-800/80 text-slate-300 border border-slate-700/60 shadow-xs backdrop-blur-md ${className}`}
        >
          {showIcon && <Clock className="w-3 h-3 text-slate-400" />}
          <span>Submitted</span>
        </span>
      )
    case 'ASSIGNED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-purple-950/60 text-purple-300 border border-purple-800/60 shadow-xs backdrop-blur-md ${className}`}
        >
          {showIcon && <UserCheck className="w-3 h-3 text-purple-400" />}
          <span>Assigned</span>
        </span>
      )
    case 'IN_PROGRESS':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-blue-950/60 text-blue-300 border border-blue-800/60 shadow-xs backdrop-blur-md ${className}`}
        >
          {showIcon && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
          )}
          <span>In Progress</span>
        </span>
      )
    case 'RESOLVED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 shadow-xs backdrop-blur-md ${className}`}
        >
          {showIcon && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
          <span>Resolved</span>
        </span>
      )
    case 'CLOSED':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-zinc-900/80 text-zinc-400 border border-zinc-800 shadow-xs backdrop-blur-md ${className}`}
        >
          {showIcon && <CheckCircle2 className="w-3 h-3 text-zinc-500" />}
          <span>Closed</span>
        </span>
      )
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-slate-800 text-slate-300 border border-slate-700 ${className}`}
        >
          <span>{status}</span>
        </span>
      )
  }
}
