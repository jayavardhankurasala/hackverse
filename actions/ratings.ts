'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const ratingSchema = z.object({
  requestId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  feedback: z.string().max(500).optional().nullable(),
})

export async function submitRequestRating(params: {
  requestId: string
  rating: number
  feedback?: string | null
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Authentication required' }
  }

  const parsed = ratingSchema.safeParse(params)
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message || 'Invalid rating' }
  }

  const { requestId, rating, feedback } = parsed.data

  // Fetch request and verify creator
  const { data: request, error: reqError } = await supabase
    .from('service_requests')
    .select('id, created_by, status')
    .eq('id', requestId)
    .single()

  if (reqError || !request) {
    return { error: 'Request not found' }
  }

  if (request.created_by !== user.id) {
    return { error: 'Only the request author can rate this service request' }
  }

  if (request.status !== 'RESOLVED' && request.status !== 'CLOSED') {
    return { error: 'You can only rate a request that has been resolved or closed' }
  }

  // Check if rating already exists
  const { data: existing } = await supabase
    .from('ratings')
    .select('id')
    .eq('request_id', requestId)
    .eq('user_id', user.id)
    .single()

  if (existing) {
    return { error: 'You have already submitted a rating for this request' }
  }

  // Insert rating
  const { error: insertError } = await supabase.from('ratings').insert([
    {
      request_id: requestId,
      user_id: user.id,
      rating,
      feedback: feedback ? feedback.trim() : null,
    },
  ])

  if (insertError) {
    return { error: insertError.message }
  }

  // Activity log
  await supabase.from('activity_logs').insert([
    {
      request_id: requestId,
      user_id: user.id,
      action: `Student submitted feedback (${rating}/5 stars)`,
    },
  ])

  revalidatePath(`/student/requests/${requestId}`)
  revalidatePath(`/staff/requests/${requestId}`)
  revalidatePath(`/admin/requests/${requestId}`)

  return { success: true }
}
