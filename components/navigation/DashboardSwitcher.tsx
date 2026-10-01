'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutGrid,
  ChevronDown,
  GraduationCap,
  Wrench,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react'

export function DashboardSwitcher() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const dashboards = [
    {
      title: 'Student Service Portal',
      role: 'Student',
      href: '/student/dashboard',
      icon: GraduationCap,
      description: 'Report issues, track progress, and provide feedback',
      color: 'emerald',
      active: pathname.startsWith('/student'),
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      iconBg: 'bg-emerald-500 text-white',
    },
    {
      title: 'Staff Repair Queue',
      role: 'Staff Technician',
      href: '/staff/dashboard',
      icon: Wrench,
      description: 'Choose domain, accept tickets, update status, and resolve',
      color: 'blue',
      active: pathname.startsWith('/staff'),
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
      iconBg: 'bg-blue-600 text-white',
    },
    {
      title: 'Admin Command Center',
      role: 'Administrator',
      href: '/admin/dashboard',
      icon: ShieldCheck,
      description: 'Triage AI priorities, assign technicians, inspect metrics',
      color: 'purple',
      active: pathname.startsWith('/admin'),
      badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
      iconBg: 'bg-slate-900 text-white',
    },
  ]

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200/90 transition shadow-2xs cursor-pointer"
        title="Quickly switch between Student, Staff, and Admin dashboards"
      >
        <LayoutGrid className="w-4 h-4 text-emerald-600" />
        <span>Dashboards</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-84 rounded-2xl bg-white border border-slate-200 shadow-xl py-2.5 z-50 animate-in fade-in-50 zoom-in-95">
          <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Campus Portals</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Direct navigation across all role views
              </p>
            </div>
          </div>

          <div className="p-2 space-y-1.5">
            {dashboards.map((dash) => {
              const Icon = dash.icon
              return (
                <Link
                  key={dash.href}
                  href={dash.href}
                  onClick={() => setIsOpen(false)}
                  className={`group flex items-start gap-3 p-3 rounded-xl transition border cursor-pointer ${
                    dash.active
                      ? 'bg-slate-50 border-slate-200/80 shadow-2xs'
                      : 'hover:bg-slate-50/80 border-transparent hover:border-slate-200/60'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${dash.iconBg}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {dash.title}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-semibold border uppercase ${dash.badgeClass}`}
                      >
                        {dash.role}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 leading-snug line-clamp-1">
                      {dash.description}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>

          <div className="px-4 pt-2 pb-1 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Presentation Mode Ready</span>
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              Live Mock Data <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
