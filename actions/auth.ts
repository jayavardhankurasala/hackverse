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
      .single()

    const role = profile?.role?.toLowerCase() || 'student'
    revalidatePath('/', 'layout')
    redirect(`/${role}/dashboard`)
  }
}

export async function register(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const studentId = formData.get('studentId') as string

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  if (data.user) {
    // Create profile
    const { error: profileError } = await supabase.from('profiles').insert([
      {
        user_id: data.user.id,
        email,
        full_name: fullName,
        student_id: studentId || null,
        role: 'STUDENT',
      },
    ])

    if (profileError) {
      return { error: profileError.message }
    }

    revalidatePath('/', 'layout')
    redirect('/student/dashboard')
  }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
