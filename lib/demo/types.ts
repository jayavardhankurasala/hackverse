export type Role = 'STUDENT' | 'STAFF' | 'ADMIN'

export type RequestStatus = 'SUBMITTED' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'

export type RequestPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export type ServiceCategory =
  | 'IT Support'
  | 'Electrical'
  | 'Plumbing'
  | 'Maintenance'
  | 'Hostel'
  | 'Transport'
  | 'Cleaning'
  | 'Administration'

export interface DemoUser {
  id: string
  name: string
  email: string
  role: Role
  studentId?: string
  employeeId?: string
  department?: string
  specialization?: string
  year?: string
  hostel?: string
  room?: string
  avatarUrl?: string
}

export interface DemoComment {
  id: string
  requestId: string
  userId: string
  authorName: string
  authorRole: Role
  content: string
  createdAt: string
}

export interface DemoActivityLog {
  id: string
  requestId: string
  action: string
  userName: string
  timestamp: string
}

export interface DemoRating {
  id: string
  requestId: string
  userId: string
  rating: number
  feedback?: string
  createdAt: string
}

export interface DemoRequest {
  id: string
  ticketNumber: string
  title: string
  description: string
  category: ServiceCategory
  priority: RequestPriority
  status: RequestStatus
  location: string
  building?: string
  room?: string
  studentId: string
  studentName: string
  assignedStaffId?: string
  assignedStaffName?: string
  department: string
  createdAt: string
  updatedAt: string
  assignedAt?: string
  resolvedAt?: string
  closedAt?: string
  resolutionNote?: string
  resolutionImageUrl?: string
  imageUrl?: string
  aiRecommendation?: {
    category: ServiceCategory
    priority: RequestPriority
    department: string
    suggestedStaff: string
    summary: string
    reasoning: string
  }
}
