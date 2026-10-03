'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  User,
  Building,
  Sparkles,
  Paperclip,
  Send,
  MessageSquare,
  AlertCircle,
  Star,
  Check,
  ShieldCheck,
  Wrench,
} from 'lucide-react'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { PriorityBadge } from '@/components/ui/PriorityBadge'
import { LoadingState } from '@/components/ui/LoadingState'
import {
  getDemoRequestById,
  getDemoComments,
  addDemoComment,
  getCurrentDemoUser,
  rateDemoRequest,
  getDemoLogs,
} from '@/lib/demo/demo-service'
import { DemoRequest, DemoComment, DemoActivityLog } from '@/lib/demo/types'

export default function StudentRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const requestId = resolvedParams.id

  const [request, setRequest] = useState<DemoRequest | null>(null)
  const [comments, setComments] = useState<DemoComment[]>([])
  const [logs, setLogs] = useState<DemoActivityLog[]>([])
  const [loading, setLoading] = useState(true)

  // Comment input
  const [newComment, setNewComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)

  // Rating input
  const [selectedRating, setSelectedRating] = useState(5)
  const [feedback, setFeedback] = useState('')
  const [ratingSubmitted, setRatingSubmitted] = useState(false)

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
      console.warn('Supabase ticket lookup notice:', err)
    }

    // 2. Demo fallback
    const r = getDemoRequestById(requestId)
    if (r) {
      setRequest(r)
      setComments(getDemoComments(r.id))
      setLogs(getDemoLogs(r.id))
      setLoading(false)
      return
    }

    setLoading(false)
  }

  useEffect(() => {
    loadTicket()

    const handleUpdate = () => loadTicket()
    window.addEventListener('demo-data-changed', handleUpdate)
    return () => window.removeEventListener('demo-data-changed', handleUpdate)
  }, [requestId])

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !request) return

    setSubmittingComment(true)
    const user = getCurrentDemoUser()
    addDemoComment(request.id, newComment.trim(), user.name, user.role)
    setNewComment('')
    setComments(getDemoComments(request.id))
    setSubmittingComment(false)
  }

  const handleRate = () => {
    if (!request) return
    const user = getCurrentDemoUser()
    rateDemoRequest(request.id, selectedRating, feedback, user.id)
    setRatingSubmitted(true)
  }

  if (loading) {
    return <LoadingState message="Loading ticket details..." />
  }

  if (!request) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center font-sans">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Ticket Not Found</h2>
          <p className="text-xs text-slate-500">
            The requested ticket identifier could not be located in current records.
          </p>
          <Link
            href="/student/requests"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to My Requests</span>
          </Link>
        </div>
      </div>
    )
  }

  const timelineSteps = [
    { key: 'SUBMITTED', label: 'Submitted', done: true },
    {
      key: 'ASSIGNED',
      label: 'Assigned',
      done: ['ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].includes(request.status),
    },
    {
      key: 'IN_PROGRESS',
      label: 'In Progress',
      done: ['IN_PROGRESS', 'RESOLVED', 'CLOSED'].includes(request.status),
    },
    {
      key: 'RESOLVED',
      label: 'Resolved',
      done: ['RESOLVED', 'CLOSED'].includes(request.status),
    },
    {
      key: 'CLOSED',
      label: 'Closed',
      done: request.status === 'CLOSED',
    },
  ]

  const isResolvedOrClosed = request.status === 'RESOLVED' || request.status === 'CLOSED'

  return (
    <div className="space-y-6 pb-16 font-sans">
      {/* Back button */}
      <div>
        <Link
          href="/student/dashboard"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Student Dashboard</span>
        </Link>
      </div>

      {/* Ticket Header Card */}
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

          <div className="text-right text-xs text-slate-400">
            <div>Submitted {new Date(request.createdAt).toLocaleDateString()}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Last updated {new Date(request.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Request details, Attachment, Resolution, Rating, Comments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Details Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
              Request Details
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
                <span className="text-[10px] font-semibold text-slate-400 uppercase block">Priority</span>
                <span className="text-xs font-bold text-slate-800">{request.priority}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-semibold text-slate-400 uppercase block">Assigned Domain</span>
                <span className="text-xs font-bold text-emerald-700">{request.department}</span>
              </div>
            </div>

            {/* Photo Attachment if present */}
            {request.imageUrl && (
              <div className="pt-3 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-700 block mb-2 flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                  <span>Photo Evidence / Attachment:</span>
                </span>
                <div className="max-w-md rounded-xl overflow-hidden border border-slate-200 shadow-2xs">
                  <img
                    src={request.imageUrl}
                    alt="Service request attachment"
                    className="w-full h-56 object-cover"
                  />
                </div>
              </div>
            )}
          </div>

          {/* AI Recommendation Summary Box */}
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

          {/* Resolution Card (when resolved) */}
          {isResolvedOrClosed && request.resolutionNote && (
            <div className="bg-white rounded-2xl border border-emerald-200 p-6 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="w-5 h-5" />
                <h2 className="text-sm font-bold text-slate-900">
                  Technician Resolution Report
                </h2>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                {request.resolutionNote}
              </p>
              {request.resolvedAt && (
                <div className="text-[11px] text-slate-400">
                  Resolved on {new Date(request.resolvedAt).toLocaleString()}
                </div>
              )}
            </div>
          )}

          {/* Rating Card (after resolution) */}
          {isResolvedOrClosed && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Rate Your Experience</h3>
                  <p className="text-xs text-slate-500">
                    How satisfied are you with the resolution of this service ticket?
                  </p>
                </div>
                {ratingSubmitted && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    ✓ Feedback Recorded
                  </span>
                )}
              </div>

              {!ratingSubmitted ? (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setSelectedRating(star)}
                        className="p-1 hover:scale-110 transition cursor-pointer"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= selectedRating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-xs font-bold text-slate-700">
                      {selectedRating} out of 5 Stars
                    </span>
                  </div>

                  <textarea
                    rows={2}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Optional feedback about the technician's timeliness or work quality..."
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />

                  <button
                    type="button"
                    onClick={handleRate}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition cursor-pointer"
                  >
                    Submit Rating
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 rounded-xl text-xs text-emerald-800">
                  Thank you! Your feedback helps our facilities operations maintain campus quality.
                </div>
              )}
            </div>
          )}

          {/* Comments Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2.5 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>Activity & Comments ({comments.length})</span>
            </h2>

            {comments.length === 0 ? (
              <p className="text-sm text-slate-400 py-3 text-center">
                No comments posted yet. Add a message below.
              </p>
            ) : (
              <div className="space-y-3">
                {comments.map((c) => (
                  <div key={c.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-sm">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        {c.authorName}
                        <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200">
                          {c.authorRole}
                        </span>
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{c.content}</p>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleSendComment} className="pt-2 flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a message or update..."
                className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                disabled={submittingComment || !newComment.trim()}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-2xs"
              >
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Request metadata, Staff Assigned, Progress Timeline */}
        <div className="space-y-6">
          {/* Metadata Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2.5">
              Ticket Information
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
                  Service Department
                </span>
                <span className="font-semibold text-slate-700 mt-0.5 block">
                  {request.department}
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

              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase block">
                  Reported Location
                </span>
                <span className="font-semibold text-slate-700 mt-0.5 block">
                  {request.location} {request.room ? `(${request.room})` : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
              Progress Timeline
            </h2>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {timelineSteps.map((step) => (
                <div key={step.key} className="relative flex items-center justify-between text-xs">
                  <div
                    className={`absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center ${
                      step.done
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white border-2 border-slate-300 text-transparent'
                    }`}
                  >
                    {step.done && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>

                  <span
                    className={`font-semibold ${
                      step.done ? 'text-slate-900' : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </span>

                  {step.done && (
                    <span className="text-[10px] text-emerald-700 font-bold">
                      Completed
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
