import React from 'react'
import { RequestPriority } from '@/types/database'

interface PriorityBadgeProps {
  priority: RequestPriority | string
  className?: string
}

export function PriorityBadge({ priority, className = '' }: PriorityBadgeProps) {
  const p = priority?.toUpperCase()

  switch (p) {
    case 'CRITICAL':
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-red-600 mr-1.5 animate-pulse"></span>
          CRITICAL
        </span>
      )
    case 'HIGH':
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 border border-orange-200 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mr-1.5"></span>
          HIGH
        </span>
      )
    case 'MEDIUM':
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
          MEDIUM
        </span>
      )
    case 'LOW':
    default:
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5"></span>
          LOW
        </span>
      )
  }
}
