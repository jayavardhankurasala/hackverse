'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
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
  PlayCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  Send,
  ExternalLink,
  ShieldAlert,
  Info
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { PriorityBadge } from '@/components/ui/PriorityBadge'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ResolutionForm } from '@/components/staff/ResolutionForm'
import { startWorkOnRequest } from '@/actions/staff'
import { addComment } from '@/actions/comments'

export default function StaffRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const requestId = resolvedParams.id
  const router = useRouter()

  const [request, setRequest] = useState<any>(null)
  const [requester, setRequester] = useState<any>(null)
  const [department, setDepartment] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [attachments, setAttachments] = useState<any[]>([])
  const [activityLogs, setActivityLogs] = useState<any[]>([])
  
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [unauthorized, setUnauthorized] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [generalError, setGeneralError] = useState<string | null>(null)

  // Status update states
  const [isStartingWork, setIsStartingWork] = useState(false)
  const [statusActionError, setStatusActionError] = useState<string | null>(null)

  // Comment state
  const [commentText, setCommentText] = useState('')
  const [isPostingComment, setIsPostingComment] = useState(false)
  const [commentError, setCommentError] = useState<string | null>(null)

  const fetchRequestDetails = async () => {
    try {
      const supabase = createClient()

      // 1. Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        setUnauthorized(true)
        setLoading(false)
        return
      }
      setCurrentUser(user)

      // 2. Fetch service request
      const { data: reqData, error: reqError } = await supabase
        .from('service_requests')
        .select('*')
        .eq('id', requestId)
        .single()

      if (reqError || !reqData) {
        setNotFound(true)
        setLoading(false)
        return
      }

      // Check if current user is the assigned staff (or admin)
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single()

      if (reqData.assigned_to !== user.id && profile?.role !== 'ADMIN') {
        setUnauthorized(true)
        setLoading(false)
        return
      }

      setRequest(reqData)

      // 3. Fetch Requester Profile
      if (reqData.created_by) {
        const { data: reqProfile } = await supabase
          .from('profiles')
          .select('full_name, email, student_id, phone')
          .eq('user_id', reqData.created_by)
          .single()

        setRequester(reqProfile)
      }

      // 4. Fetch Department if assigned
      if (reqData.department_id) {
        const { data: deptData } = await supabase
          .from('departments')
          .select('name, description')
          .eq('id', reqData.department_id)
          .single()

        setDepartment(deptData)
      }

      // 5. Fetch Attachments
      const { data: attachData } = await supabase
        .from('request_attachments')
        .select('*')
        .eq('request_id', requestId)
        .order('created_at', { ascending: true })

      setAttachments(attachData || [])

      // 6. Fetch Comments with Profile details
      const { data: commData } = await supabase
        .from('request_comments')
        .select(`
          id,
          request_id,
          user_id,
          comment,
          created_at,
          profiles ( full_name, role )
        `)
        .eq('request_id', requestId)
        .order('created_at', { ascending: true })

      setComments(commData || [])

      // 7. Fetch Activity Logs
      const { data: logData } = await supabase
        .from('activity_logs')
        .select(`
          id,
          action,
          old_value,
          new_value,
          created_at,
          user_id,
          profiles ( full_name )
        `)
        .eq('request_id', requestId)
        .order('created_at', { ascending: false })

      setActivityLogs(logData || [])

    } catch (err: any) {
      setGeneralError(err?.message || 'Failed to load request details.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (requestId) {
      fetchRequestDetails()
    }
  }, [requestId])

  // Handle Start Work (ASSIGNED -> IN_PROGRESS)
  const handleStartWork = async () => {
    setIsStartingWork(true)
    setStatusActionError(null)

    const res = await startWorkOnRequest(requestId)
    if (res?.error) {
      setStatusActionError(res.error)
      setIsStartingWork(false)
    } else {
      await fetchRequestDetails()
      setIsStartingWork(false)
    }
  }

  // Handle Comment Submission
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim()) return

    setIsPostingComment(true)
    setCommentError(null)

    const formData = new FormData()
    formData.append('requestId', requestId)
    formData.append('comment', commentText)

    const res = await addComment(formData)

    if (res?.error) {
      setCommentError(res.error)
      setIsPostingComment(false)
    } else {
      setCommentText('')
      await fetchRequestDetails()
      setIsPostingComment(false)
    }
  }

  // Loading State
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-16 text-center shadow-xs">
        <Loader2 className="w-9 h-9 mx-auto animate-spin text-blue-600 mb-3" />
        <h3 className="text-base font-semibold text-gray-900">Loading Request Details</h3>
        <p className="text-xs text-gray-500 mt-1">Verifying permissions and fetching ticket data...</p>
      </div>
    )
  }

  // Unauthorized State
  if (unauthorized) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center max-w-2xl mx-auto shadow-xs">
        <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-amber-900">Access Restricted</h2>
        <p className="text-sm text-amber-800 mt-2">
          This service request is not assigned to your staff account. For campus security and data privacy, staff members can only access tickets specifically delegated to them.
        </p>
        <div className="mt-5">
          <Link
            href="/staff/requests"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-800 text-white rounded-lg text-xs font-semibold hover:bg-amber-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Assigned Requests</span>
          </Link>
        </div>
      </div>
    )
  }

  // Not Found State
  if (notFound || !request) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-12 text-center max-w-lg mx-auto shadow-xs">
        <AlertTriangle className="w-10 h-10 text-gray-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-gray-900">Request Not Found</h2>
        <p className="text-xs text-gray-500 mt-1">
          The requested service ticket could not be found or may have been deleted.
        </p>
        <Link
          href="/staff/requests"
          className="mt-5 inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Requests</span>
        </Link>
      </div>
    )
  }

  // Status Workflow Steps
  const workflowSteps = [
    { key: 'SUBMITTED', label: 'Submitted' },
    { key: 'ASSIGNED', label: 'Assigned' },
    { key: 'IN_PROGRESS', label: 'In Progress' },
    { key: 'RESOLVED', label: 'Resolved' },
    { key: 'CLOSED', label: 'Closed' },
  ]
  const currentStepIndex = workflowSteps.findIndex((s) => s.key === request.status)

  return (
    <div className="space-y-6">
      {/* Top Navigation Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <Link
          href="/staff/requests"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-gray-600 hover:text-blue-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Assigned Requests</span>
        </Link>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono text-gray-400">ID: {request.id}</span>
        </div>
      </div>

      {/* Main Ticket Header Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-5 mb-6">
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

            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
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
        </div>

        {/* Visual Workflow Tracker */}
        <div className="mb-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Service Request Lifecycle
            </span>
            <span className="text-xs font-medium text-blue-600">
              Current: {request.status.replace('_', ' ')}
            </span>
          </div>

          <div className="relative flex items-center justify-between py-2">
            {/* Progress line */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 z-0"></div>
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-600 transition-all duration-500 z-0"
              style={{
                width: `${Math.max(0, (currentStepIndex / (workflowSteps.length - 1)) * 100)}%`,
              }}
            ></div>

            {/* Steps */}
            {workflowSteps.map((step, idx) => {
              const isPassed = idx < currentStepIndex
              const isCurrent = idx === currentStepIndex
              return (
                <div key={step.key} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isCurrent
                        ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-sm'
                        : isPassed
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border-2 border-gray-300 text-gray-400'
                    }`}
                  >
                    {isPassed ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <span
                    className={`text-[11px] mt-1.5 font-medium tracking-tight whitespace-nowrap ${
                      isCurrent
                        ? 'text-blue-700 font-bold'
                        : isPassed
                        ? 'text-gray-700'
                        : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Staff Action & Resolution Box */}
      {statusActionError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{statusActionError}</span>
        </div>
      )}

      {/* ACTION STATE: ASSIGNED -> IN_PROGRESS */}
      {request.status === 'ASSIGNED' && (
        <div className="bg-purple-50/80 border border-purple-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2 text-purple-900 font-bold text-base">
              <PlayCircle className="w-5 h-5 text-purple-700" />
              <span>Ready to Begin Service</span>
            </div>
            <p className="text-xs text-purple-800 mt-1 max-w-xl">
              This ticket is queued in your assigned workload. When you start working on the issue, click below to update the status to <span className="font-semibold">IN PROGRESS</span>. The student will be notified.
            </p>
          </div>

          <button
            onClick={handleStartWork}
            disabled={isStartingWork}
            className="shrink-0 inline-flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg text-sm transition-colors shadow-xs"
          >
            {isStartingWork ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Updating Status...</span>
              </>
            ) : (
              <>
                <PlayCircle className="w-4 h-4" />
                <span>Start Work on Ticket</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* ACTION STATE: IN_PROGRESS -> RESOLUTION FORM */}
      {request.status === 'IN_PROGRESS' && (
        <ResolutionForm
          requestId={request.id}
          ticketNumber={request.ticket_number}
          onSuccess={fetchRequestDetails}
        />
      )}

      {/* RESOLVED STATE DISPLAY */}
      {request.status === 'RESOLVED' && (
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-5 sm:p-6 shadow-xs">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-emerald-900 font-bold text-base">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Ticket Resolved</span>
              </div>
              <p className="text-xs text-gray-500">
                Resolved on {request.resolved_at ? new Date(request.resolved_at).toLocaleString() : 'N/A'}
              </p>
              
              <div className="mt-3 bg-white p-4 rounded-lg border border-emerald-200">
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-1">
                  Resolution Note:
                </span>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">
                  {request.resolution_note || 'Issue resolved successfully.'}
                </p>
              </div>

              {request.resolution_attachment_url && (
                <div className="mt-3">
                  <span className="text-xs font-semibold text-gray-600 block mb-1.5">
                    Resolution Photo / Documentation:
                  </span>
                  <a
                    href={request.resolution_attachment_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-gray-50 transition"
                  >
                    <Paperclip className="w-3.5 h-3.5 text-gray-400" />
                    <span>View Resolution Photo</span>
                    <ExternalLink className="w-3 h-3 text-gray-400" />
                  </a>
                </div>
              )}
            </div>

            <span className="shrink-0 px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
              Resolved
            </span>
          </div>
        </div>
      )}

      {/* CLOSED STATE DISPLAY */}
      {request.status === 'CLOSED' && (
        <div className="bg-gray-100 border border-gray-300 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div className="flex items-center space-x-3 text-gray-700">
            <CheckCircle2 className="w-5 h-5 text-gray-500" />
            <div>
              <h4 className="text-sm font-bold">This Ticket is Closed</h4>
              <p className="text-xs text-gray-500">Closed by administrator or student confirmation. No further changes can be made.</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-bold">
            CLOSED
          </span>
        </div>
      )}

      {/* 2-Column Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Request Details & Attachments (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Detailed Request Description Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center space-x-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Issue Description & Details</span>
            </h2>

            <div className="text-sm text-gray-800 bg-gray-50/80 p-4 rounded-lg border border-gray-100 whitespace-pre-wrap leading-relaxed">
              {request.description}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                  Location / Area
                </span>
                <span className="text-sm font-semibold text-gray-900 mt-0.5 block flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span>{request.location || 'General Campus'}</span>
                </span>
              </div>

              <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                  Building & Room
                </span>
                <span className="text-sm font-semibold text-gray-900 mt-0.5 block flex items-center space-x-1">
                  <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span>
                    {request.building || 'Not specified'}
                    {request.room_number ? ` • Room ${request.room_number}` : ''}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Attachments Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center space-x-2">
              <Paperclip className="w-4 h-4 text-blue-600" />
              <span>Submitted Attachments ({attachments.length})</span>
            </h2>

            {attachments.length === 0 ? (
              <p className="text-xs text-gray-500 py-2">No attachments were uploaded with this service request.</p>
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

          {/* Comments Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-4">
            <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900 flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span>Comments & Discussion ({comments.length})</span>
              </h2>
            </div>

            {/* Comments List */}
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {comments.length === 0 ? (
                <p className="text-xs text-gray-500 py-3 text-center">
                  No comments yet. Use the field below to leave a note or communicate with the student.
                </p>
              ) : (
                comments.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-lg bg-gray-50 border border-gray-100 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-gray-900">
                          {c.profiles?.full_name || 'Campus User'}
                        </span>
                        {c.profiles?.role && (
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold uppercase ${
                            c.profiles.role === 'STAFF' 
                              ? 'bg-purple-100 text-purple-700' 
                              : c.profiles.role === 'ADMIN'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {c.profiles.role}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-gray-400">
                        {new Date(c.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {c.comment}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment Form */}
            <form onSubmit={handleCommentSubmit} className="pt-3 border-t border-gray-100 space-y-2">
              {commentError && (
                <div className="p-2 rounded bg-red-50 text-red-600 text-xs flex items-center space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{commentError}</span>
                </div>
              )}
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a message, update, or clarification regarding this ticket..."
                rows={3}
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isPostingComment || !commentText.trim()}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg text-xs transition shadow-2xs"
                >
                  {isPostingComment ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Posting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Post Comment</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Requester Info & Activity Timeline (1 col) */}
        <div className="space-y-6">
          {/* Requester Information Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center space-x-2">
              <User className="w-4 h-4 text-blue-600" />
              <span>Requester Information</span>
            </h2>

            <div className="space-y-3">
              <div>
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                  Full Name
                </span>
                <span className="text-sm font-bold text-gray-900">
                  {requester?.full_name || 'Student / Campus Member'}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                  Email Address
                </span>
                <span className="text-xs font-medium text-gray-700">
                  {requester?.email || 'Not provided'}
                </span>
              </div>

              {requester?.student_id && (
                <div>
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                    Student ID
                  </span>
                  <span className="text-xs font-mono font-medium text-gray-800 bg-gray-100 px-2 py-0.5 rounded">
                    {requester.student_id}
                  </span>
                </div>
              )}

              {requester?.phone && (
                <div>
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                    Phone Contact
                  </span>
                  <span className="text-xs font-medium text-gray-700">
                    {requester.phone}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Activity Timeline Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center space-x-2">
              <History className="w-4 h-4 text-blue-600" />
              <span>Activity Timeline</span>
            </h2>

            <div className="space-y-4">
              {activityLogs.length === 0 ? (
                <p className="text-xs text-gray-500 py-2">No activity recorded yet.</p>
              ) : (
                activityLogs.map((log) => (
                  <div key={log.id} className="flex items-start space-x-3 text-xs">
                    <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0 ring-4 ring-blue-50"></div>
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
