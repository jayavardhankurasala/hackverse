import React from 'react'
import { LucideIcon } from 'lucide-react'
import { GlassCard, GlassCardGlow } from './GlassCard'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  color?: 'blue' | 'purple' | 'amber' | 'emerald' | 'rose' | 'indigo' | 'cyan' | 'green'
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
  color = 'green',
  trend,
}: StatCardProps) {
  const colorMap: Record<string, { bg: string; iconColor: string }> = {
    green: {
      bg: 'bg-emerald-50 border-emerald-100',
      iconColor: 'text-emerald-600',
    },
    emerald: {
      bg: 'bg-emerald-50 border-emerald-100',
      iconColor: 'text-emerald-600',
    },
    blue: {
      bg: 'bg-blue-50 border-blue-100',
      iconColor: 'text-blue-600',
    },
    indigo: {
      bg: 'bg-indigo-50 border-indigo-100',
      iconColor: 'text-indigo-600',
    },
    cyan: {
      bg: 'bg-cyan-50 border-cyan-100',
      iconColor: 'text-cyan-600',
    },
    purple: {
      bg: 'bg-purple-50 border-purple-100',
      iconColor: 'text-purple-600',
    },
    amber: {
      bg: 'bg-amber-50 border-amber-100',
      iconColor: 'text-amber-600',
    },
    rose: {
      bg: 'bg-rose-50 border-rose-100',
      iconColor: 'text-rose-600',
    },
  }

  const { bg, iconColor } = colorMap[color] || colorMap.green

  return (
    <GlassCard hoverEffect className="flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <div className={`p-2.5 rounded-lg border ${bg} ${iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4">
        <div className="text-3xl font-extrabold tracking-tight text-slate-900 font-sans">
          {value}
        </div>

        {(subtitle || trend) && (
          <div className="mt-1.5 flex items-center justify-between text-xs">
            {subtitle && <span className="text-slate-500">{subtitle}</span>}
            {trend && (
              <span
                className={`font-semibold ${
                  trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
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
