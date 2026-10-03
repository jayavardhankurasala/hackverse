import { DemoUser, DemoRequest, DemoComment, DemoActivityLog, ServiceCategory, RequestPriority } from './types'
import { DEMO_USERS, INITIAL_DEMO_REQUESTS, INITIAL_DEMO_COMMENTS, INITIAL_DEMO_LOGS } from './mock-data'
import { createClient } from '@/lib/supabase/client'

const STORAGE_KEY_USER = 'campus_demo_current_user'
const STORAGE_KEY_REQUESTS = 'campus_demo_requests'
const STORAGE_KEY_COMMENTS = 'campus_demo_comments'
const STORAGE_KEY_LOGS = 'campus_demo_logs'
const STORAGE_KEY_STAFF_DOMAINS = 'campus_demo_staff_domains'
const STORAGE_KEY_LOCAL_USERS = 'campus_demo_local_users'

export type LocalDemoAccount = {
  id: string
  name: string
  email: string
  role: 'STUDENT' | 'STAFF' | 'ADMIN'
  password: string
  studentId?: string
  employeeId?: string
  department?: string
  hostel?: string
}

// Helper for safe client-side localStorage access
function isClient(): boolean {
  return typeof window !== 'undefined'
}

export function getCurrentDemoUser(): DemoUser {
  if (isClient()) {
    const saved = localStorage.getItem(STORAGE_KEY_USER)
    const localUsers = getLocalDemoUsers()

    // 1. Prioritize authenticated Supabase user account
    if (saved) {
      const localUser = localUsers.find((user) => user.id === saved)
      if (localUser) {
        return {
          id: localUser.id,
          name: localUser.name,
          email: localUser.email,
          role: localUser.role,
          studentId: localUser.studentId,
          employeeId: localUser.employeeId,
          department: localUser.department,
          hostel: localUser.hostel,
        } as DemoUser
      }

      if (DEMO_USERS[saved]) {
        return DEMO_USERS[saved]
      }
    }

    // 2. Fallback to latest authenticated account if available
    if (localUsers.length > 0) {
      const latest = localUsers[localUsers.length - 1]
      return {
        id: latest.id,
        name: latest.name,
        email: latest.email,
        role: latest.role,
        studentId: latest.studentId,
        employeeId: latest.employeeId,
        department: latest.department,
        hostel: latest.hostel,
      } as DemoUser
    }
  }
  // Default to Arjun Reddy (Student 1)
  return DEMO_USERS['student-1']
}

export function setCurrentDemoUser(userId: string): DemoUser {
  const user = DEMO_USERS[userId] || getLocalDemoUsers().find((item) => item.id === userId) || DEMO_USERS['student-1']
  const normalizedUser = DEMO_USERS[userId]
    ? DEMO_USERS[userId]
    : {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: 'studentId' in user ? user.studentId : undefined,
        employeeId: 'employeeId' in user ? user.employeeId : undefined,
        department: 'department' in user ? user.department : undefined,
        hostel: 'hostel' in user ? user.hostel : undefined,
      }

  if (isClient()) {
    localStorage.setItem(STORAGE_KEY_USER, normalizedUser.id)
    // Dispatch custom event so reactive components update instantly
    window.dispatchEvent(new Event('demo-user-changed'))
  }
  return normalizedUser
}

export function getLocalDemoUsers(): LocalDemoAccount[] {
  if (!isClient()) return []

  try {
    const value = localStorage.getItem(STORAGE_KEY_LOCAL_USERS)
    return value ? JSON.parse(value) : []
  } catch {
    return []
  }
}

export function saveLocalDemoUsers(users: LocalDemoAccount[]) {
  if (!isClient()) return

  localStorage.setItem(STORAGE_KEY_LOCAL_USERS, JSON.stringify(users))
}

