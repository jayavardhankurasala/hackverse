'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ClipboardList,
  Wrench,
  User,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react'
import { logout } from '@/actions/auth'
import { UserNavChip } from '@/components/shared/UserNavChip'
import { NotificationBell } from '@/components/notifications/NotificationBell'

export function StaffSidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

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

  const handleLogout = async () => {
    try {
      await logout()
    } catch {
      window.location.href = '/login'
    }
  }

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200/90 text-slate-800 shadow-xs">
      {/* Top Header & Branding */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <Link
          href="/staff/dashboard"
          onClick={() => setMobileOpen(false)}
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
        {mobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        )}
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
              onClick={() => setMobileOpen(false)}
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

        {/* Activity & Notifications Section */}
        <div className="pt-4 px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Alerts & Activity
        </div>
        <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-medium text-slate-700">
            <Bell className="w-4 h-4 text-slate-400" />
            <span>Alerts</span>
          </div>
          <NotificationBell />
        </div>
      </nav>

      {/* Bottom Pinned User Profile & Logout */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50 space-y-2">
        <div className="w-full">
          <UserNavChip expectedRole="staff" />
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition border border-transparent hover:border-rose-100 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden sticky top-0 z-30 bg-white border-b border-slate-200/90 px-4 h-14 flex items-center justify-between shadow-2xs">
        <Link href="/staff/dashboard" className="flex items-center space-x-2">
          <img src="/svec-logo.png" alt="SVEC Logo" className="w-8 h-8 object-contain" />
          <span className="font-extrabold text-slate-900 tracking-tight text-sm">
            SVEC<span className="text-blue-600">helpdesk</span>
          </span>
        </Link>
        <div className="flex items-center space-x-2">
          <NotificationBell />
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            aria-label="Open staff navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
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
