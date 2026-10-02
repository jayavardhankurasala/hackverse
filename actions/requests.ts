'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createServiceRequest(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Authentication required. Please sign in to submit a service request.' }
  }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const category = formData.get('category') as string
  const priority = formData.get('priority') as string
  const location = formData.get('location') as string
  const building = formData.get('building') as string
  const roomNumber = formData.get('roomNumber') as string
  
  // File upload
  const file = formData.get('image') as File | null
  let fileUrl = null
  let fileName = null
  let fileType = null

  if (file && file.size > 0) {
    if (file.size > 5 * 1024 * 1024) {
      return { error: 'Attachment size exceeds maximum limit of 5MB' }
    }

    const fileExt = file.name.split('.').pop() || 'jpg'
    fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
    fileType = file.type

    try {
      const { error: uploadError } = await supabase.storage
        .from('request-attachments')
        .upload(`public/${fileName}`, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from('request-attachments')
          .getPublicUrl(`public/${fileName}`)
        fileUrl = publicUrl
      } else {
        console.warn('Supabase storage upload notice:', uploadError.message)
      }
    } catch (storageErr: any) {
      console.warn('Storage error:', storageErr.message)
    }
  }

  // Generate unique ticket number with collision resistance
  let ticketNumber = `CR-${Date.now().toString().slice(-4)}${Math.floor(10 + Math.random() * 90)}`
  try {
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const admin = createAdminClient()
    const { count } = await admin
      .from('service_requests')
      .select('*', { count: 'exact', head: true })
    if (typeof count === 'number') {
      ticketNumber = `CR-${1000 + count + 1}`
    }
  } catch {
    // Keep timestamp-based unique ticketNumber
  }

  const aiCategory = (formData.get('aiCategory') as string) || null
  const aiPriority = (formData.get('aiPriority') as any) || null
  const aiSummary = (formData.get('aiSummary') as string) || null

  const { data: request, error } = await supabase
    .from('service_requests')
    .insert([
      {
        ticket_number: ticketNumber,
        title,
        description,
        category,
        priority,
        location,
        building,
        room_number: roomNumber,
        created_by: user.id,
        status: 'SUBMITTED',
        ai_category: aiCategory,
        ai_priority: aiPriority,
        ai_summary: aiSummary,
      },
    ])
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // Log activity
  await supabase.from('activity_logs').insert([
    {
      request_id: request.id,
      user_id: user.id,
      action: 'Request created',
    }
  ])

  // Save attachment if exists
  if (fileUrl && file) {
    await supabase.from('request_attachments').insert([
      {
        request_id: request.id,
        file_url: fileUrl,
        file_name: file.name,
        file_type: fileType,
        uploaded_by: user.id,
      }
    ])
  }

  revalidatePath('/student/dashboard')
  revalidatePath('/student/requests')
  
  redirect(`/student/requests/${request.id}`)
}
