'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Clock, 
  User, 
  Building2, 
  FileText, 
  Paperclip, 
  MessageSquare, 
  History, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  Send,
  ExternalLink,
  UserCheck,
  ShieldCheck,
  Sparkles,
  Edit,
  Save,
  Check,
  X
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { PriorityBadge } from '@/components/ui/PriorityBadge'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { assignRequestStaff, updateRequestByAdmin } from '@/actions/admin'
import { addComment } from '@/actions/comments'

export default function AdminRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const requestId = resolvedParams.id
  const router = useRouter()

  const [request, setRequest] = useState<any>(null)
  const [requester, setRequester] = useState<any>(null)
  const [assignee, setAssignee] = useState<any>(null)
  const [department, setDepartment] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [attachments, setAttachments] = useState<any[]>([])
  const [activityLogs, setActivityLogs] = useState<any[]>([])
  const [allStaff, setAllStaff] = useState<any[]>([])
  const [allDepartments, setAllDepartments] = useState<any[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Assignment state
  const [selectedStaffId, setSelectedStaffId] = useState<string>('')
  const [isAssigning, setIsAssigning] = useState(false)
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null)

  // Edit parameters state
  const [isEditingParams, setIsEditingParams] = useState(false)
  const [editCategory, setEditCategory] = useState('')
  const [editPriority, setEditPriority] = useState<any>('LOW')
  const [editDeptId, setEditDeptId] = useState('')
  const [editStatus, setEditStatus] = useState<any>('SUBMITTED')
  const [isSavingParams, setIsSavingParams] = useState(false)

  // Comment state
  const [commentText, setCommentText] = useState('')
  const [isPostingComment, setIsPostingComment] = useState(false)

  const fetchDetails = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Authentication required')
        setLoading(false)
        return
      }

      // Check admin role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single()

      if (profile?.role !== 'ADMIN') {
        setError('Access denied: Administrator privileges required.')
        setLoading(false)
        return
      }

      // 1. Fetch Request
      const { data: reqData, error: reqErr } = await supabase
        .from('service_requests')
        .select('*')
        .eq('id', requestId)
        .single()

      if (reqErr || !reqData) {
        setError('Service request not found.')
        setLoading(false)
        return
      }

      setRequest(reqData)
      setSelectedStaffId(reqData.assigned_to || '')
      setEditCategory(reqData.category)
      setEditPriority(reqData.priority)
      setEditDeptId(reqData.department_id || '')
      setEditStatus(reqData.status)

      // 2. Fetch Requester Profile
      if (reqData.created_by) {
        const { data: reqProfile } = await supabase
          .from('profiles')
          .select('full_name, email, student_id, phone')
          .eq('user_id', reqData.created_by)
          .single()

        setRequester(reqProfile)
      }

      // 3. Fetch Assigned Staff Profile
      if (reqData.assigned_to) {
        const { data: staffProf } = await supabase
          .from('profiles')
          .select('full_name, email, department_id, departments(name)')
          .eq('user_id', reqData.assigned_to)
          .single()

        setAssignee(staffProf)
      } else {
        setAssignee(null)
      }

      // 4. Fetch Department
      if (reqData.department_id) {
        const { data: dept } = await supabase
          .from('departments')
          .select('name')
          .eq('id', reqData.department_id)
          .single()

        setDepartment(dept)
      }

      // 5. Fetch Attachments
      const { data: attach } = await supabase
        .from('request_attachments')
        .select('*')
        .eq('request_id', requestId)

      setAttachments(attach || [])

      // 6. Fetch Comments
      const { data: comms } = await supabase
        .from('request_comments')
        .select('id, comment, created_at, profiles(full_name, role)')
        .eq('request_id', requestId)
        .order('created_at', { ascending: true })

      setComments(comms || [])

      // 7. Fetch Activity Logs
      const { data: logs } = await supabase
        .from('activity_logs')
        .select('id, action, created_at, profiles(full_name)')
        .eq('request_id', requestId)
        .order('created_at', { ascending: false })

      setActivityLogs(logs || [])

      // 8. Fetch all staff members & departments for dropdowns
      const { data: staffList } = await supabase
        .from('profiles')
        .select('user_id, full_name, email, department_id, departments(name)')
        .eq('role', 'STAFF')

      setAllStaff(staffList || [])

      const { data: depts } = await supabase.from('departments').select('id, name')
      setAllDepartments(depts || [])

    } catch (err: any) {
      setError(err?.message || 'Failed to load request')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (requestId) {
      fetchDetails()
    }
  }, [requestId])

  // Handle Staff Assignment
  const handleAssignStaff = async () => {
    if (!selectedStaffId) return
    setIsAssigning(true)
    setAssignSuccess(null)

    const res = await assignRequestStaff(requestId, selectedStaffId)
    if (res?.error) {
      alert(`Assignment failed: ${res.error}`)
    } else {
      setAssignSuccess('Staff member assigned successfully!')
      setTimeout(() => setAssignSuccess(null), 3000)
      await fetchDetails()
    }
    setIsAssigning(false)
  }

  // Handle Parameters Save
  const handleSaveParams = async () => {
    setIsSavingParams(true)
    const res = await updateRequestByAdmin({
      requestId,
      category: editCategory,
      priority: editPriority,
      departmentId: editDeptId || null,
      status: editStatus,
    })

    if (res?.error) {
      alert(`Update failed: ${res.error}`)
    } else {
      setIsEditingParams(false)
      await fetchDetails()
    }
    setIsSavingParams(false)
  }

  // Handle Apply AI Recommendations (Phase 6 ready)
  const handleApplyAI = async () => {
    if (!request.ai_category && !request.ai_priority) return
    setIsSavingParams(true)
    const res = await updateRequestByAdmin({
      requestId,
      category: request.ai_category || undefined,
      priority: request.ai_priority || undefined,
      departmentId: request.ai_department || undefined,
    })
    if (res?.error) {
      alert(res.error)
    } else {
      await fetchDetails()
    }
    setIsSavingParams(false)
  }

  // Handle Comment Submit
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim()) return

    setIsPostingComment(true)
    const formData = new FormData()
    formData.append('requestId', requestId)
    formData.append('comment', `[Administrator Note] ${commentText.trim()}`)

    const res = await addComment(formData)
    if (!res?.error) {
      setCommentText('')
      await fetchDetails()
    }
    setIsPostingComment(false)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-16 text-center shadow-xs">
        <Loader2 className="w-8 h-8 mx-auto animate-spin text-red-600 mb-3" />
        <p className="text-sm font-medium text-gray-700">Loading Request Information...</p>
      </div>
    )
  }

  if (error || !request) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center max-w-xl mx-auto shadow-xs">
        <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
        <h2 className="text-base font-bold text-red-900">Unable to view request</h2>
        <p className="text-xs text-red-700 mt-1">{error || 'Request not found'}</p>
        <Link
          href="/admin/requests"
          className="mt-4 inline-flex items-center space-x-1.5 px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Requests</span>
        </Link>
      </div>
    )
  }

  const workflowSteps = ['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']
  const currentStepIndex = workflowSteps.indexOf(request.status)

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <Link
          href="/admin/requests"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-gray-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Request Registry</span>
        </Link>
        <span className="text-xs font-mono text-gray-400">UUID: {request.id}</span>
      </div>

      {/* Main Details Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-5">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="font-mono text-sm font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                {request.ticket_number}
              </span>
              <PriorityBadge priority={request.priority} />
              <StatusBadge status={request.status} />
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded">
                {request.category}
              </span>
              {department && (
                <span className="text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded">
                  {department.name}
                </span>
              )}
            </div>

            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              {request.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 mt-2">
              <span className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span>Submitted: {new Date(request.created_at).toLocaleString()}</span>
              </span>
              {request.assigned_at && (
                <span className="flex items-center space-x-1 text-purple-600 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Assigned: {new Date(request.assigned_at).toLocaleString()}</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsEditingParams(!isEditingParams)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              <Edit className="w-3.5 h-3.5 text-gray-500" />
              <span>{isEditingParams ? 'Cancel Edit' : 'Edit Request Parameters'}</span>
            </button>
          </div>
        </div>

        {/* Inline Parameter Editing Form */}
        {isEditingParams && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Admin Parameter Modifications
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-300 rounded-lg outline-none"
                >
                  <option value="IT Support">IT Support</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Hostel">Hostel</option>
                  <option value="Transport">Transport</option>
                  <option value="Cleaning">Cleaning</option>
                  <option value="Administration">Administration</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Priority</label>
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-300 rounded-lg outline-none"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Department</label>
                <select
                  value={editDeptId}
                  onChange={(e) => setEditDeptId(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-300 rounded-lg outline-none"
                >
                  <option value="">Unassigned</option>
                  {allDepartments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-300 rounded-lg outline-none"
                >
                  <option value="SUBMITTED">SUBMITTED</option>
                  <option value="ASSIGNED">ASSIGNED</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setIsEditingParams(false)}
                className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveParams}
                disabled={isSavingParams}
                className="inline-flex items-center space-x-1.5 px-4 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-lg shadow-2xs disabled:opacity-50"
              >
                {isSavingParams ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        )}

        {/* Visual Lifecycle Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Request Status Lifecycle
            </span>
            <span className="text-xs font-bold text-slate-800">
              {request.status.replace('_', ' ')}
            </span>
          </div>

          <div className="relative flex items-center justify-between py-2">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 z-0"></div>
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-slate-900 transition-all duration-500 z-0"
              style={{
                width: `${Math.max(0, (currentStepIndex / (workflowSteps.length - 1)) * 100)}%`,
              }}
            ></div>

            {workflowSteps.map((step, idx) => {
              const isPassed = idx < currentStepIndex
              const isCurrent = idx === currentStepIndex
              return (
                <div key={step} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      isCurrent
                        ? 'bg-slate-900 text-white ring-4 ring-slate-100 shadow-sm'
                        : isPassed
                        ? 'bg-slate-900 text-white'
                        : 'bg-white border-2 border-gray-300 text-gray-400'
                    }`}
                  >
                    {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <span
                    className={`text-[11px] mt-1.5 font-medium whitespace-nowrap ${
                      isCurrent ? 'text-slate-900 font-bold' : isPassed ? 'text-gray-700' : 'text-gray-400'
                    }`}
                  >
                    {step.replace('_', ' ')}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Staff Assignment Control Card */}
      <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2 text-purple-900 font-bold text-base">
              <UserCheck className="w-5 h-5 text-purple-700" />
              <span>Staff Delegation & Assignment</span>
            </div>
            <p className="text-xs text-purple-800 mt-0.5">
              Assign or reassign this request to a campus staff specialist. The staff member and student will be immediately notified.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              className="px-3 py-2 bg-white border border-purple-300 rounded-lg text-xs font-semibold text-gray-800 outline-none focus:ring-2 focus:ring-purple-400"
            >
              <option value="">-- Choose Staff Specialist --</option>
              {allStaff.map((s) => (
                <option key={s.user_id} value={s.user_id}>
                  {s.full_name} ({s.departments?.name || 'General'})
                </option>
              ))}
            </select>

            <button
              onClick={handleAssignStaff}
              disabled={isAssigning || !selectedStaffId || selectedStaffId === request.assigned_to}
              className="px-4 py-2 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition shadow-2xs flex items-center justify-center space-x-1.5"
            >
              {isAssigning ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Assigning...</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>{request.assigned_to ? 'Reassign Staff' : 'Assign Staff'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {assignSuccess && (
          <div className="mt-3 text-xs text-emerald-700 font-semibold flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{assignSuccess}</span>
          </div>
        )}
      </div>

      {/* AI Recommendation Card (If available) */}
      {(request.ai_category || request.ai_priority || request.ai_summary) && (
        <div className="bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2 text-blue-900 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Google Gemini AI Analysis</span>
            </div>
            <button
              onClick={handleApplyAI}
              disabled={isSavingParams}
              className="inline-flex items-center space-x-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold transition shadow-2xs"
            >
              <span>Apply AI Recommendations</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-white p-3 rounded-lg border border-blue-100">
              <span className="text-gray-400 font-medium block">Category</span>
              <span className="font-bold text-gray-800">
                {request.ai_category || 'N/A'} (Actual: {request.category})
              </span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-blue-100">
              <span className="text-gray-400 font-medium block">Priority</span>
              <span className="font-bold text-gray-800">
                {request.ai_priority || 'N/A'} (Actual: {request.priority})
              </span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-blue-100">
              <span className="text-gray-400 font-medium block">AI Department</span>
              <span className="font-bold text-gray-800">Automated Match</span>
            </div>
          </div>

          {request.ai_summary && (
            <div className="mt-3 bg-white p-3 rounded-lg border border-blue-100 text-xs text-gray-700">
              <span className="font-semibold text-gray-900 block mb-0.5">Concise AI Summary:</span>
              <p>{request.ai_summary}</p>
            </div>
          )}
        </div>
      )}

      {/* 2-Column Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Description & Attachments & Comments (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center space-x-2">
              <FileText className="w-4 h-4 text-slate-800" />
              <span>Full Issue Description</span>
            </h2>

            <div className="text-sm text-gray-800 bg-gray-50/80 p-4 rounded-lg border border-gray-100 whitespace-pre-wrap leading-relaxed">
              {request.description}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                  Location
                </span>
                <span className="text-sm font-semibold text-gray-900 mt-0.5 block flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  <span>{request.location || 'General Campus'}</span>
                </span>
              </div>

              <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                  Building & Room
                </span>
                <span className="text-sm font-semibold text-gray-900 mt-0.5 block flex items-center space-x-1">
                  <Building2 className="w-3.5 h-3.5 text-gray-400" />
                  <span>
                    {request.building || 'Not specified'}
                    {request.room_number ? ` • Room ${request.room_number}` : ''}
                  </span>
                </span>
              </div>
            </div>

            {request.resolution_note && (
              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 mt-3">
                <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider block mb-1">
                  Staff Resolution Note:
                </span>
                <p className="text-xs text-emerald-800 whitespace-pre-wrap">{request.resolution_note}</p>
                {request.resolution_attachment_url && (
                  <a
                    href={request.resolution_attachment_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1 text-xs text-blue-600 hover:underline mt-2"
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>View Resolution Photo</span>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Attachments */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center space-x-2">
              <Paperclip className="w-4 h-4 text-slate-800" />
              <span>Attachments ({attachments.length})</span>
            </h2>

            {attachments.length === 0 ? (
              <p className="text-xs text-gray-500 py-2">No attachments uploaded for this ticket.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="p-3 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      <div className="w-8 h-8 rounded bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                        <Paperclip className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-semibold text-gray-900 truncate">
                          {att.file_name}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {new Date(att.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <a
                      href={att.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 text-xs font-semibold text-blue-600 bg-white border border-gray-200 rounded group-hover:bg-blue-600 group-hover:text-white transition shrink-0 flex items-center space-x-1"
                    >
                      <span>View</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Comments */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-slate-800" />
              <span>Discussion & Notes ({comments.length})</span>
            </h2>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {comments.length === 0 ? (
                <p className="text-xs text-gray-500 py-2 text-center">No discussion logged yet.</p>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="p-4 rounded-lg bg-gray-50 border border-gray-100 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-gray-900">{c.profiles?.full_name || 'User'}</span>
                        {c.profiles?.role && (
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold uppercase ${
                            c.profiles.role === 'ADMIN'
                              ? 'bg-red-100 text-red-700'
                              : c.profiles.role === 'STAFF'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {c.profiles.role}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-gray-400">{new Date(c.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-gray-700 whitespace-pre-wrap">{c.comment}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleCommentSubmit} className="pt-3 border-t border-gray-100 space-y-2">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Post administrative directive or public update..."
                rows={3}
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isPostingComment || !commentText.trim()}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-900 hover:bg-black disabled:opacity-50 text-white font-semibold rounded-lg text-xs transition shadow-2xs"
                >
                  {isPostingComment ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Post Admin Note</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Requester, Assigned Staff & Activity Timeline (1 col) */}
        <div className="space-y-6">
          {/* Assigned Staff Info Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-purple-600" />
              <span>Assigned Staff Specialist</span>
            </h2>

            {assignee ? (
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Staff Name</span>
                  <span className="text-sm font-bold text-gray-900">{assignee.full_name}</span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Email</span>
                  <span className="text-gray-700">{assignee.email}</span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Department</span>
                  <span className="text-gray-700">{assignee.departments?.name || 'General Operations'}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <span className="text-xs text-amber-700 font-semibold bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                  Unassigned
                </span>
                <p className="text-xs text-gray-500 mt-2">Use the assignment box above to allocate this ticket.</p>
              </div>
            )}
          </div>

          {/* Requester Information */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center space-x-2">
              <User className="w-4 h-4 text-slate-800" />
              <span>Requester Information</span>
            </h2>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Full Name</span>
                <span className="text-sm font-bold text-gray-900">{requester?.full_name || 'Campus Student'}</span>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Email</span>
                <span className="text-gray-700">{requester?.email || 'N/A'}</span>
              </div>
              {requester?.student_id && (
                <div>
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Student ID</span>
                  <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-800">{requester.student_id}</span>
                </div>
              )}
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center space-x-2">
              <History className="w-4 h-4 text-slate-800" />
              <span>Audit Log & Timeline</span>
            </h2>

            <div className="space-y-4">
              {activityLogs.length === 0 ? (
                <p className="text-xs text-gray-500 py-2">No activity recorded yet.</p>
              ) : (
                activityLogs.map((log) => (
                  <div key={log.id} className="flex items-start space-x-3 text-xs">
                    <div className="w-2 h-2 rounded-full bg-slate-900 mt-1.5 shrink-0 ring-4 ring-slate-100"></div>
                    <div>
                      <p className="font-semibold text-gray-800">{log.action}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {new Date(log.created_at).toLocaleString()}
                        {log.profiles?.full_name ? ` • by ${log.profiles.full_name}` : ''}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
