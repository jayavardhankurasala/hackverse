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
  Building
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
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <Link href="/admin/dashboard" className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-xs">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-white tracking-tight text-base sm:text-lg">
                  Campus<span className="text-red-500">Admin</span>
                </span>
                <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-red-950/80 text-red-400 rounded-md border border-red-800">
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
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    item.active
                      ? 'bg-slate-800 text-white font-semibold border border-slate-700'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${item.active ? 'text-red-500' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Right Action */}
          <div className="hidden md:flex items-center space-x-3">
            <NotificationBell baseRoute="/admin" darkTheme={true} />

            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-red-950/60 border border-red-800 text-xs text-red-300">
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
              <span className="font-bold uppercase tracking-wider text-[11px]">ADMIN</span>
            </div>

            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-700 disabled:opacity-50"
              title="Sign out of admin session"
            >
              <LogOut className="w-4 h-4" />
              <span>{isLoggingOut ? 'Signing out...' : 'Logout'}</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 pt-2 pb-4 space-y-1 shadow-xl">
          <div className="pb-2 pt-1 border-b border-slate-800 flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Admin Portal
            </span>
            <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-red-950/80 text-red-400 border border-red-800 text-xs font-bold">
              <ShieldAlert className="w-3 h-3" />
              <span>ADMIN</span>
            </div>
          </div>

          {navLinks.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium ${
                  item.active
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-5 h-5 ${item.active ? 'text-red-500' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </Link>
            )
          })}

          <div className="pt-2 border-t border-slate-800 mt-2">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium text-red-400 hover:bg-slate-800 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>{isLoggingOut ? 'Signing out...' : 'Logout'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
