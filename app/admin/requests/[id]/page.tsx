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
import { GlassCard } from '@/components/ui/GlassCard'

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
        .maybeSingle()

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
        .maybeSingle()

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
          .maybeSingle()

        setRequester(reqProfile)
      }

      // 3. Fetch Assigned Staff Profile
      if (reqData.assigned_to) {
        const { data: staffProf } = await supabase
          .from('profiles')
          .select('full_name, email, department_id, departments(name)')
          .eq('user_id', reqData.assigned_to)
          .maybeSingle()

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
          .maybeSingle()

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

    try {
      const res = await assignRequestStaff(requestId, selectedStaffId)
      if (res?.error) {
        alert(`Assignment failed: ${res.error}`)
      } else {
        setAssignSuccess('Staff member assigned successfully!')
        setTimeout(() => setAssignSuccess(null), 3000)
        await fetchDetails()
      }
    } catch (err: any) {
      alert(err?.message || 'Assignment failed')
    } finally {
      setIsAssigning(false)
    }
  }

  // Handle Parameters Save
  const handleSaveParams = async () => {
    setIsSavingParams(true)
    try {
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
    } catch (err: any) {
      alert(err?.message || 'Update failed')
    } finally {
      setIsSavingParams(false)
    }
  }

  // Handle Apply AI Recommendations
  const handleApplyAI = async () => {
    if (!request.ai_category && !request.ai_priority) return
    setIsSavingParams(true)
    try {
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
    } catch (err: any) {
      alert(err?.message || 'Failed to apply AI suggestion')
    } finally {
      setIsSavingParams(false)
    }
  }

  // Handle Comment Submit
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim()) return

    setIsPostingComment(true)
    try {
      const formData = new FormData()
      formData.append('requestId', requestId)
      formData.append('comment', `[Administrator Note] ${commentText.trim()}`)

      const res = await addComment(formData)
      if (!res?.error) {
        setCommentText('')
        await fetchDetails()
      }
    } catch (err: any) {
      console.error(err)
    } finally {
      setIsPostingComment(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
        <p className="text-sm font-medium text-slate-400">Loading Request Information...</p>
      </div>
    )
  }

  if (error || !request) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <GlassCard className="p-8 text-center max-w-md w-full">
          <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-white mb-2">Unable to view request</h2>
          <p className="text-sm text-slate-400 mb-6">{error || 'Request not found'}</p>
          <Link
            href="/admin/requests"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition"
          >
            Return to Requests
          </Link>
        </GlassCard>
      </div>
    )
  }

  const workflowSteps = ['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']
  const currentStepIndex = workflowSteps.indexOf(request.status)

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <Link
          href="/admin/requests"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Request Registry</span>
        </Link>
        <span className="text-xs font-mono text-slate-500 bg-slate-900/60 px-3 py-1 rounded-lg border border-slate-800">
          ID: {request.id.slice(0, 8)}
        </span>
      </div>

      {/* Main Details Card */}
      <GlassCard className="p-6 sm:p-8 space-y-6" glow>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-lg border border-cyan-800/50 shadow-inner">
                {request.ticket_number || 'SR-0000'}
              </span>
              <PriorityBadge priority={request.priority} />
              <StatusBadge status={request.status} />
              <span className="text-xs font-medium text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/50">
                {request.category}
              </span>
              {department && (
                <span className="text-xs font-medium text-indigo-300 bg-indigo-950/60 border border-indigo-800/50 px-2.5 py-1 rounded-lg">
                  {department.name}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {request.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 pt-1">
              <span className="flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Submitted: {new Date(request.created_at).toLocaleString()}</span>
              </span>
              {request.assigned_at && (
                <span className="flex items-center space-x-1.5 text-indigo-400 font-semibold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Assigned: {new Date(request.assigned_at).toLocaleString()}</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsEditingParams(!isEditingParams)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-700/80 bg-slate-900/80 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition"
            >
              <Edit className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isEditingParams ? 'Cancel Edit' : 'Edit Parameters'}</span>
            </button>
          </div>
        </div>

        {/* Inline Parameter Editing Form */}
        {isEditingParams && (
          <div className="bg-slate-900/80 border border-slate-700/80 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Administrator Parameter Override</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-cyan-500"
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
                <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-cyan-500"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
                <select
                  value={editDeptId}
                  onChange={(e) => setEditDeptId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-cyan-500"
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
                <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-cyan-500"
                >
                  <option value="SUBMITTED">SUBMITTED</option>
                  <option value="ASSIGNED">ASSIGNED</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setIsEditingParams(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveParams}
                disabled={isSavingParams}
                className="inline-flex items-center space-x-1.5 px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl transition shadow-lg shadow-cyan-500/20 disabled:opacity-50"
              >
                {isSavingParams ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        )}

        {/* Visual Lifecycle Progress Bar */}
        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Lifecycle Milestone Progression</span>
            </span>
            <span className="text-xs font-bold text-cyan-400 bg-cyan-950/40 px-2.5 py-0.5 rounded border border-cyan-900/50">
              {request.status.replace('_', ' ')}
            </span>
          </div>

          <div className="relative flex items-center justify-between py-3 px-2 sm:px-6">
            <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-slate-800 rounded-full z-0"></div>
            <div
              className="absolute left-6 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-700 rounded-full z-0"
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
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isCurrent
                        ? 'bg-cyan-500 text-slate-950 ring-4 ring-cyan-500/20 shadow-lg shadow-cyan-500/40 scale-110'
                        : isPassed
                        ? 'bg-cyan-600 text-white'
                        : 'bg-slate-900 border-2 border-slate-700 text-slate-500'
                    }`}
                  >
                    {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <span
                    className={`text-[11px] mt-2 font-medium tracking-tight whitespace-nowrap hidden sm:block ${
                      isCurrent ? 'text-cyan-400 font-bold' : isPassed ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    {step.replace('_', ' ')}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </GlassCard>

      {/* Staff Assignment Control Card */}
      <GlassCard className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-indigo-300 font-bold text-base">
              <UserCheck className="w-5 h-5 text-indigo-400" />
              <span>Staff Delegation & Workload Allocation</span>
            </div>
            <p className="text-xs text-slate-400">
              Assign or reassign this request to a campus staff specialist. The staff member and student will be immediately notified.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
            <select
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              className="px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-semibold text-white outline-none focus:border-indigo-500"
            >
              <option value="">-- Choose Staff Specialist --</option>
              {allStaff.map((s) => (
                <option key={s.user_id} value={s.user_id}>
                  {s.full_name} ({s.departments?.name || 'General Operations'})
                </option>
              ))}
            </select>

            <button
              onClick={handleAssignStaff}
              disabled={isAssigning || !selectedStaffId || selectedStaffId === request.assigned_to}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-500/20 flex items-center justify-center space-x-2"
            >
              {isAssigning ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Delegating...</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>{request.assigned_to ? 'Reassign Specialist' : 'Assign Specialist'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {assignSuccess && (
          <div className="mt-3 text-xs text-emerald-400 font-semibold flex items-center space-x-1.5 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{assignSuccess}</span>
          </div>
        )}
      </GlassCard>

      {/* AI Recommendation Card (If available) */}
      {(request.ai_category || request.ai_priority || request.ai_summary) && (
        <GlassCard className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-cyan-400 font-bold text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Google Gemini AI Analysis</span>
            </div>
            <button
              onClick={handleApplyAI}
              disabled={isSavingParams}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-bold transition shadow-lg shadow-cyan-500/20"
            >
              <span>Apply AI Recommendations</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
              <span className="text-slate-500 font-medium block">Category</span>
              <span className="font-bold text-white mt-1 block">
                {request.ai_category || 'N/A'} <span className="text-slate-500 font-normal">(User: {request.category})</span>
              </span>
            </div>
            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
              <span className="text-slate-500 font-medium block">Priority</span>
              <span className="font-bold text-white mt-1 block">
                {request.ai_priority || 'N/A'} <span className="text-slate-500 font-normal">(User: {request.priority})</span>
              </span>
            </div>
            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
              <span className="text-slate-500 font-medium block">Department Match</span>
              <span className="font-bold text-white mt-1 block">Automated Dispatch</span>
            </div>
          </div>

          {request.ai_summary && (
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-xs text-slate-300">
              <span className="font-semibold text-cyan-400 block mb-1">AI Diagnostic Summary:</span>
              <p className="leading-relaxed">{request.ai_summary}</p>
            </div>
          )}
        </GlassCard>
      )}

      {/* 2-Column Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Description & Attachments & Comments (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <GlassCard className="p-6 space-y-4">
            <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center space-x-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Full Issue Description</span>
            </h2>

            <div className="text-xs text-slate-200 bg-slate-900/60 p-4 rounded-xl border border-slate-800 whitespace-pre-wrap leading-relaxed">
              {request.description}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Location
                </span>
                <span className="text-xs font-semibold text-slate-200 mt-1 block flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{request.location || 'General Campus'}</span>
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Building & Room
                </span>
                <span className="text-xs font-semibold text-slate-200 mt-1 block flex items-center space-x-1.5">
                  <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>
                    {request.building || 'Not specified'}
                    {request.room_number ? ` • Room ${request.room_number}` : ''}
                  </span>
                </span>
              </div>
            </div>

            {request.resolution_note && (
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 mt-3 space-y-2">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                  Staff Resolution Note:
                </span>
                <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">{request.resolution_note}</p>
                {request.resolution_attachment_url && (
                  <a
                    href={request.resolution_attachment_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1.5 text-xs text-cyan-400 hover:underline pt-1"
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>View Resolution Photo</span>
                  </a>
                )}
              </div>
            )}
          </GlassCard>

          {/* Attachments */}
          <GlassCard className="p-6 space-y-4">
            <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center space-x-2">
              <Paperclip className="w-4 h-4 text-cyan-400" />
              <span>Attachments ({attachments.length})</span>
            </h2>

            {attachments.length === 0 ? (
              <p className="text-xs text-slate-500 py-2 italic">No attachments uploaded for this ticket.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="p-3 rounded-xl border border-slate-800/80 bg-slate-900/60 flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                        <Paperclip className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-semibold text-slate-200 truncate">
                          {att.file_name}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {new Date(att.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <a
                      href={att.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1 text-xs font-semibold text-cyan-400 bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 rounded-lg transition shrink-0 flex items-center space-x-1"
                    >
                      <span>View</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>

          {/* Comments */}
          <GlassCard className="p-6 space-y-4">
            <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              <span>Discussion & Notes ({comments.length})</span>
            </h2>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {comments.length === 0 ? (
                <p className="text-xs text-slate-500 py-2 text-center italic">No discussion logged yet.</p>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-white">{c.profiles?.full_name || 'User'}</span>
                        {c.profiles?.role && (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            c.profiles.role === 'ADMIN'
                              ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                              : c.profiles.role === 'STAFF'
                              ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-800/60'
                              : 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/60'
                          }`}>
                            {c.profiles.role}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500">{new Date(c.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">{c.comment}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleCommentSubmit} className="pt-3 border-t border-slate-800 space-y-3">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Post administrative directive or public update..."
                rows={3}
                className="w-full px-4 py-3 text-sm bg-slate-900/70 border border-slate-800 rounded-xl text-white placeholder-slate-500 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition resize-none"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isPostingComment || !commentText.trim()}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-cyan-500/20"
                >
                  {isPostingComment ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Post Admin Note</span>
                </button>
              </div>
            </form>
          </GlassCard>
        </div>

        {/* Right Column: Requester, Assigned Staff & Activity Timeline (1 col) */}
        <div className="space-y-6">
          {/* Assigned Staff Info Card */}
          <GlassCard className="p-6 space-y-3">
            <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-indigo-400" />
              <span>Assigned Staff Specialist</span>
            </h2>

            {assignee ? (
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Staff Name</span>
                  <span className="text-sm font-bold text-white">{assignee.full_name}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Email</span>
                  <span className="text-slate-300">{assignee.email}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Department</span>
                  <span className="text-slate-300">{assignee.departments?.name || 'General Operations'}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <span className="text-xs text-amber-400 font-semibold bg-amber-950/40 border border-amber-500/30 px-3 py-1 rounded-full">
                  Unassigned
                </span>
                <p className="text-xs text-slate-400 mt-2">Use the delegation box above to route this ticket.</p>
              </div>
            )}
          </GlassCard>

          {/* Requester Information */}
          <GlassCard className="p-6 space-y-3">
            <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center space-x-2">
              <User className="w-4 h-4 text-cyan-400" />
              <span>Requester Information</span>
            </h2>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Full Name</span>
                <span className="text-sm font-bold text-white">{requester?.full_name || 'Campus Student'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Email</span>
                <span className="text-slate-300">{requester?.email || 'N/A'}</span>
              </div>
              {requester?.student_id && (
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Student ID</span>
                  <span className="font-mono bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-cyan-400">{requester.student_id}</span>
                </div>
              )}
            </div>
          </GlassCard>

          {/* Activity Timeline */}
          <GlassCard className="p-6 space-y-4">
            <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center space-x-2">
              <History className="w-4 h-4 text-cyan-400" />
              <span>Audit Log & Timeline</span>
            </h2>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {activityLogs.length === 0 ? (
                <p className="text-xs text-slate-500 py-2 italic">No activity recorded yet.</p>
              ) : (
                activityLogs.map((log) => (
                  <div key={log.id} className="flex items-start space-x-3 text-xs bg-slate-900/40 p-3 rounded-xl border border-slate-800/60">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 mt-1.5 shrink-0 ring-4 ring-cyan-500/20"></div>
                    <div>
                      <p className="font-semibold text-slate-200">{log.action}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {new Date(log.created_at).toLocaleString()}
                        {log.profiles?.full_name ? ` • by ${log.profiles.full_name}` : ''}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