export function createLocalDemoUser(input: {
  fullName: string
  email: string
  password: string
  role: 'STUDENT' | 'STAFF'
  studentId?: string
  staffId?: string
  department?: string
}) {
  const localUsers = getLocalDemoUsers()
  const id = `local-${Date.now()}`
  const account: LocalDemoAccount = {
    id,
    name: input.fullName,
    email: input.email.trim().toLowerCase(),
    role: input.role,
    password: input.password,
    studentId: input.studentId,
    employeeId: input.staffId,
    department: input.department,
  }

  localUsers.push(account)
  saveLocalDemoUsers(localUsers)
  setCurrentDemoUser(id)
  return account
}

export function findDemoUserByCredentials(email: string, password: string): DemoUser | null {
  const normalizedEmail = email.trim().toLowerCase()
  const enteredPassword = password || ''

  const builtInMatch = Object.values(DEMO_USERS).find((user) => {
    const sameEmail = user.email?.toLowerCase() === normalizedEmail
    const samePassword = enteredPassword === 'campus123' || enteredPassword === 'demo123'
    return sameEmail && samePassword
  })

  if (builtInMatch) return builtInMatch

  const localUser = getLocalDemoUsers().find((user) => {
    const sameEmail = user.email.toLowerCase() === normalizedEmail
    const samePassword = user.password === enteredPassword
    return sameEmail && samePassword
  })

  if (!localUser) return null

  return {
    id: localUser.id,
    name: localUser.name,
    email: localUser.email,
    role: localUser.role,
    studentId: localUser.studentId,
    employeeId: localUser.employeeId,
    department: localUser.department,
    hostel: localUser.hostel,
  } as DemoUser
}

export function isLocalDemoMode() {
  if (typeof window === 'undefined') return false
  const forceDemo = localStorage.getItem('force_demo_mode') === 'true'
  if (forceDemo) return true

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  return !supabaseUrl || supabaseUrl.includes('placeholder')
}

export function getAllDemoUsers(): DemoUser[] {
  return Object.values(DEMO_USERS)
}

export function getDemoStaffDomain(staffId: string): string {
  if (isClient()) {
    const map = JSON.parse(localStorage.getItem(STORAGE_KEY_STAFF_DOMAINS) || '{}')
    if (map[staffId]) return map[staffId]
  }
  const staff = DEMO_USERS[staffId]
  return staff?.department || 'IT Support'
}

export function setDemoStaffDomain(staffId: string, domain: string): void {
  if (isClient()) {
    const map = JSON.parse(localStorage.getItem(STORAGE_KEY_STAFF_DOMAINS) || '{}')
    map[staffId] = domain
    localStorage.setItem(STORAGE_KEY_STAFF_DOMAINS, JSON.stringify(map))
    window.dispatchEvent(new Event('demo-data-changed'))
  }
}

let hasInitiatedSupabaseSync = false

export async function syncRequestsFromSupabase(): Promise<void> {
  if (!isClient()) return
  try {
    const supabase = createClient()
    const { data: dbRequests, error } = await supabase
      .from('service_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && Array.isArray(dbRequests) && dbRequests.length > 0) {
      const mapped: DemoRequest[] = dbRequests.map((r: any) => ({
        id: r.id,
        ticketNumber: r.ticket_number,
        title: r.title,
        description: r.description,
        category: (r.category || 'IT Support') as ServiceCategory,
        priority: (r.priority || 'LOW') as RequestPriority,
        status: r.status || 'SUBMITTED',
        location: r.location || '',
        building: r.building || 'Campus',
        room: r.room_number || '',
        studentId: r.created_by,
        studentName: 'Campus Student',
        assignedStaffId: r.assigned_to || undefined,
        assignedStaffName: r.assigned_to ? 'Assigned Staff' : undefined,
        department: r.category || 'General',
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        imageUrl: r.resolution_attachment_url || undefined,
        resolutionNote: r.resolution_note || undefined,
        resolutionImageUrl: r.resolution_attachment_url || undefined,
        resolvedAt: r.resolved_at || undefined,
        closedAt: r.closed_at || undefined,
      }))

      // Merge unique tickets into cache
      const existing = getDemoRequests()
      const mergedMap = new Map<string, DemoRequest>()
      mapped.forEach((item) => mergedMap.set(item.id, item))
      existing.forEach((item) => {
        if (!mergedMap.has(item.id)) {
          mergedMap.set(item.id, item)
        }
      })

      const combined = Array.from(mergedMap.values())
      saveDemoRequests(combined)
    }
  } catch {
    // If Supabase table does not exist or connection fails, local cache continues smoothly
  }
}

