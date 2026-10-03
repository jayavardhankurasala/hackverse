'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, ShieldCheck } from 'lucide-react'
import { StudentSidebar } from './StudentSidebar'
import { UserNavChip } from '@/components/shared/UserNavChip'

export function StudentPortalShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row font-sans relative">
      {/* Left Sidebar Navigation */}
      <StudentSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header Bar with Notifications, Profile, and Logout at Top-Right Corner */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-slate-200/90 h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-2xs">
          {/* Left Side: Mobile Hamburger & Current View Title */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              aria-label="Open navigation sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2">
              <span className="text-xs sm:text-sm font-bold text-slate-800 tracking-tight hidden sm:inline">
                Sri Vasavi Engineering College
              </span>
              <span className="text-slate-300 hidden sm:inline">&bull;</span>
              <span className="px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wide bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200">
                Student Helpdesk
              </span>
            </div>
          </div>

          {/* Top-Right Corner: Profile Chip, Enlarged Notification Bell, and Logout Button */}
          <div className="flex items-center space-x-2.5">
            <UserNavChip expectedRole="student" />
          </div>
        </header>

        {/* Page Main Content */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {children}
        </main>

        {/* Bottom Footer */}
        <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
          <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500 font-medium">
            Campus Service Request Platform &bull; Student Portal &bull; Report. Track. Resolve.
          </div>
        </footer>
      </div>
    </div>
  )
}
