'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = (formData.get('email') as string)?.trim()
  const password = formData.get('password') as string
  const expectedRole = (formData.get('role') as string)?.toUpperCase()

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

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

    const role = (profile?.role || data.user.user_metadata?.role || 'STUDENT').toUpperCase()

    // If an expected role was specified (e.g. Admin Tab), check authorization
    if (expectedRole === 'ADMIN' && role !== 'ADMIN') {
      await supabase.auth.signOut()
      return { error: 'Access denied: This account does not possess Administrator privileges.' }
    }

    revalidatePath('/', 'layout')
    return { success: true, role: role.toLowerCase(), redirectUrl: `/${role.toLowerCase()}/dashboard` }
  }

  return { error: 'Unable to establish user session.' }
}

export async function registerStudent(formData: FormData) {
  const supabase = await createClient()

  const fullName = (formData.get('fullName') as string)?.trim()
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const rollNumber = ((formData.get('rollNumber') || formData.get('studentId')) as string)?.trim().toUpperCase()
  const studentId = rollNumber
  const branch = ((formData.get('branch') as string)?.trim()) || 'CSE'
  const year = ((formData.get('year') as string)?.trim()) || '3rd Year'
  const phone = ((formData.get('phone') as string)?.trim()) || '+91 98765 43210'
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!fullName || !email || !rollNumber || !password) {
    return { error: 'Full name, email, roll number, and password are required.' }
  }

  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters.' }
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match. Please re-enter carefully.' }
  }

  let userId: string | null = null

  // 1. Try creating user via Admin API (auto-confirms email)
  try {
    const admin = createAdminClient()
    const { data: adminData, error: adminError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role: 'STUDENT',
        student_id: studentId,
        roll_number: rollNumber,
        branch,
        year,
        phone,
      },
    })

    if (!adminError && adminData?.user) {
      userId = adminData.user.id
    } else if (adminError && adminError.message.includes('already registered')) {
      return { error: 'An account with this email address already exists. Please sign in.' }
    }
  } catch (err: any) {
    console.warn('Admin user creation notice:', err?.message)
  }

  // 2. Fallback to standard signUp
  if (!userId) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: 'STUDENT',
          student_id: studentId,
          roll_number: rollNumber,
          branch,
          year,
          phone,
        },
      },
    })

    if (error) {
      return { error: error.message }
    }

    if (data?.user) {
      userId = data.user.id
    }
  }

  if (!userId) {
    return { error: 'Failed to create student account in authentication service.' }
  }

  // 3. Upsert into profiles table with all payload columns strictly mapped
  try {
    const admin = createAdminClient()
    const { error: profileError } = await admin.from('profiles').upsert(
      [
        {
          user_id: userId,
          email,
          full_name: fullName,
          student_id: studentId,
          roll_number: rollNumber,
          branch,
          year,
          phone,
          role: 'STUDENT',
          updated_at: new Date().toISOString(),
        },
      ],
      { onConflict: 'user_id' }
    )

    if (profileError) {
      console.error('Student profile creation error:', profileError)
      return { error: `Profile creation failed: ${profileError.message}` }
    }
  } catch (err: any) {
    console.warn('Profile insert warning:', err?.message)
  }

  // 4. Sign in to establish active session cookies
  await supabase.auth.signInWithPassword({
    email,
    password,
  })

  revalidatePath('/', 'layout')
  return { success: true, redirectUrl: '/student/dashboard' }
}

