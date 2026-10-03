'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ClipboardList,
  PlusCircle,
  User,
  X,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react'

export function StudentSidebar({
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
      name: 'Dashboard',
      href: '/student/dashboard',
      icon: LayoutDashboard,
      active: pathname === '/student/dashboard',
    },
    {
      name: 'My Requests',
      href: '/student/requests',
      icon: ClipboardList,
      active: pathname.startsWith('/student/requests') && pathname !== '/student/requests/new',
    },
    {
      name: 'Profile & Details',
      href: '/student/profile',
      icon: User,
      active: pathname === '/student/profile',
    },
  ]

  const isNewRequestActive = pathname === '/student/requests/new'

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200/90 text-slate-800 shadow-xs">
      {/* Top Header & Branding */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <Link
          href="/student/dashboard"
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
                SVEC<span className="text-emerald-600">helpdesk</span>
              </span>
            </div>
            <div className="flex items-center space-x-1 mt-0.5">
              <span className="px-1.5 py-0.5 text-[9px] font-bold tracking-wide uppercase bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
                Student Portal
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

      {/* Primary Action Button */}
      <div className="px-4 pt-5 pb-2">
        <Link
          href="/student/requests/new"
          onClick={() => setIsMobileOpen(false)}
          className={`w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-98 ${
            isNewRequestActive
              ? 'bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-400/40'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs hover:shadow-md'
          }`}
        >
          <PlusCircle className="w-4 h-4 text-emerald-100" />
          <span>Report a Problem</span>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Navigation
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
                  ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/80 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Icon
                  className={`w-4 h-4 ${
                    item.active ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                <span>{item.name}</span>
              </div>
              {item.active && <ChevronRight className="w-3.5 h-3.5 text-emerald-500" />}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Footer Info */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-center">
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">SVEC Central Helpdesk</p>
        <p className="text-[9px] text-slate-400 mt-0.5">Campus Facilities & Services</p>
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