export function getDemoRequests(): DemoRequest[] {
  if (isClient()) {
    if (!hasInitiatedSupabaseSync) {
      hasInitiatedSupabaseSync = true
      syncRequestsFromSupabase()
    }
    const saved = localStorage.getItem(STORAGE_KEY_REQUESTS)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        console.error('Failed to parse demo requests', e)
      }
    }
  }
  return INITIAL_DEMO_REQUESTS
}

function saveDemoRequests(requests: DemoRequest[]): void {
  if (isClient()) {
    localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(requests))
    window.dispatchEvent(new Event('demo-data-changed'))
  }
}

export function getDemoRequestById(idOrTicket: string): DemoRequest | null {
  const all = getDemoRequests()
  return (
    all.find(
      (r) =>
        r.id === idOrTicket ||
        r.ticketNumber?.toLowerCase() === idOrTicket.toLowerCase()
    ) || null
  )
}

export function getStudentRequests(studentId: string): DemoRequest[] {
  const all = getDemoRequests()
  return all.filter((r) => r.studentId === studentId)
}

export function getStaffAssignedRequests(staffId: string): DemoRequest[] {
  const all = getDemoRequests()
  return all.filter((r) => r.assignedStaffId === staffId)
}

/**
 * Queue of repair assigned to their department
 */
export function getDepartmentRequests(departmentName: string): DemoRequest[] {
  const all = getDemoRequests()
  return all.filter((r) => {
    // Normalizing categories to department matching
    const cat = r.category.toLowerCase()
    const dept = departmentName.toLowerCase()
    const rDept = (r.department || '').toLowerCase()
    return cat.includes(dept) || dept.includes(cat) || rDept.includes(dept) || dept.includes(rDept)
  })
}

/**
 * Priority queue sorted by CRITICAL, HIGH, MEDIUM, LOW
 */
