'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }
  
  if (data.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', data.user.id)
      .maybeSingle()

    const role = profile?.role?.toLowerCase() || 'student'
    revalidatePath('/', 'layout')
    redirect(`/${role}/dashboard`)
  }
}

export async function register(formData: FormData) {
  const supabase = await createClient()

  const email = (formData.get('email') as string)?.trim()
  const password = formData.get('password') as string
  const fullName = (formData.get('fullName') as string)?.trim()
  const studentId = (formData.get('studentId') as string)?.trim()
  const staffId = (formData.get('staffId') as string)?.trim()
  const departmentId = (formData.get('departmentId') as string)?.trim() || null
  const requestedRole = ((formData.get('role') as string) || 'STUDENT').toUpperCase()

  // Security Guard: Prevent public administrator registration
  if (requestedRole === 'ADMIN') {
    return { error: 'Administrator accounts cannot be self-registered. Please contact system administration.' }
  }

  const role: 'STUDENT' | 'STAFF' = requestedRole === 'STAFF' ? 'STAFF' : 'STUDENT'

  if (!email || !password || !fullName) {
    return { error: 'Name, email, and password are required' }
  }

  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters' }
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  if (data.user) {
    // Check if profile already exists to prevent duplication
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('user_id', data.user.id)
      .maybeSingle()

    if (!existingProfile) {
      const idNumber = role === 'STAFF' ? (staffId || null) : (studentId || null)
      const { error: profileError } = await supabase.from('profiles').insert([
        {
          user_id: data.user.id,
          email,
          full_name: fullName,
          student_id: idNumber,
          department_id: departmentId,
          role,
        },
      ])

      if (profileError) {
        return { error: profileError.message }
      }
    }

    revalidatePath('/', 'layout')
    redirect(role === 'STAFF' ? '/staff/dashboard' : '/student/dashboard')
  }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
