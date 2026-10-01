export type UserRole = 'STUDENT' | 'STAFF' | 'ADMIN';
export type RequestStatus = 'SUBMITTED' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type RequestPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  student_id?: string | null;
  department_id?: string | null;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
  department?: Department | null;
}

export interface Department {
  id: string;
  name: string;
  description?: string | null;
  created_at: string;
}

export interface ServiceRequest {
  id: string;
  ticket_number: string;
  title: string;
  description: string;
  category: string;
  priority: RequestPriority;
  status: RequestStatus;
  location?: string | null;
  building?: string | null;
  room_number?: string | null;
  created_by: string;
  assigned_to?: string | null;
  department_id?: string | null;
  resolution_note?: string | null;
  resolution_attachment_url?: string | null;
  ai_category?: string | null;
  ai_priority?: RequestPriority | null;
  ai_department?: string | null;
  ai_summary?: string | null;
  created_at: string;
  updated_at: string;
  assigned_at?: string | null;
  resolved_at?: string | null;
  closed_at?: string | null;
  // Joined fields
  requester?: Profile | null;
  assignee?: Profile | null;
  department?: Department | null;
  request_attachments?: RequestAttachment[];
  activity_logs?: ActivityLog[];
}

export interface RequestComment {
  id: string;
  request_id: string;
  user_id: string;
  comment: string;
  created_at: string;
  profiles?: Profile | { full_name: string; role?: UserRole } | null;
}

export interface RequestAttachment {
  id: string;
  request_id: string;
  file_url: string;
  file_name: string;
  file_type?: string | null;
  uploaded_by: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  request_id?: string | null;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  request_id: string;
  user_id?: string | null;
  action: string;
  old_value?: any;
  new_value?: any;
  created_at: string;
  profiles?: { full_name: string } | null;
}
