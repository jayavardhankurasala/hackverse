import React from 'react'
import { StaffNavbar } from '@/components/staff/StaffNavbar'

export const metadata = {
  title: 'Staff Portal | Campus Service Request Platform',
  description: 'Manage and resolve assigned campus service requests.',
}

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <StaffNavbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>
      <footer className="border-t border-gray-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-gray-500">
          Campus Service Request Platform &bull; Staff Management Portal &bull; Report. Track. Resolve.
        </div>
      </footer>
    </div>
  )
}
