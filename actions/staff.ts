'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const resolveSchema = z.object({
  requestId: z.string().uuid('Invalid request ID'),
  resolutionNote: z
    .string()
    .trim()
    .min(10, 'Resolution note must be at least 10 characters')
    .max(1000, 'Resolution note cannot exceed 1000 characters'),
})

/**
 * Staff starts working on an assigned request (ASSIGNED -> IN_PROGRESS)
 */
export async function startWorkOnRequest(requestId: string) {
  const supabase = await createClient()

  // 1. Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Authentication required' }
  }

  // 2. Confirm user has STAFF role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (profile?.role !== 'STAFF' && profile?.role !== 'ADMIN') {
    return { error: 'Access denied: Only staff members can perform this action' }
  }

  // 3. Fetch request & confirm assignment
  const { data: request, error: reqError } = await supabase
    .from('service_requests')
    .select('id, ticket_number, status, created_by, assigned_to')
    .eq('id', requestId)
    .single()

  if (reqError || !request) {
    return { error: 'Request not found' }
  }

  if (request.assigned_to !== user.id && profile?.role !== 'ADMIN') {
    return { error: 'You can only update requests assigned to you' }
  }

  // 4. Validate allowed transitions
  if (request.status === 'IN_PROGRESS') {
    return { success: true, message: 'Request is already in progress' }
  }

  if (request.status !== 'ASSIGNED') {
    return { error: `Cannot start work from current status (${request.status}). Request must be in ASSIGNED status.` }
  }

  // 5. Update request status
  const now = new Date().toISOString()
  const { error: updateError } = await supabase
    .from('service_requests')
    .update({
      status: 'IN_PROGRESS',
      updated_at: now,
    })
    .eq('id', requestId)

  if (updateError) {
    return { error: updateError.message }
  }

  // 6. Insert activity log
  await supabase.from('activity_logs').insert([
    {
      request_id: requestId,
      user_id: user.id,
      action: 'Status changed from ASSIGNED to IN_PROGRESS',
      old_value: { status: 'ASSIGNED' },
      new_value: { status: 'IN_PROGRESS' },
    },
  ])

  // 7. Create notification for the requester
  await supabase.from('notifications').insert([
    {
      user_id: request.created_by,
      request_id: requestId,
      title: 'Request In Progress',
      message: `Your request ${request.ticket_number} is now being worked on.`,
      type: 'STATUS_UPDATE',
      is_read: false,
    },
  ])

  revalidatePath('/staff/dashboard')
  revalidatePath('/staff/requests')
  revalidatePath(`/staff/requests/${requestId}`)
  revalidatePath('/student/dashboard')
  revalidatePath(`/student/requests/${requestId}`)

  return { success: true }
}

/**
 * Staff resolves an assigned request (IN_PROGRESS or ASSIGNED -> RESOLVED)
 */
export async function resolveRequest(formData: FormData) {
  const supabase = await createClient()

  // 1. Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Authentication required' }
  }

  // 2. Confirm user has STAFF role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (profile?.role !== 'STAFF' && profile?.role !== 'ADMIN') {
    return { error: 'Access denied: Only staff members can resolve requests' }
  }

  // 3. Validate form data with Zod
  const rawRequestId = formData.get('requestId') as string
  const rawResolutionNote = formData.get('resolutionNote') as string

  const parsed = resolveSchema.safeParse({
    requestId: rawRequestId,
    resolutionNote: rawResolutionNote,
  })

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message || 'Invalid form input' }
  }

  const { requestId, resolutionNote } = parsed.data

  // 4. Fetch request & confirm assignment
  const { data: request, error: reqError } = await supabase
    .from('service_requests')
    .select('id, ticket_number, status, created_by, assigned_to')
    .eq('id', requestId)
    .single()

  if (reqError || !request) {
    return { error: 'Request not found' }
  }

  if (request.assigned_to !== user.id && profile?.role !== 'ADMIN') {
    return { error: 'You can only resolve requests assigned to you' }
  }

  // 5. Allowed transitions: must be IN_PROGRESS or ASSIGNED
  if (request.status === 'RESOLVED') {
    return { error: 'Request is already marked as RESOLVED' }
  }

  if (request.status === 'CLOSED') {
    return { error: 'Cannot modify a closed request' }
  }

  if (request.status === 'SUBMITTED') {
    return { error: 'Request must be assigned and in progress before being resolved' }
  }

  // 6. Handle optional resolution image upload
  let resolutionAttachmentUrl: string | null = null
  const file = formData.get('resolutionImage') as File | null

  if (file && file.size > 0) {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      return { error: 'Resolution attachment must be an image (JPEG, PNG, WebP, or GIF)' }
    }

    if (file.size > 5 * 1024 * 1024) {
      return { error: 'Image size exceeds maximum limit of 5MB' }
    }

    const fileExt = file.name.split('.').pop() || 'jpg'
    const fileName = `resolution-${requestId}-${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('request-attachments')
      .upload(`resolutions/${fileName}`, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      // Storage upload error: proceed or return error
      return { error: `Failed to upload resolution image: ${uploadError.message}` }
    }

    const { data: { publicUrl } } = supabase.storage
      .from('request-attachments')
      .getPublicUrl(`resolutions/${fileName}`)

    resolutionAttachmentUrl = publicUrl

    // Also record in request_attachments table for consistency
    await supabase.from('request_attachments').insert([
      {
        request_id: requestId,
        file_url: publicUrl,
        file_name: `Resolution: ${file.name}`,
        file_type: file.type,
        uploaded_by: user.id,
      },
    ])
  }

  // 7. Update service_requests record
  const now = new Date().toISOString()
  const { error: updateError } = await supabase
    .from('service_requests')
    .update({
      status: 'RESOLVED',
      resolution_note: resolutionNote,
      resolution_attachment_url: resolutionAttachmentUrl,
      resolved_at: now,
      updated_at: now,
    })
    .eq('id', requestId)

  if (updateError) {
    return { error: updateError.message }
  }

  // 8. Add activity log
  await supabase.from('activity_logs').insert([
    {
      request_id: requestId,
      user_id: user.id,
      action: 'Request resolved',
      old_value: { status: request.status },
      new_value: { status: 'RESOLVED', resolution_note: resolutionNote },
    },
  ])

  // 9. Create notification for the requester
  await supabase.from('notifications').insert([
    {
      user_id: request.created_by,
      request_id: requestId,
      title: 'Request Resolved',
      message: `Your request ${request.ticket_number} has been resolved.`,
      type: 'STATUS_RESOLVED',
      is_read: false,
    },
  ])

  revalidatePath('/staff/dashboard')
  revalidatePath('/staff/requests')
  revalidatePath(`/staff/requests/${requestId}`)
  revalidatePath('/student/dashboard')
  revalidatePath(`/student/requests/${requestId}`)

  return { success: true }
}