export function getPriorityQueue(): DemoRequest[] {
  const all = getDemoRequests()
  const priorityWeights: Record<RequestPriority, number> = {
    CRITICAL: 4,
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1,
  }

  return [...all].sort((a, b) => {
    const diff = (priorityWeights[b.priority] || 0) - (priorityWeights[a.priority] || 0)
    if (diff !== 0) return diff
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}

export function createDemoRequest(data: {
  title: string
  description: string
  category: ServiceCategory
  priority: RequestPriority
  location: string
  building?: string
  room?: string
  imageUrl?: string
  studentId: string
  studentName: string
  aiRecommendation?: DemoRequest['aiRecommendation']
}): DemoRequest {
  const now = new Date()
  const day = String(now.getDate()).padStart(2, '0')
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const year = String(now.getFullYear())
  const datePrefix = `${day}${month}${year}`

  const all = getDemoRequests()
  let seq = 1
  while (all.some((r: DemoRequest) => r.ticketNumber === `${datePrefix}-${seq}`)) {
    seq++
  }
  const ticketNumber = `${datePrefix}-${seq}`
  const id = `req-${ticketNumber}-${Date.now().toString().slice(-4)}`

  // Strict 1-to-1 Domain Mapping across the 8 Specialized Campus Domains
  const defaultDept = data.category
  let defaultStaff = 'Vikram Rao'
  if (data.category === 'Electrical') defaultStaff = 'Suresh Kumar'
  else if (data.category === 'Plumbing') defaultStaff = 'Ramesh Naidu'
  else if (data.category === 'Maintenance') defaultStaff = 'K. Prasad'
  else if (data.category === 'Hostel') defaultStaff = 'Anjali Devi'
  else if (data.category === 'Transport') defaultStaff = 'M. Venkat'
  else if (data.category === 'Cleaning') defaultStaff = 'Lakshmi Bai'
  else if (data.category === 'Administration') defaultStaff = 'G. Satyanarayana'

  const newReq: DemoRequest = {
    id,
    ticketNumber,
    title: data.title,
    description: data.description,
    category: data.category,
    priority: data.priority,
    location: data.location,
    building: data.building || 'General',
    room: data.room || '',
    studentId: data.studentId,
    studentName: data.studentName,
    status: 'SUBMITTED',
    department: defaultDept,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    imageUrl: data.imageUrl,
    aiRecommendation: data.aiRecommendation || {
      category: data.category,
      priority: data.priority,
      department: defaultDept,
      suggestedStaff: defaultStaff,
      summary: `Automated assessment of reported ${data.category.toLowerCase()} condition at ${data.location}.`,
      reasoning: `Matched keywords in report description to ${defaultDept} domain with ${data.priority} SLA response window.`,
    },
  }

  const updatedList = [newReq, ...all]
  saveDemoRequests(updatedList)

  // Append initial activity log
  addDemoLog(id, `Request submitted by ${data.studentName}`, data.studentName)
  addDemoLog(id, `AI Triage: Suggested ${newReq.aiRecommendation?.suggestedStaff} (${defaultDept})`, 'System AI')

  // Asynchronously sync new ticket to Supabase database
  if (isClient()) {
    try {
      const supabase = createClient()
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          supabase
            .from('service_requests')
            .insert({
              ticket_number: ticketNumber,
              title: data.title,
              description: data.description,
              category: data.category,
              priority: data.priority,
              location: data.location,
              building: data.building || 'Campus',
              room_number: data.room || null,
              created_by: user.id,
              status: 'SUBMITTED',
              ai_category: data.aiRecommendation?.category || null,
              ai_priority: data.aiRecommendation?.priority || null,
              ai_summary: data.aiRecommendation?.summary || null,
            })
            .then(() => {})
        }
      })
    } catch {}
  }

  return newReq
}

