import React from 'react'
import { LucideIcon } from 'lucide-react'
import { GlassCard, GlassCardGlow } from './GlassCard'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  color?: 'blue' | 'purple' | 'amber' | 'emerald' | 'rose' | 'indigo' | 'cyan'
  trend?: {
    value: string
    isPositive?: boolean
  }
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'blue',
  trend,
}: StatCardProps) {
  const colorMap: Record<string, { bg: string; glow: GlassCardGlow }> = {
    blue: {
      bg: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
      glow: 'blue',
    },
    cyan: {
      bg: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
      glow: 'cyan',
    },
    indigo: {
      bg: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
      glow: 'indigo',
    },
    purple: {
      bg: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
      glow: 'purple',
    },
    amber: {
      bg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
      glow: 'none',
    },
    emerald: {
      bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
      glow: 'emerald',
    },
    rose: {
      bg: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
      glow: 'red',
    },
  }

  const { bg, glow } = colorMap[color] || colorMap.blue

  return (
    <GlassCard glow={glow} hoverEffect className="flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl border ${bg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4">
        <div className="text-3xl font-black tracking-tight text-white font-mono">
          {value}
        </div>

        {(subtitle || trend) && (
          <div className="mt-1 flex items-center justify-between text-xs">
            {subtitle && <span className="text-slate-400">{subtitle}</span>}
            {trend && (
              <span
                className={`font-semibold ${
                  trend.isPositive ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {trend.value}
              </span>
            )}
          </div>
        )}
      </div>
    </GlassCard>
  )
}
