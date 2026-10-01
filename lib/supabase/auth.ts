import { createClient } from './server'

export async function getUserRole() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  return profile?.role as 'STUDENT' | 'STAFF' | 'ADMIN' | null
}

export async function isStudent() {
  const role = await getUserRole()
  return role === 'STUDENT'
}

export async function isStaff() {
  const role = await getUserRole()
  return role === 'STAFF'
}

export async function isAdmin() {
  const role = await getUserRole()
  return role === 'ADMIN'
}

export async function requireRole(requiredRole: 'STUDENT' | 'STAFF' | 'ADMIN') {
  const role = await getUserRole()
  return role === requiredRole
}
