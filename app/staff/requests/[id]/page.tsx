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
  PlayCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  Send,
  ExternalLink,
  ShieldAlert,
  Info,
  Wrench,
  Sparkles
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { PriorityBadge } from '@/components/ui/PriorityBadge'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ResolutionForm } from '@/components/staff/ResolutionForm'
import { startWorkOnRequest } from '@/actions/staff'
import { addComment } from '@/actions/comments'
import { GlassCard } from '@/components/ui/GlassCard'

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
        .maybeSingle()

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
        .maybeSingle()

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
          .maybeSingle()

        setRequester(reqProfile)
      }

      // 4. Fetch Department if assigned
      if (reqData.department_id) {
        const { data: deptData } = await supabase
          .from('departments')
          .select('name, description')
          .eq('id', reqData.department_id)
          .maybeSingle()

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

    try {
      const formData = new FormData()
      formData.append('requestId', requestId)
      formData.append('comment', commentText)

      const res = await addComment(formData)

      if (res?.error) {
        setCommentError(res.error)
      } else {
        setCommentText('')
        await fetchRequestDetails()
      }
    } catch (err: any) {
      setCommentError(err?.message || 'Failed to submit comment.')
    } finally {
      setIsPostingComment(false)
    }
  }

  // Loading State
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
        <p className="text-sm font-medium text-slate-400">Verifying authorization and loading ticket...</p>
      </div>
    )
  }

  // Unauthorized State
  if (unauthorized) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <GlassCard className="p-8 text-center max-w-md w-full">
          <ShieldAlert className="w-12 h-12 text-rose-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-white mb-2">Access Restricted</h2>
          <p className="text-sm text-slate-400 mb-6">
            This service request is not dispatched to your staff account. Staff can only access tickets specifically assigned to them.
          </p>
          <Link
            href="/staff/requests"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-sm transition"
          >
            Return to Assigned Requests
          </Link>
        </GlassCard>
      </div>
    )
  }

  // Not Found State
  if (notFound || !request) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <GlassCard className="p-8 text-center max-w-md w-full">
          <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-white mb-2">Request Not Found</h2>
          <p className="text-sm text-slate-400 mb-6">
            The requested service ticket could not be located in the campus database.
          </p>
          <Link
            href="/staff/requests"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-sm transition"
          >
            Back to Queue
          </Link>
        </GlassCard>
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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Navigation Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <Link
          href="/staff/requests"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-indigo-400 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Assigned Requests Queue</span>
        </Link>

        <span className="text-xs font-mono text-slate-500 bg-slate-900/60 px-3 py-1 rounded-lg border border-slate-800">
          ID: {request.id.slice(0, 8)}
        </span>
      </div>

      {/* Main Ticket Header Card */}
      <GlassCard className="p-6 sm:p-8 space-y-6" glow>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800/80 pb-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-800/50 shadow-inner">
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
        </div>

        {/* Visual Workflow Tracker */}
        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Service Request Lifecycle Tracker</span>
            </span>
            <span className="text-xs font-bold text-indigo-400 bg-indigo-950/40 px-2.5 py-0.5 rounded border border-indigo-900/50">
              Current: {request.status.replace('_', ' ')}
            </span>
          </div>

          <div className="relative flex items-center justify-between py-3 px-2 sm:px-6">
            <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-slate-800 rounded-full z-0"></div>
            <div
              className="absolute left-6 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700 rounded-full z-0"
              style={{
                width: `${Math.max(0, (currentStepIndex / (workflowSteps.length - 1)) * 100)}%`,
              }}
            ></div>

            {workflowSteps.map((step, idx) => {
              const isPassed = idx < currentStepIndex
              const isCurrent = idx === currentStepIndex
              return (
                <div key={step.key} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isCurrent
                        ? 'bg-indigo-500 text-white ring-4 ring-indigo-500/20 shadow-lg shadow-indigo-500/40 scale-110'
                        : isPassed
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-900 border-2 border-slate-700 text-slate-500'
                    }`}
                  >
                    {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <span
                    className={`text-[11px] mt-2 font-medium tracking-tight whitespace-nowrap hidden sm:block ${
                      isCurrent
                        ? 'text-indigo-400 font-bold'
                        : isPassed
                        ? 'text-slate-300'
                        : 'text-slate-500'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </GlassCard>

      {/* Staff Action & Resolution Box */}
      {statusActionError && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{statusActionError}</span>
        </div>
      )}

      {/* ACTION STATE: ASSIGNED -> IN_PROGRESS */}
      {request.status === 'ASSIGNED' && (
        <div className="bg-gradient-to-r from-indigo-950/40 to-purple-950/40 border border-indigo-500/30 rounded-2xl p-6 backdrop-blur-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-indigo-300 font-bold text-base">
              <PlayCircle className="w-5 h-5 text-indigo-400" />
              <span>Ready to Begin Technician Work</span>
            </div>
            <p className="text-xs text-slate-300 max-w-xl">
              This ticket is queued in your assigned workload. When you start hands-on troubleshooting, click below to update status to <span className="font-semibold text-white">IN PROGRESS</span>.
            </p>
          </div>

          <button
            onClick={handleStartWork}
            disabled={isStartingWork}
            className="shrink-0 inline-flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/20"
          >
            {isStartingWork ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Commencing Work...</span>
              </>
            ) : (
              <>
                <PlayCircle className="w-4 h-4" />
                <span>Commence Work (Set In Progress)</span>
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
        <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-6 backdrop-blur-md space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-base">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Ticket Resolved & Verified</span>
              </div>
              <p className="text-xs text-slate-400">
                Resolution recorded on {request.resolved_at ? new Date(request.resolved_at).toLocaleString() : 'N/A'}
              </p>
              
              <div className="mt-3 bg-slate-900/60 p-4 rounded-xl border border-emerald-500/20 text-xs">
                <span className="font-semibold text-emerald-400 uppercase tracking-wider block mb-1">
                  Resolution Technical Note:
                </span>
                <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {request.resolution_note || 'Issue resolved successfully.'}
                </p>
              </div>

              {request.resolution_attachment_url && (
                <div className="mt-3">
                  <a
                    href={request.resolution_attachment_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-slate-900/80 border border-slate-700 rounded-xl text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition"
                  >
                    <Paperclip className="w-3.5 h-3.5 text-cyan-400" />
                    <span>View Resolution Proof Image</span>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </a>
                </div>
              )}
            </div>

            <span className="shrink-0 px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-950/80 text-emerald-300 border border-emerald-700/60">
              Resolved
            </span>
          </div>
        </div>
      )}

      {/* CLOSED STATE DISPLAY */}
      {request.status === 'CLOSED' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3 text-slate-300">
            <CheckCircle2 className="w-5 h-5 text-slate-400" />
            <div>
              <h4 className="text-sm font-bold text-white">This Ticket is Closed</h4>
              <p className="text-xs text-slate-400">Closed with verified confirmation. Lifecycle concluded.</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-slate-800 text-slate-400 rounded-full text-xs font-bold">
            CLOSED
          </span>
        </div>
      )}

      {/* 2-Column Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Request Details & Attachments & Discussion (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Detailed Request Description Card */}
          <GlassCard className="p-6 space-y-4">
            <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center space-x-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Issue Description & Scope</span>
            </h2>

            <div className="text-xs text-slate-200 bg-slate-900/60 p-4 rounded-xl border border-slate-800 whitespace-pre-wrap leading-relaxed">
              {request.description}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Campus Area
                </span>
                <span className="text-xs font-semibold text-slate-200 mt-1 block flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>{request.location || 'General Campus'}</span>
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Building & Room
                </span>
                <span className="text-xs font-semibold text-slate-200 mt-1 block flex items-center space-x-1.5">
                  <Building2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>
                    {request.building || 'General'}
                    {request.room_number ? ` • Room ${request.room_number}` : ''}
                  </span>
                </span>
              </div>
            </div>
          </GlassCard>

          {/* Attachments Section */}
          <GlassCard className="p-6 space-y-4">
            <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center space-x-2">
              <Paperclip className="w-4 h-4 text-indigo-400" />
              <span>Submitted Attachments ({attachments.length})</span>
            </h2>

            {attachments.length === 0 ? (
              <p className="text-xs text-slate-500 py-2 italic">No attachments were uploaded with this service request.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="p-3 rounded-xl border border-slate-800/80 bg-slate-900/60 flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
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
                      className="px-3 py-1 text-xs font-semibold text-indigo-400 bg-slate-800 hover:bg-indigo-600 hover:text-white rounded-lg transition shrink-0 flex items-center space-x-1"
                    >
                      <span>View</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>

          {/* Comments Section */}
          <GlassCard className="p-6 space-y-4">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                <span>Comments & Discussion ({comments.length})</span>
              </h2>
            </div>

            {/* Comments List */}
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {comments.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center italic">
                  No comments yet. Use the field below to leave a note or communicate with the student.
                </p>
              ) : (
                comments.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-white">
                          {c.profiles?.full_name || 'Campus User'}
                        </span>
                        {c.profiles?.role && (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            c.profiles.role === 'STAFF' 
                              ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-800/60' 
                              : c.profiles.role === 'ADMIN'
                              ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                              : 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/60'
                          }`}>
                            {c.profiles.role}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {new Date(c.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {c.comment}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment Form */}
            <form onSubmit={handleCommentSubmit} className="pt-3 border-t border-slate-800 space-y-3">
              {commentError && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{commentError}</span>
                </div>
              )}
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a message, update, or clarification regarding this ticket..."
                rows={3}
                className="w-full px-4 py-3 text-sm bg-slate-900/70 border border-slate-800 rounded-xl text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition resize-none"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isPostingComment || !commentText.trim()}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-indigo-500/20"
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
          </GlassCard>
        </div>

        {/* Right Column: Requester Info & Activity Timeline (1 col) */}
        <div className="space-y-6">
          {/* Requester Information Card */}
          <GlassCard className="p-6 space-y-4">
            <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center space-x-2">
              <User className="w-4 h-4 text-indigo-400" />
              <span>Requester Profile</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Full Name
                </span>
                <span className="text-sm font-bold text-white mt-0.5 block">
                  {requester?.full_name || 'Student / Campus Member'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Email Address
                </span>
                <span className="text-xs font-semibold text-slate-300 mt-0.5 block truncate">
                  {requester?.email || 'Not provided'}
                </span>
              </div>

              {requester?.student_id && (
                <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Student ID
                  </span>
                  <span className="text-xs font-mono font-semibold text-cyan-400 mt-0.5 block">
                    {requester.student_id}
                  </span>
                </div>
              )}

              {requester?.phone && (
                <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Phone Contact
                  </span>
                  <span className="text-xs font-semibold text-slate-300 mt-0.5 block">
                    {requester.phone}
                  </span>
                </div>
              )}
            </div>
          </GlassCard>

          {/* Activity Timeline Card */}
          <GlassCard className="p-6 space-y-4">
            <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center space-x-2">
              <History className="w-4 h-4 text-indigo-400" />
              <span>Activity Log</span>
            </h2>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {activityLogs.length === 0 ? (
                <p className="text-xs text-slate-500 py-2 italic">No activity recorded yet.</p>
              ) : (
                activityLogs.map((log) => (
                  <div key={log.id} className="flex items-start space-x-3 text-xs bg-slate-900/40 p-3 rounded-xl border border-slate-800/60">
                    <div className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5 shrink-0 ring-4 ring-indigo-500/20"></div>
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
