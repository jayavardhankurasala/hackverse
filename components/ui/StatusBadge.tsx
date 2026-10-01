import React from 'react'
import { RequestStatus } from '@/types/database'

interface StatusBadgeProps {
  status: RequestStatus | string
  className?: string
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const s = status?.toUpperCase()

  switch (s) {
    case 'SUBMITTED':
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 ${className}`}>
          SUBMITTED
        </span>
      )
    case 'ASSIGNED':
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200 ${className}`}>
          ASSIGNED
        </span>
      )
    case 'IN_PROGRESS':
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mr-1.5 animate-ping"></span>
          IN PROGRESS
        </span>
      )
    case 'RESOLVED':
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200 ${className}`}>
          RESOLVED
        </span>
      )
    case 'CLOSED':
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200 ${className}`}>
          CLOSED
        </span>
      )
    default:
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200 ${className}`}>
          {status}
        </span>
      )
  }
}
