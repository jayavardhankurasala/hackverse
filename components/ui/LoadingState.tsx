import React from 'react'
import { Loader2 } from 'lucide-react'

interface LoadingStateProps {
  message?: string
}

export function LoadingState({ message = 'Loading campus data...' }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="relative flex items-center justify-center mb-4">
        <div className="w-12 h-12 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin" />
        <Loader2 className="w-5 h-5 text-blue-400 absolute" />
      </div>
      <p className="text-xs font-medium text-slate-400 animate-pulse">
        {message}
      </p>
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="w-full space-y-3 p-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-12 w-full rounded-xl bg-slate-800/40 border border-slate-800 animate-pulse"
        />
      ))}
    </div>
  )
}
