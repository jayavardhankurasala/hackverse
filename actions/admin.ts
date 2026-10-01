'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const assignSchema = z.object({
  requestId: z.string().uuid(),
  staffUserId: z.string().uuid(),
  departmentId: z.string().uuid().optional().nullable(),
})

const updateRequestSchema = z.object({
  requestId: z.string().uuid(),
  category: z.string().min(1).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  departmentId: z.string().uuid().optional().nullable(),
  status: z.enum(['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
  staffUserId: z.string().uuid().optional().nullable(),
})

/**
 * Verify current user has ADMIN role
 */
async function verifyAdmin(supabase: any) {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('Authentication required')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('user_id', user.id)
    .single()

  if (profile?.role !== 'ADMIN') {
    throw new Error('Access denied: Administrator privileges required')
  }

  return { user, profile }
}

/**
 * Assign a request to a staff member
 */
export async function assignRequestStaff(
  requestId: string,
  staffUserId: string,
  departmentId?: string | null
) {
  const supabase = await createClient()

  try {
    const { user: adminUser } = await verifyAdmin(supabase)

    const parsed = assignSchema.parse({
      requestId,
      staffUserId,
      departmentId,
    })

    // Fetch the request
    const { data: request, error: reqError } = await supabase
      .from('service_requests')
      .select('id, ticket_number, title, created_by, assigned_to, department_id')
      .eq('id', parsed.requestId)
      .single()

    if (reqError || !request) {
      return { error: 'Request not found' }
    }

    // Fetch assigned staff profile
    const { data: staffProfile, error: staffError } = await supabase
      .from('profiles')
      .select('user_id, full_name, role, department_id')
      .eq('user_id', parsed.staffUserId)
      .single()

    if (staffError || !staffProfile || staffProfile.role !== 'STAFF') {
      return { error: 'Selected user is not a valid staff member' }
    }

    const now = new Date().toISOString()
    const targetDeptId = parsed.departmentId || staffProfile.department_id || request.department_id

    // Update service request
    const { error: updateError } = await supabase
      .from('service_requests')
      .update({
        assigned_to: parsed.staffUserId,
        status: 'ASSIGNED',
        assigned_at: now,
        department_id: targetDeptId,
        updated_at: now,
      })
      .eq('id', parsed.requestId)

    if (updateError) {
      return { error: updateError.message }
    }

    // Create activity log
    await supabase.from('activity_logs').insert([
      {
        request_id: parsed.requestId,
        user_id: adminUser.id,
        action: `Assigned to staff: ${staffProfile.full_name}`,
        old_value: { assigned_to: request.assigned_to },
        new_value: { assigned_to: parsed.staffUserId, status: 'ASSIGNED' },
      },
    ])

    // Create notification for assigned staff member
    await supabase.from('notifications').insert([
      {
        user_id: parsed.staffUserId,
        request_id: parsed.requestId,
        title: 'New Service Request Assigned',
        message: `You have been assigned ticket ${request.ticket_number}: "${request.title}"`,
        type: 'STAFF_ASSIGNED',
        is_read: false,
      },
    ])

    // Create notification for student/requester
    await supabase.from('notifications').insert([
      {
        user_id: request.created_by,
        request_id: parsed.requestId,
        title: 'Staff Assigned to Your Request',
        message: `Ticket ${request.ticket_number} has been assigned to ${staffProfile.full_name}.`,
        type: 'STATUS_UPDATE',
        is_read: false,
      },
    ])

    revalidatePath('/admin/dashboard')
    revalidatePath('/admin/requests')
    revalidatePath(`/admin/requests/${parsed.requestId}`)
    revalidatePath('/staff/dashboard')
    revalidatePath('/staff/requests')
    revalidatePath(`/staff/requests/${parsed.requestId}`)
    revalidatePath('/student/dashboard')
    revalidatePath(`/student/requests/${parsed.requestId}`)

    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'Failed to assign staff member' }
  }
}

/**
 * Update request parameters as an Admin (category, priority, department, status, staff)
 */
export async function updateRequestByAdmin(formData: {
  requestId: string
  category?: string
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  departmentId?: string | null
  status?: 'SUBMITTED' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
  staffUserId?: string | null
}) {
  const supabase = await createClient()

  try {
    const { user: adminUser } = await verifyAdmin(supabase)

    const parsed = updateRequestSchema.parse(formData)

    // Fetch existing request
    const { data: request, error: reqError } = await supabase
      .from('service_requests')
      .select('*')
      .eq('id', parsed.requestId)
      .single()

    if (reqError || !request) {
      return { error: 'Request not found' }
    }

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }
    const logChanges: Record<string, any> = {}

    if (parsed.category && parsed.category !== request.category) {
      updates.category = parsed.category
      logChanges.category = { old: request.category, new: parsed.category }
    }

    if (parsed.priority && parsed.priority !== request.priority) {
      updates.priority = parsed.priority
      logChanges.priority = { old: request.priority, new: parsed.priority }
    }

    if (parsed.departmentId !== undefined && parsed.departmentId !== request.department_id) {
      updates.department_id = parsed.departmentId
      logChanges.department_id = { old: request.department_id, new: parsed.departmentId }
    }

    if (parsed.status && parsed.status !== request.status) {
      updates.status = parsed.status
      if (parsed.status === 'RESOLVED' && !request.resolved_at) {
        updates.resolved_at = new Date().toISOString()
      }
      if (parsed.status === 'CLOSED' && !request.closed_at) {
        updates.closed_at = new Date().toISOString()
      }
      logChanges.status = { old: request.status, new: parsed.status }
    }

    if (parsed.staffUserId !== undefined && parsed.staffUserId !== request.assigned_to) {
      updates.assigned_to = parsed.staffUserId
      if (parsed.staffUserId && !request.assigned_at) {
        updates.assigned_at = new Date().toISOString()
      }
      logChanges.assigned_to = { old: request.assigned_to, new: parsed.staffUserId }
    }

    if (Object.keys(updates).length === 1) {
      return { success: true, message: 'No changes detected' }
    }

    const { error: updateError } = await supabase
      .from('service_requests')
      .update(updates)
      .eq('id', parsed.requestId)

    if (updateError) {
      return { error: updateError.message }
    }

    // Insert activity log
    await supabase.from('activity_logs').insert([
      {
        request_id: parsed.requestId,
        user_id: adminUser.id,
        action: `Request updated by Administrator: ${Object.keys(logChanges).join(', ')}`,
        old_value: Object.fromEntries(Object.entries(logChanges).map(([k, v]) => [k, v.old])),
        new_value: Object.fromEntries(Object.entries(logChanges).map(([k, v]) => [k, v.new])),
      },
    ])

    // If status changed to CLOSED, notify student
    if (updates.status === 'CLOSED' && request.created_by) {
      await supabase.from('notifications').insert([
        {
          user_id: request.created_by,
          request_id: parsed.requestId,
          title: 'Request Closed',
          message: `Your ticket ${request.ticket_number} has been officially closed.`,
          type: 'STATUS_CLOSED',
          is_read: false,
        },
      ])
    }

    revalidatePath('/admin/dashboard')
    revalidatePath('/admin/requests')
    revalidatePath(`/admin/requests/${parsed.requestId}`)
    revalidatePath('/staff/dashboard')
    revalidatePath('/staff/requests')
    revalidatePath(`/staff/requests/${parsed.requestId}`)
    revalidatePath('/student/dashboard')
    revalidatePath(`/student/requests/${parsed.requestId}`)

    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'Failed to update request' }
  }
}