export function assignDemoRequest(requestId: string, staffUserId: string): DemoRequest | null {
  const all = getDemoRequests()
  const staff = DEMO_USERS[staffUserId] || Object.values(DEMO_USERS).find((u) => u.name === staffUserId)
  if (!staff) return null

  const updatedList = all.map((r) => {
    if (r.id === requestId) {
      return {
        ...r,
        assignedStaffId: staff.id,
        assignedStaffName: staff.name,
        status: 'ASSIGNED' as const,
        assignedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    }
    return r
  })

  saveDemoRequests(updatedList)
  addDemoLog(requestId, `Assigned to ${staff.name} by Admin Office`, 'Admin Office')

  return updatedList.find((r) => r.id === requestId) || null
}

export function startWorkDemoRequest(requestId: string, staffName: string): DemoRequest | null {
  const all = getDemoRequests()
  const updatedList = all.map((r) => {
    if (r.id === requestId) {
      return {
        ...r,
        status: 'IN_PROGRESS' as const,
        updatedAt: new Date().toISOString(),
      }
    }
    return r
  })

  saveDemoRequests(updatedList)
  addDemoLog(requestId, `Status updated to IN_PROGRESS by ${staffName}`, staffName)

  return updatedList.find((r) => r.id === requestId) || null
}

export function resolveDemoRequest(
  requestId: string,
  resolutionNote: string,
  staffName: string,
  resolutionImageUrl?: string
): DemoRequest | null {
  const all = getDemoRequests()
  const updatedList = all.map((r) => {
    if (r.id === requestId) {
      return {
        ...r,
        status: 'RESOLVED' as const,
        resolutionNote,
        resolutionImageUrl,
        resolvedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    }
    return r
  })

  saveDemoRequests(updatedList)
  addDemoLog(requestId, `Request marked as RESOLVED by ${staffName}`, staffName)

  return updatedList.find((r) => r.id === requestId) || null
}

export function closeDemoRequest(requestId: string, closerName: string): DemoRequest | null {
  const all = getDemoRequests()
  const updatedList = all.map((r) => {
    if (r.id === requestId) {
      return {
        ...r,
        status: 'CLOSED' as const,
        closedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    }
    return r
  })

  saveDemoRequests(updatedList)
  addDemoLog(requestId, `Ticket closed by ${closerName}`, closerName)

  return updatedList.find((r) => r.id === requestId) || null
}

// Comments
export function getDemoComments(requestId: string): DemoComment[] {
  if (isClient()) {
    const map = JSON.parse(localStorage.getItem(STORAGE_KEY_COMMENTS) || '{}')
    if (map[requestId]) return map[requestId]
  }
  return INITIAL_DEMO_COMMENTS.filter((c) => c.requestId === requestId)
}

export function addDemoComment(
  requestId: string,
  text: string,
  userOrName: DemoUser | string,
  role?: any
): DemoComment {
  const isUserObj = typeof userOrName !== 'string'
  const authorName = isUserObj ? userOrName.name : userOrName
  const authorRole = isUserObj ? userOrName.role : (role || 'STUDENT')
  const userId = isUserObj ? userOrName.id : `user-${authorName.toLowerCase().replace(/\s+/g, '-')}`

  const newComment: DemoComment = {
    id: `c-${Date.now()}`,
    requestId,
    userId,
    authorName,
    authorRole,
    content: text,
    createdAt: new Date().toISOString(),
  }

  if (isClient()) {
    const map = JSON.parse(localStorage.getItem(STORAGE_KEY_COMMENTS) || '{}')
    const current = map[requestId] || INITIAL_DEMO_COMMENTS.filter((c) => c.requestId === requestId)
    map[requestId] = [...current, newComment]
    localStorage.setItem(STORAGE_KEY_COMMENTS, JSON.stringify(map))
    window.dispatchEvent(new Event('demo-data-changed'))
  }

  addDemoLog(requestId, `Comment added by ${authorName} (${authorRole})`, authorName)

  return newComment
}

export function rateDemoRequest(
  requestId: string,
  rating: number,
  feedback?: string,
  userId?: string
): void {
  if (isClient()) {
    const ratings = JSON.parse(localStorage.getItem('campus_demo_ratings') || '[]')
    ratings.push({
      id: `rate-${Date.now()}`,
      requestId,
      userId: userId || 'student-1',
      rating,
      feedback,
      createdAt: new Date().toISOString(),
    })
    localStorage.setItem('campus_demo_ratings', JSON.stringify(ratings))
    addDemoLog(requestId, `Student rated resolution: ${rating} Stars`, 'Student')
    window.dispatchEvent(new Event('demo-data-changed'))
  }
}

// Logs
export function getDemoLogs(requestId: string): DemoActivityLog[] {
  if (isClient()) {
    const map = JSON.parse(localStorage.getItem(STORAGE_KEY_LOGS) || '{}')
    if (map[requestId]) return map[requestId]
  }
  return INITIAL_DEMO_LOGS[requestId] || [
    {
      id: `init-${requestId}`,
      requestId,
      action: 'Request recorded in campus register',
      userName: 'Campus Service Desk',
      timestamp: new Date().toISOString(),
    },
  ]
}

export function addDemoLog(requestId: string, action: string, userName: string): void {
  const newLog: DemoActivityLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    requestId,
    action,
    userName,
    timestamp: new Date().toISOString(),
  }

  if (isClient()) {
    const map = JSON.parse(localStorage.getItem(STORAGE_KEY_LOGS) || '{}')
    const current = map[requestId] || INITIAL_DEMO_LOGS[requestId] || []
    map[requestId] = [...current, newLog]
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(map))
    window.dispatchEvent(new Event('demo-data-changed'))
  }
}
