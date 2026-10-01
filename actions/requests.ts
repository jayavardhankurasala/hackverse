'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createServiceRequest(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
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
    const fileExt = file.name.split('.').pop()
    fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
    fileType = file.type

    const { error: uploadError } = await supabase.storage
      .from('request-attachments')
      .upload(`public/${fileName}`, file)

    if (uploadError) {
      return { error: 'Failed to upload image' }
    }

    const { data: { publicUrl } } = supabase.storage
      .from('request-attachments')
      .getPublicUrl(`public/${fileName}`)
      
    fileUrl = publicUrl
  }

  // Generate unique ticket number (in a real app, you'd use a robust sequencer or sequence in DB)
  // We'll generate CR-XXXX
  const { count } = await supabase
    .from('service_requests')
    .select('*', { count: 'exact', head: true })

  const ticketNumber = `CR-${1000 + (count || 0) + 1}`

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
