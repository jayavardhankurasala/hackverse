'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ClipboardList,
  User,
  X,
  ChevronRight,
  Wrench,
} from 'lucide-react'

export function StaffSidebar({
  mobileOpen: externalMobileOpen,
  setMobileOpen: externalSetMobileOpen,
}: {
  mobileOpen?: boolean
  setMobileOpen?: (open: boolean) => void
}) {
  const pathname = usePathname()
  const [internalOpen, setInternalOpen] = useState(false)

  const isMobileOpen = externalMobileOpen !== undefined ? externalMobileOpen : internalOpen
  const setIsMobileOpen = externalSetMobileOpen || setInternalOpen

  const navItems = [
    {
      name: 'Operations Queue',
      href: '/staff/dashboard',
      icon: LayoutDashboard,
      active: pathname === '/staff/dashboard',
    },
    {
      name: 'Assigned Tickets',
      href: '/staff/requests',
      icon: ClipboardList,
      active: pathname.startsWith('/staff/requests'),
    },
    {
      name: 'Technician Profile',
      href: '/staff/profile',
      icon: User,
      active: pathname === '/staff/profile',
    },
  ]

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200/90 text-slate-800 shadow-xs">
      {/* Top Header & Branding */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <Link
          href="/staff/dashboard"
          onClick={() => setIsMobileOpen(false)}
          className="flex items-center space-x-3 group"
        >
          <img
            src="/svec-logo.png"
            alt="SVEC Logo"
            className="w-10 h-10 object-contain drop-shadow-xs group-hover:scale-105 transition-transform"
          />
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-slate-900 tracking-tight text-base">
                SVEC<span className="text-blue-600">helpdesk</span>
              </span>
            </div>
            <div className="flex items-center space-x-1 mt-0.5">
              <span className="px-1.5 py-0.5 text-[9px] font-bold tracking-wide uppercase bg-blue-50 text-blue-700 rounded border border-blue-200">
                Staff Operations
              </span>
            </div>
          </div>
        </Link>
        <button
          onClick={() => setIsMobileOpen(false)}
          className="md:hidden p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Staff Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                item.active
                  ? 'bg-blue-50 text-blue-800 font-bold border border-blue-200/80 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Icon
                  className={`w-4 h-4 ${
                    item.active ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                <span>{item.name}</span>
              </div>
              {item.active && <ChevronRight className="w-3.5 h-3.5 text-blue-500" />}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Footer Info */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-center">
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">SVEC Operations Console</p>
        <p className="text-[9px] text-slate-400 mt-0.5">Campus Facilities Management</p>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop Sticky Left Sidebar */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 shrink-0 h-screen sticky top-0 z-20">
        {sidebarContent}
      </aside>
    </>
  )
}
