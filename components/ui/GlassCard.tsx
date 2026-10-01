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
  const resolvedGlow: string =
    typeof glow === 'boolean' ? (glow ? 'blue' : 'none') : (glow || 'none')

  const glowClasses: Record<string, string> = {
    blue: 'shadow-[0_0_30px_-10px_rgba(59,130,246,0.18)] border-blue-500/20',
    purple: 'shadow-[0_0_30px_-10px_rgba(168,85,247,0.18)] border-purple-500/20',
    red: 'shadow-[0_0_30px_-10px_rgba(239,68,68,0.18)] border-red-500/20',
    emerald: 'shadow-[0_0_30px_-10px_rgba(16,185,129,0.18)] border-emerald-500/20',
    cyan: 'shadow-[0_0_30px_-10px_rgba(6,182,212,0.18)] border-cyan-500/20',
    indigo: 'shadow-[0_0_30px_-10px_rgba(99,102,241,0.18)] border-indigo-500/20',
    none: 'border-slate-800/80 shadow-xl',
  }

  const hoverClass = hoverEffect
    ? 'transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-700 hover:shadow-2xl'
    : ''

  return (
    <div
      className={`relative rounded-2xl bg-slate-900/60 backdrop-blur-xl border ${glowClasses[resolvedGlow] || glowClasses.none} p-6 text-slate-100 ${hoverClass} ${className}`}
      {...props}
    >
      {/* Subtle top specular highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      {children}
    </div>
  )
}
