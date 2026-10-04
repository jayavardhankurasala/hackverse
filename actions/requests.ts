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

  // Generate date-based sequential ticket number: DDMMYYYY-N
  const now = new Date()
  const day = String(now.getDate()).padStart(2, '0')
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const year = String(now.getFullYear())
  const datePrefix = `${day}${month}${year}` // e.g. "03102026"

  let ticketNumber = `${datePrefix}-1`
  try {
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const admin = createAdminClient()
    const { data: atomicToken, error: rpcError } = await admin.rpc('get_next_ticket_number', {
      p_date_prefix: datePrefix,
    })

    if (!rpcError && atomicToken) {
      ticketNumber = atomicToken
    } else {
      // Fallback query if RPC unavailable
      const { data: todayTickets } = await admin
        .from('service_requests')
        .select('ticket_number')
        .ilike('ticket_number', `${datePrefix}-%`)

      if (todayTickets && todayTickets.length > 0) {
        let maxSeq = 0
        for (const t of todayTickets) {
          const parts = t.ticket_number.split('-')
          const seq = parseInt(parts[parts.length - 1], 10)
          if (!isNaN(seq) && seq > maxSeq) {
            maxSeq = seq
          }
        }
        ticketNumber = `${datePrefix}-${maxSeq + 1}`
      }
    }
  } catch {
    ticketNumber = `${datePrefix}-${Math.floor(100 + Math.random() * 900)}`
  }

  // Exact 1-to-1 department linkage
  let departmentId: string | null = null
  try {
    const { data: dept } = await supabase
      .from('departments')
      .select('id')
      .ilike('name', category.trim())
      .maybeSingle()
    if (dept) {
      departmentId = dept.id
    }
  } catch {}

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
        department_id: departmentId,
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

  // Concurrently log activity and save attachment (if present)
  const postTasks: PromiseLike<any>[] = [
    supabase.from('activity_logs').insert([
      {
        request_id: request.id,
        user_id: user.id,
        action: 'Request created',
      },
    ]),
  ]

  if (fileUrl && file) {
    postTasks.push(
      supabase.from('request_attachments').insert([
        {
          request_id: request.id,
          file_url: fileUrl,
          file_name: file.name,
          file_type: fileType,
          uploaded_by: user.id,
        },
      ])
    )
  }

  await Promise.all(postTasks)

  // AI Smart Staff Auto-Assignment Engine & Critical Hazard Alerts
  try {
    const { autoAssignTicket } = await import('@/lib/ai/auto-assign')
    const assignResult = await autoAssignTicket({
      id: request.id,
      category,
      priority,
      title,
      description,
    })

    // Real-Time Critical Hazard Alert (SMS / WhatsApp Webhook Simulation)
    if (priority === 'CRITICAL' || aiPriority === 'CRITICAL') {
      try {
        const { sendCriticalHazardAlert } = await import('@/lib/notifications/alert')
        await sendCriticalHazardAlert({
          ticketId: request.id,
          ticketNumber,
          title,
          description,
          category,
          building,
          room: roomNumber,
          priority: 'CRITICAL',
          assignedStaffName: assignResult?.staffName,
          assignedStaffEmail: assignResult?.staffEmail,
        })
      } catch (alertErr) {
        console.warn('Critical hazard alert dispatch notice:', alertErr)
      }
    }
  } catch (assignErr) {
    console.warn('Auto-assignment notice:', assignErr)
  }

  revalidatePath('/student/dashboard')
  revalidatePath('/student/requests')
  revalidatePath('/staff/dashboard')
  revalidatePath('/staff/requests')
  revalidatePath('/admin/dashboard')
  
  redirect(`/student/requests/${request.id}`)
}
