'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ClipboardList,
  PlusCircle,
  LogOut,
  GraduationCap,
  Menu,
  X,
  User,
} from 'lucide-react'
import { logout } from '@/actions/auth'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { DemoModeBadge } from '@/components/demo/DemoModeBadge'

export function StudentNavbar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
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
      name: 'Profile',
      href: '/student/profile',
      icon: User,
      active: pathname === '/student/profile',
    },
  ]

  const handleLogout = async () => {
    try {
      await logout()
    } catch {
      window.location.href = '/login'
    }
  }

  return (
    <header className="bg-white border-b border-slate-200/90 text-slate-800 sticky top-0 z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-4">
            <Link href="/student/dashboard" className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-slate-900 tracking-tight text-base sm:text-lg">
                    Campus<span className="text-emerald-600">Desk</span>
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200">
                    Student
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                  Report. Track. Resolve.
                </p>
              </div>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    item.active
                      ? 'bg-emerald-50 text-emerald-800 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${item.active ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </Link>
              )
            })}

            <Link
              href="/student/requests/new"
              className="inline-flex items-center space-x-1.5 ml-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-2xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Report a Problem</span>
            </Link>
          </nav>

          {/* Right Action */}
          <div className="hidden md:flex items-center space-x-3">
            <DemoModeBadge />
            <NotificationBell baseRoute="/student" />

            <div className="h-4 w-px bg-slate-200" />

            <button
              onClick={handleLogout}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center space-x-2 md:hidden">
            <DemoModeBadge />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2">
          {navLinks.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg text-sm font-medium ${
                  item.active
                    ? 'bg-emerald-50 text-emerald-800 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${item.active ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </Link>
            )
          })}
          <Link
            href="/student/requests/new"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-center space-x-2 w-full py-2.5 mt-2 rounded-lg bg-emerald-600 text-white font-semibold text-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report a Problem</span>
          </Link>
          <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
            <button
              onClick={handleLogout}
              className="text-slate-500 hover:text-slate-900 flex items-center space-x-1 py-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
