import React from 'react'

export type GlassCardGlow = 'blue' | 'purple' | 'red' | 'emerald' | 'cyan' | 'indigo' | 'none' | boolean

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  hoverEffect?: boolean
  glow?: GlassCardGlow
}

export function GlassCard({
  children,
  className = '',
  hoverEffect = false,
  glow = 'none',
  ...props
}: GlassCardProps) {
  const isGlow = typeof glow === 'boolean' ? glow : glow !== 'none'
  const hoverClass = hoverEffect
    ? 'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300'
    : 'transition-all duration-150'

  return (
    <div
      className={`rounded-xl bg-white border border-slate-200/90 shadow-xs p-6 text-slate-900 ${
        isGlow ? 'ring-1 ring-emerald-500/10' : ''
      } ${hoverClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
