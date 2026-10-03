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
  Building,
  FileText,
  Paperclip,
  MessageSquare,
  History,
  PlayCircle,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Send,
  Wrench,
  Sparkles,
  Check,
  ShieldCheck,
} from 'lucide-react'
import { PriorityBadge } from '@/components/ui/PriorityBadge'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { LoadingState } from '@/components/ui/LoadingState'
import {
  getDemoRequestById,
  getDemoComments,
  addDemoComment,
  getCurrentDemoUser,
  startWorkDemoRequest,
  resolveDemoRequest,
  getDemoLogs,
} from '@/lib/demo/demo-service'
import { DemoRequest, DemoComment, DemoActivityLog } from '@/lib/demo/types'

export default function StaffRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const requestId = resolvedParams.id
  const router = useRouter()

  const [request, setRequest] = useState<DemoRequest | null>(null)
  const [comments, setComments] = useState<DemoComment[]>([])
  const [logs, setLogs] = useState<DemoActivityLog[]>([])
  const [loading, setLoading] = useState(true)

  // Status Actions
  const [isStartingWork, setIsStartingWork] = useState(false)
  const [showResolveForm, setShowResolveForm] = useState(false)
  const [resolutionNote, setResolutionNote] = useState('')
  const [isResolving, setIsResolving] = useState(false)

  // Comment state
  const [commentText, setCommentText] = useState('')
  const [isPostingComment, setIsPostingComment] = useState(false)

  const loadTicket = async () => {
    // 1. Try fetching live from Supabase first
    try {
      const { createClient } = await import('@/utils/supabase/client')
      const supabase = createClient()
      const { data: dbReq } = await supabase
        .from('service_requests')
        .select('*')
        .or(`id.eq.${requestId},ticket_number.eq.${requestId}`)
        .maybeSingle()

      if (dbReq) {
        let studentName = 'Student Submitter'
        let studentRoll = ''
        if (dbReq.created_by) {
          const { data: creatorProfile } = await supabase
            .from('profiles')
            .select('full_name, roll_number, student_id')
            .eq('user_id', dbReq.created_by)
            .maybeSingle()
          if (creatorProfile) {
            studentName = creatorProfile.full_name || 'Student Submitter'
            studentRoll = creatorProfile.roll_number || creatorProfile.student_id || ''
          }
        }

        const mapped: DemoRequest = {
          id: dbReq.id,
          ticketNumber: dbReq.ticket_number,
          title: dbReq.title,
          description: dbReq.description,
          category: dbReq.category as any,
          priority: dbReq.priority as any,
          status: dbReq.status || 'SUBMITTED',
          location: dbReq.location || '',
          building: dbReq.building || 'Campus',
          room: dbReq.room_number || '',
          studentId: dbReq.created_by,
          studentName: studentRoll ? `${studentName} (${studentRoll})` : studentName,
          department: dbReq.category || 'General',
          createdAt: dbReq.created_at,
          updatedAt: dbReq.updated_at,
          resolutionNote: dbReq.resolution_note || undefined,
          resolutionImageUrl: dbReq.resolution_attachment_url || undefined,
        }
        setRequest(mapped)
        setComments(getDemoComments(mapped.id))
        setLogs(getDemoLogs(mapped.id))
        setLoading(false)
        return
      }
    } catch (err) {
      console.warn('Staff Supabase ticket lookup notice:', err)
    }

    // 2. Demo fallback
    const r = getDemoRequestById(requestId)
    if (r) {
      setRequest(r)
      setComments(getDemoComments(r.id))
      setLogs(getDemoLogs(r.id))
    }
    setLoading(false)
  }

  useEffect(() => {
    loadTicket()

    const handleUpdate = () => loadTicket()
    window.addEventListener('demo-data-changed', handleUpdate)
    return () => window.removeEventListener('demo-data-changed', handleUpdate)
  }, [requestId])

  const handleStartWork = () => {
    if (!request) return
    setIsStartingWork(true)
    const user = getCurrentDemoUser()
    startWorkDemoRequest(request.id, user.name)
    setIsStartingWork(false)
    loadTicket()
  }

  const handleConfirmResolve = (e: React.FormEvent) => {
    e.preventDefault()
    if (!request || !resolutionNote.trim()) return

    setIsResolving(true)
    const user = getCurrentDemoUser()
    resolveDemoRequest(request.id, resolutionNote.trim(), user.name)
    setIsResolving(false)
    setShowResolveForm(false)
    loadTicket()
  }

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!request || !commentText.trim()) return

    setIsPostingComment(true)
    const user = getCurrentDemoUser()
    addDemoComment(request.id, commentText.trim(), user.name, user.role)
    setCommentText('')
    setComments(getDemoComments(request.id))
    setIsPostingComment(false)
  }

  if (loading) {
    return <LoadingState message="Loading ticket details..." />
  }

  if (!request) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center font-sans">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Ticket Not Found</h2>
          <p className="text-xs text-slate-500">
            The requested repair ticket could not be found.
          </p>
          <Link
            href="/staff/dashboard"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Operations Queue</span>
          </Link>
        </div>
      </div>
    )
  }

  const isAssigned = request.status === 'ASSIGNED'
  const isInProgress = request.status === 'IN_PROGRESS'
  const isResolved = request.status === 'RESOLVED' || request.status === 'CLOSED'

  return (
    <div className="space-y-6 pb-16 font-sans">
      {/* Top Breadcrumb */}
      <div>
        <Link
          href="/staff/dashboard"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Operations Queue</span>
        </Link>
      </div>

      {/* Ticket Header Card with Quick Actions */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                {request.ticketNumber}
              </span>
              <StatusBadge status={request.status} />
              <PriorityBadge priority={request.priority} />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {request.title}
            </h1>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{request.location}</span>
              {request.room && <span>• Room {request.room}</span>}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isAssigned && (
              <button
                type="button"
                onClick={handleStartWork}
                disabled={isStartingWork}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
              >
                {isStartingWork ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <PlayCircle className="w-4 h-4" />
                )}
                <span>Start Work</span>
              </button>
            )}

            {isInProgress && (
              <button
                type="button"
                onClick={() => setShowResolveForm(true)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Resolve Request</span>
              </button>
            )}

            {isResolved && (
              <span className="px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Ticket Resolved</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* RESOLUTION INLINE DRAWER */}
      {showResolveForm && (
        <div className="bg-emerald-50/50 rounded-2xl border border-emerald-200 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-200/60 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Complete and Resolve Ticket
              </h2>
              <p className="text-xs text-slate-500">
                Document actions taken to permanently remedy the student's issue
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowResolveForm(false)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleConfirmResolve} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Resolution Notes <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                required
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                placeholder="E.g., Inspected router firmware, replaced damaged patch cable, and ran throughput tests confirming full restoration."
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowResolveForm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 bg-white border border-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isResolving || !resolutionNote.trim()}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-2xs transition disabled:opacity-50"
              >
                {isResolving ? 'Submitting...' : 'Confirm Resolution'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          {/* Issue Details Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
              Issue Report & Symptoms
            </h2>

            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">
                Description
              </span>
              <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                {request.description}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-semibold text-slate-400 uppercase block">Category</span>
                <span className="text-xs font-bold text-slate-800">{request.category}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-semibold text-slate-400 uppercase block">Priority SLA</span>
                <span className="text-xs font-bold text-slate-800">{request.priority}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-semibold text-slate-400 uppercase block">Student</span>
                <span className="text-xs font-bold text-slate-800">{request.studentName}</span>
              </div>
            </div>

            {/* Photo Attachment if present */}
            {request.imageUrl && (
              <div className="pt-3 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-700 block mb-2 flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                  <span>Student Uploaded Photo:</span>
                </span>
                <div className="max-w-md rounded-xl overflow-hidden border border-slate-200 shadow-2xs">
                  <img
                    src={request.imageUrl}
                    alt="Problem attachment"
                    className="w-full h-56 object-cover"
                  />
                </div>
              </div>
            )}
          </div>

          {/* AI Recommendation Card */}
          {request.aiRecommendation && (
            <div className="bg-emerald-50/50 rounded-2xl border border-emerald-200 p-5 space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-emerald-900">
                  AI Triage & Routing Analysis
                </span>
              </div>
              <p className="text-xs text-slate-700">
                {request.aiRecommendation.summary}
              </p>
              <p className="text-[11px] text-slate-500 italic">
                Reasoning: {request.aiRecommendation.reasoning}
              </p>
            </div>
          )}

          {/* Resolution Note if resolved */}
          {isResolved && request.resolutionNote && (
            <div className="bg-white rounded-2xl border border-emerald-200 p-6 shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="w-5 h-5" />
                <h2 className="text-sm font-bold text-slate-900">
                  Recorded Resolution Note
                </h2>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                {request.resolutionNote}
              </p>
              {request.resolvedAt && (
                <span className="text-[11px] text-slate-400 block mt-1">
                  Resolved on {new Date(request.resolvedAt).toLocaleString()}
                </span>
              )}
            </div>
          )}

          {/* Comments & Work Notes Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
              <span>Work Notes & Communications ({comments.length})</span>
            </h2>

            {comments.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">
                No technician notes recorded yet. Add an update below.
              </p>
            ) : (
              <div className="space-y-3">
                {comments.map((c) => (
                  <div key={c.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        {c.authorName}
                        <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded bg-white text-slate-600 border border-slate-200">
                          {c.authorRole}
                        </span>
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-700 mt-1 whitespace-pre-wrap">{c.content}</p>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handlePostComment} className="pt-2 flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Log work progress, parts required, or student update..."
                className="flex-1 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                disabled={isPostingComment || !commentText.trim()}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post Note</span>
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          {/* Metadata Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
              Assignment & Location
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase block">
                  Assigned Technician
                </span>
                <span className="font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                  <Wrench className="w-3.5 h-3.5 text-emerald-600" />
                  {request.assignedStaffName || 'Pending Assignment'}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase block">
                  Work Domain
                </span>
                <span className="font-semibold text-slate-700 mt-0.5 block">
                  {request.department}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase block">
                  Building & Room
                </span>
                <span className="font-semibold text-slate-700 mt-0.5 block">
                  {request.building} {request.room ? `• Room ${request.room}` : ''}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase block">
                  Student Submitter
                </span>
                <span className="font-semibold text-slate-700 mt-0.5 block">
                  {request.studentName}
                </span>
              </div>
            </div>
          </div>

          {/* Activity Log */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-slate-400" />
              <span>Activity History</span>
            </h2>

            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="text-xs border-l-2 border-emerald-500 pl-3 py-1">
                  <div className="font-semibold text-slate-800">{log.action}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {log.userName} • {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