export async function registerStaff(formData: FormData) {
  const supabase = await createClient()

  const fullName = (formData.get('fullName') as string)?.trim()
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const phone = ((formData.get('phone') as string)?.trim()) || '+91 98765 43220'
  const departmentIdInput = (formData.get('departmentId') as string)?.trim()
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!fullName || !email || !departmentIdInput || !password) {
    return { error: 'Full name, email, department group, and password are required.' }
  }

  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters.' }
  }

  if (confirmPassword && password !== confirmPassword) {
    return { error: 'Passwords do not match. Please re-enter carefully.' }
  }

  // Resolve department UUID
  const admin = createAdminClient()
  let validDeptId: string | null = null
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(departmentIdInput)
  if (isUuid) {
    validDeptId = departmentIdInput
  } else {
    const cleanName = departmentIdInput.replace(/[-_]/g, ' ')
    const { data: matchedDept } = await admin
      .from('departments')
      .select('id')
      .ilike('name', `%${cleanName}%`)
      .limit(1)
      .maybeSingle()
    validDeptId = matchedDept?.id || null
  }

  if (!validDeptId) {
    const { data: firstDept } = await admin.from('departments').select('id').limit(1).maybeSingle()
    validDeptId = firstDept?.id || null
  }

  const staffEmpId = `EMP-${Math.floor(1000 + Math.random() * 9000)}`
  let userId: string | null = null

  // 1. Try creating user via Admin API
  try {
    const { data: adminData, error: adminError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role: 'STAFF',
        phone,
        department_id: validDeptId,
        student_id: staffEmpId,
        roll_number: staffEmpId,
        branch: 'Engineering Maintenance',
        year: 'Staff / Technician',
      },
    })

    if (!adminError && adminData?.user) {
      userId = adminData.user.id
    } else if (adminError && adminError.message.includes('already registered')) {
      return { error: 'An account with this email address already exists. Please sign in.' }
    }
  } catch (err: any) {
    console.warn('Admin user creation notice:', err?.message)
  }

  // 2. Fallback to standard signUp
  if (!userId) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: 'STAFF',
          phone,
          department_id: validDeptId,
          student_id: staffEmpId,
          roll_number: staffEmpId,
          branch: 'Engineering Maintenance',
          year: 'Staff / Technician',
        },
      },
    })

    if (error) {
      return { error: error.message }
    }

    if (data?.user) {
      userId = data.user.id
    }
  }

  if (!userId) {
    return { error: 'Failed to create technician account in authentication service.' }
  }

  // 3. Upsert into profiles table with all fields cleanly populated
  try {
    const { error: profileError } = await admin.from('profiles').upsert(
      [
        {
          user_id: userId,
          email,
          full_name: fullName,
          phone,
          department_id: validDeptId,
          role: 'STAFF',
          student_id: staffEmpId,
          roll_number: staffEmpId,
          branch: 'Engineering Maintenance',
          year: 'Staff / Technician',
          updated_at: new Date().toISOString(),
        },
      ],
      { onConflict: 'user_id' }
    )

    if (profileError) {
      console.error('Staff profile creation error:', profileError)
      return { error: `Profile creation failed: ${profileError.message}` }
    }
  } catch (err: any) {
    console.warn('Staff profile insert warning:', err?.message)
  }

  // 4. Sign in to establish active session
  await supabase.auth.signInWithPassword({
    email,
    password,
  })

  revalidatePath('/', 'layout')
  return { success: true, redirectUrl: '/staff/dashboard' }
}

export async function updateAvatarUrl(avatarUrl: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized: User session not found.' }
  }

  try {
    const admin = createAdminClient()
    const { error } = await admin
      .from('profiles')
      .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/', 'layout')
    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'Failed to update avatar' }
  }
}

export async function requestPasswordReset(email: string, redirectToOrigin?: string) {
  const supabase = await createClient()

  if (!email || !email.includes('@')) {
    return { error: 'Please enter a valid campus email address.' }
  }

  const redirectUrl = redirectToOrigin 
    ? `${redirectToOrigin}/reset-password`
    : undefined

  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: redirectUrl,
  })

  if (error) {
    return { error: error.message }
  }

  return { 
    success: true, 
    message: 'Password reset link sent! Please check your email inbox to set a new password.' 
  }
}

export async function updateUserPassword(newPassword: string) {
  const supabase = await createClient()

  if (!newPassword || newPassword.length < 6) {
    return { error: 'New password must be at least 6 characters.' }
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  return { success: true, message: 'Password updated successfully!' }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
