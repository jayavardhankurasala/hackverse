'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  ClipboardList, 
  User, 
  LogOut, 
  ShieldCheck, 
  Menu, 
  X,
  Wrench
} from 'lucide-react'
import { logout } from '@/actions/auth'
import { NotificationBell } from '@/components/notifications/NotificationBell'

export function StaffNavbar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const navLinks = [
    {
      name: 'Dashboard',
      href: '/staff/dashboard',
      icon: LayoutDashboard,
      active: pathname === '/staff/dashboard',
    },
    {
      name: 'Assigned Requests',
      href: '/staff/requests',
      icon: ClipboardList,
      active: pathname.startsWith('/staff/requests'),
    },
    {
      name: 'Profile',
      href: '/staff/profile',
      icon: User,
      active: pathname === '/staff/profile',
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
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left: Brand */}
          <div className="flex items-center space-x-3">
            <Link href="/staff/dashboard" className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-gray-900 tracking-tight text-base sm:text-lg">
                  Campus<span className="text-blue-600">Services</span>
                </span>
                <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-blue-50 text-blue-700 rounded-md border border-blue-200">
                  Staff Portal
                </span>
              </div>
            </Link>
          </div>

          {/* Center/Right: Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    item.active
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${item.active ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Right: Role indicator & Logout */}
          <div className="hidden md:flex items-center space-x-3">
            <NotificationBell baseRoute="/staff" />

            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-700">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span className="font-semibold uppercase tracking-wider text-[11px]">STAFF</span>
            </div>

            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100 disabled:opacity-50"
              title="Sign out of account"
            >
              <LogOut className="w-4 h-4" />
              <span>{isLoggingOut ? 'Signing out...' : 'Logout'}</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
          <div className="pb-2 pt-1 border-b border-gray-100 flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Staff Portal
            </span>
            <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
              <ShieldCheck className="w-3 h-3 text-blue-600" />
              <span>STAFF</span>
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
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className={`w-5 h-5 ${item.active ? 'text-blue-600' : 'text-gray-400'}`} />
                <span>{item.name}</span>
              </Link>
            )
          })}
          <div className="pt-2 border-t border-gray-100 mt-2">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
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
