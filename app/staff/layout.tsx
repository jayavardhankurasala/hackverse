import React from 'react'
import { redirect } from 'next/navigation'
import { StaffPortalShell } from '@/components/staff/StaffPortalShell'
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

      if (userRole !== 'STAFF' && userRole !== 'ADMIN') {
        targetRedirect = '/student/dashboard'
      }
    }
  } catch {
    // Graceful demo mode fallback
  }

  if (targetRedirect) {
    redirect(targetRedirect)
  }

  return <StaffPortalShell>{children}</StaffPortalShell>
}
