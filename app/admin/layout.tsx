import React from 'react'
import { AdminNavbar } from '@/components/admin/AdminNavbar'

export const metadata = {
  title: 'Administrator Console | Campus Service Platform',
  description: 'Manage campus-wide service requests, staff workloads, and system analytics.',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <AdminNavbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>
      <footer className="border-t border-gray-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-gray-500">
          Campus Service Request Platform &bull; Administration Console &bull; Central Control & Intelligence
        </div>
      </footer>
    </div>
  )
}
