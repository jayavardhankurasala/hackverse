'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  BarChart3,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  User,
} from 'lucide-react'
import { logout } from '@/actions/auth'
import { UserNavChip } from '@/components/shared/UserNavChip'

export function AdminNavbar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    {
      name: 'Command Center',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
      active: pathname === '/admin/dashboard',
    },
    {
      name: 'All Requests',
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
      name: 'Admin Profile',
      href: '/admin/profile',
      icon: User,
      active: pathname === '/admin/profile',
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
            <Link href="/admin/dashboard" className="flex items-center space-x-2.5">
              <img
                src="/svec-logo.png"
                alt="Sri Vasavi Engineering College Logo"
                className="w-10 h-10 object-contain shrink-0 drop-shadow-xs"
              />
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg">
                    SVEC<span className="text-purple-600">helpdesk</span>
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase bg-purple-50 text-purple-700 rounded-md border border-purple-200">
                    Administrator
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                  Central Operations & Facilities Command
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
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    item.active
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${item.active ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Right Action: Profile Chip, Enlarged Bell & Logout */}
          <div className="hidden md:flex items-center space-x-3">
            <UserNavChip expectedRole="admin" />
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center space-x-2 md:hidden">
            <UserNavChip expectedRole="admin" />
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
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1">
          {navLinks.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg text-sm font-medium ${
                  item.active
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${item.active ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </Link>
            )
          })}
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
