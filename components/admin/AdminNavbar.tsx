'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  BarChart3,
  User,
  LogOut,
  ShieldAlert,
  Menu,
  X,
  Building,
  Loader2,
} from 'lucide-react'
import { logout } from '@/actions/auth'
import { NotificationBell } from '@/components/notifications/NotificationBell'

export function AdminNavbar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const navLinks = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
      active: pathname === '/admin/dashboard',
    },
    {
      name: 'Requests',
      href: '/admin/requests',
      icon: ClipboardList,
      active: pathname.startsWith('/admin/requests'),
    },
    {
      name: 'Staff Directory',
      href: '/admin/staff',
      icon: Users,
      active: pathname === '/admin/staff',
    },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
      active: pathname === '/admin/analytics',
    },
    {
      name: 'Profile',
      href: '/admin/profile',
      icon: User,
      active: pathname === '/admin/profile',
    },
  ]

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
    } catch {
      setIsLoggingOut(false)
    }
  }

  return (
    <header className="bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 text-white sticky top-0 z-30 shadow-lg shadow-black/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <Link href="/admin/dashboard" className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center text-white shadow-md shadow-red-600/25 border border-white/20">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-white tracking-tight text-base sm:text-lg">
                  Campus<span className="text-red-500">Admin</span>
                </span>
                <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-red-950/80 text-red-400 rounded-md border border-red-800/60">
                  Command Center
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    item.active
                      ? 'bg-red-600/20 text-red-300 border border-red-500/30 shadow-inner'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${item.active ? 'text-red-400' : 'text-slate-500'}`} />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Right Action */}
          <div className="hidden md:flex items-center space-x-3">
            <NotificationBell baseRoute="/admin" />

            <div className="h-5 w-px bg-slate-800" />

            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-rose-300 hover:bg-rose-950/30 border border-transparent hover:border-rose-900/40 transition-all disabled:opacity-50"
            >
              {isLoggingOut ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <LogOut className="w-3.5 h-3.5" />
              )}
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile hamburger */}
          <div className="flex items-center space-x-2 md:hidden">
            <NotificationBell baseRoute="/admin" />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950/95 backdrop-blur-xl px-4 pt-2 pb-4 space-y-2">
          {navLinks.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                  item.active
                    ? 'bg-red-600/20 text-red-300 border border-red-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            )
          })}
          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/30"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
