'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const commentSchema = z.object({
  requestId: z.string().uuid(),
  comment: z.string().trim().min(1, 'Comment cannot be empty').max(2000, 'Comment is too long'),
})

export async function addComment(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const rawRequestId = formData.get('requestId') as string
  const rawComment = formData.get('comment') as string

  const parsed = commentSchema.safeParse({
    requestId: rawRequestId,
    comment: rawComment,
  })

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message || 'Invalid input' }
  }

  const { requestId, comment } = parsed.data

  // Verify access: user must be creator, assigned staff, or admin
  const { data: request, error: reqError } = await supabase
    .from('service_requests')
    .select('id, created_by, assigned_to')
    .eq('id', requestId)
    .single()

  if (reqError || !request) {
    return { error: 'Request not found or access denied' }
  }

  // Check role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  const isAdmin = profile?.role === 'ADMIN'
  const isCreator = request.created_by === user.id
  const isAssigned = request.assigned_to === user.id

  if (!isAdmin && !isCreator && !isAssigned) {
    return { error: 'Unauthorized to comment on this request' }
  }

  const { error } = await supabase
    .from('request_comments')
    .insert([
      {
        request_id: requestId,
        user_id: user.id,
        comment,
      },
    ])

  if (error) {
    return { error: error.message }
  }

  // Add activity log
  await supabase.from('activity_logs').insert([
    {
      request_id: requestId,
      user_id: user.id,
      action: 'Comment added',
    }
  ])

  revalidatePath(`/student/requests/${requestId}`)
  revalidatePath(`/staff/requests/${requestId}`)
  return { success: true }
}
