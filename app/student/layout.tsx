import React from 'react'
import { redirect } from 'next/navigation'
import { StudentPortalShell } from '@/components/student/StudentPortalShell'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Student Portal | Campus Service Platform',
  description: 'Report, track, and manage your campus service requests.',
}

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let targetRedirect: string | null = null
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const userRole = (user.user_metadata?.role || '').toUpperCase()
      if (userRole && userRole !== 'STUDENT' && userRole !== 'ADMIN') {
        targetRedirect = `/${userRole.toLowerCase()}/dashboard`
      } else if (!userRole) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .single()

        if (profile?.role && profile.role !== 'STUDENT' && profile.role !== 'ADMIN') {
          targetRedirect = `/${profile.role.toLowerCase()}/dashboard`
        }
      }
    }
  } catch {
    // Graceful demo mode fallback
  }

  if (targetRedirect) {
    redirect(targetRedirect)
  }

  return <StudentPortalShell>{children}</StudentPortalShell>
}
