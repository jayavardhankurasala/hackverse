import React from 'react'
import { redirect } from 'next/navigation'
import { AdminNavbar } from '@/components/admin/AdminNavbar'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Administrator Console | Campus Service Platform',
  description: 'Manage campus-wide service requests, staff workloads, and system analytics.',
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let targetRedirect: string | null = null
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      let userRole = (user.user_metadata?.role || '').toUpperCase()
      if (!userRole) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle()
        userRole = (profile?.role || 'STUDENT').toUpperCase()
      }

      if (userRole !== 'ADMIN') {
        targetRedirect = userRole === 'STAFF' ? '/staff/dashboard' : '/student/dashboard'
      }
    }
  } catch {
    // Graceful demo mode fallback
  }

  if (targetRedirect) {
    redirect(targetRedirect)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans relative">
      <AdminNavbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500 font-medium">
          Campus Service Request Platform &bull; Administration Console &bull; Central Control & Intelligence
        </div>
      </footer>
    </div>
  )
}
