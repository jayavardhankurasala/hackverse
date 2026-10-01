import React from 'react'
import { redirect } from 'next/navigation'
import { StaffNavbar } from '@/components/staff/StaffNavbar'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Staff Portal | Campus Service Request Platform',
  description: 'Manage and resolve assigned campus service requests.',
}

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?role=staff')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (profile?.role !== 'STAFF') {
    redirect(`/${profile?.role?.toLowerCase() || 'login'}/dashboard`)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative">
      <StaffNavbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>
      <footer className="border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
          Campus Service Request Platform &bull; Staff Management Portal &bull; Report. Track. Resolve.
        </div>
      </footer>
    </div>
  )
}
