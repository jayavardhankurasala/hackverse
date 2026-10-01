import { DemoUser, DemoRequest, DemoComment, DemoActivityLog, ServiceCategory, RequestPriority } from './types'
import { DEMO_USERS, INITIAL_DEMO_REQUESTS, INITIAL_DEMO_COMMENTS, INITIAL_DEMO_LOGS } from './mock-data'

const STORAGE_KEY_USER = 'campus_demo_current_user'
const STORAGE_KEY_REQUESTS = 'campus_demo_requests'
const STORAGE_KEY_COMMENTS = 'campus_demo_comments'
const STORAGE_KEY_LOGS = 'campus_demo_logs'
const STORAGE_KEY_STAFF_DOMAINS = 'campus_demo_staff_domains'

// Helper for safe client-side localStorage access
function isClient(): boolean {
  return typeof window !== 'undefined'
}

export function getCurrentDemoUser(): DemoUser {
  if (isClient()) {
    const saved = localStorage.getItem(STORAGE_KEY_USER)
    if (saved && DEMO_USERS[saved]) {
      return DEMO_USERS[saved]
    }
  }
  // Default to Arjun Reddy (Student 1)
  return DEMO_USERS['student-1']
}

export function setCurrentDemoUser(userId: string): DemoUser {
  const user = DEMO_USERS[userId] || DEMO_USERS['student-1']
  if (isClient()) {
    localStorage.setItem(STORAGE_KEY_USER, user.id)
    // Dispatch custom event so reactive components update instantly
    window.dispatchEvent(new Event('demo-user-changed'))
  }
  return user
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

export function getDemoRequests(): DemoRequest[] {
  if (isClient()) {
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
  const all = getDemoRequests()
  const nextNum = 1000 + all.length + 1
  const ticketNumber = `CR-${nextNum}`
  const id = `req-${nextNum}`

  // Intelligent Staff Recommendation based on category
  let defaultStaff = 'Vikram Rao'
  let defaultDept = 'IT Support'
  if (data.category === 'Electrical') {
    defaultStaff = 'Suresh Kumar'
    defaultDept = 'Electrical'
  } else if (data.category === 'Plumbing' || data.category === 'Hostel' || data.category === 'Cleaning') {
    defaultStaff = 'Anjali Devi'
    defaultDept = 'Hostel'
  } else if (data.category === 'Maintenance') {
    defaultStaff = 'Suresh Kumar'
    defaultDept = 'Maintenance'
  }

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
