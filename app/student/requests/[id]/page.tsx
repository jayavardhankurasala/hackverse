'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  FileText, 
  Paperclip, 
  MessageSquare, 
  History, 
  Loader2,
  ExternalLink,
  Building2,
  Send,
  Sparkles
} from 'lucide-react'
import { addComment } from '@/actions/comments'
import { PriorityBadge } from '@/components/ui/PriorityBadge'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { RatingCard } from '@/components/student/RatingCard'

export default function StudentRequestDetailPage() {
  const params = useParams()
  const requestId = params.id as string

  const [request, setRequest] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [attachments, setAttachments] = useState<any[]>([])
  const [activityLogs, setActivityLogs] = useState<any[]>([])
  const [existingRating, setExistingRating] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState('')
  const [commenting, setCommenting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    const supabase = createClient()
    const { data: reqData } = await supabase
      .from('service_requests')
      .select('*, departments(name)')
      .eq('id', requestId)
      .single()

    if (reqData) {
      setRequest(reqData)
    }

    // Attachments
    const { data: attachData } = await supabase
      .from('request_attachments')
      .select('*')
      .eq('request_id', requestId)

    if (attachData) setAttachments(attachData)

    // Activity logs
    const { data: logsData } = await supabase
      .from('activity_logs')
      .select('action, created_at')
      .eq('request_id', requestId)
      .order('created_at', { ascending: false })

    if (logsData) setActivityLogs(logsData)

    // Comments
    const { data: commentsData } = await supabase
      .from('request_comments')
      .select('*, profiles(full_name, role)')
      .eq('request_id', requestId)
      .order('created_at', { ascending: true })

    if (commentsData) {
      setComments(commentsData)
    }

    // Rating
    const { data: ratingData } = await supabase
      .from('ratings')
      .select('*')
      .eq('request_id', requestId)
      .maybeSingle()

    if (ratingData) {
      setExistingRating(ratingData)
    }

    setLoading(false)
  }

  useEffect(() => {
    if (requestId) {
      fetchData()

      // Realtime subscription for status updates and comments
      const supabase = createClient()
      const channel = supabase
        .channel(`student-request-${requestId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'service_requests',
            filter: `id=eq.${requestId}`,
          },
          () => {
            fetchData()
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'request_comments',
            filter: `request_id=eq.${requestId}`,
          },
          () => {
            fetchData()
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [requestId])

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim()) return

    setCommenting(true)
    setError(null)

    const formData = new FormData()
    formData.append('requestId', requestId)
    formData.append('comment', commentText.trim())

    const result = await addComment(formData)

    if (result?.error) {
      setError(result.error)
    } else {
      setCommentText('')
      await fetchData()
    }
    setCommenting(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 mx-auto animate-spin text-blue-600 mb-2" />
          <p className="text-sm font-semibold text-gray-700">Loading Request Details...</p>
        </div>
      </div>
    )
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl border border-gray-200 text-center max-w-md shadow-xs">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Request Not Found</h2>
          <p className="text-xs text-gray-500 mb-4">The requested service ticket does not exist or access is restricted.</p>
          <Link href="/student/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold">
            Return to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const statusFlow = ['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']
  const currentIndex = statusFlow.indexOf(request.status)

  return (
    <div className="space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/student/requests"
            className="inline-flex items-center space-x-2 text-xs font-semibold text-gray-600 hover:text-blue-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My Requests</span>
          </Link>
          <span className="text-xs font-mono text-gray-400">Ticket: {request.ticket_number}</span>
        </div>

        {/* Main Details Card */}
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-100 pb-5">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  {request.ticket_number}
                </span>
                <PriorityBadge priority={request.priority} />
                <StatusBadge status={request.status} />
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                  {request.category}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                {request.title}
              </h1>
              <p className="text-xs text-gray-400 mt-1">
                Submitted on {new Date(request.created_at).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Status Tracker */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Status Lifecycle
              </span>
              <span className="text-xs font-bold text-blue-600">
                {request.status.replace('_', ' ')}
              </span>
            </div>

            <div className="relative flex items-center justify-between py-2">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 z-0"></div>
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-600 transition-all duration-500 z-0"
                style={{
                  width: `${Math.max(0, (currentIndex / (statusFlow.length - 1)) * 100)}%`,
                }}
              ></div>

              {statusFlow.map((s, idx) => {
                const isPassed = idx < currentIndex
                const isCurrent = idx === currentIndex
                return (
                  <div key={s} className="relative z-10 flex flex-col items-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        isCurrent
                          ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-sm'
                          : isPassed
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border-2 border-gray-300 text-gray-400'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                    <span
                      className={`text-[11px] mt-1.5 font-medium whitespace-nowrap ${
                        isCurrent ? 'text-blue-700 font-bold' : isPassed ? 'text-gray-700' : 'text-gray-400'
                      }`}
                    >
                      {s.replace('_', ' ')}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Resolution Notification & Staff Note */}
          {request.status === 'RESOLVED' && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
              <div className="flex items-center space-x-2 text-emerald-900 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Your Service Request Has Been Resolved!</span>
              </div>
              {request.resolution_note && (
                <div className="bg-white p-3 rounded-lg border border-emerald-100 text-xs text-gray-800">
                  <span className="font-semibold text-gray-900 block mb-0.5">Staff Resolution Note:</span>
                  <p>{request.resolution_note}</p>
                </div>
              )}
              {request.resolution_attachment_url && (
                <a
                  href={request.resolution_attachment_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1.5 text-xs text-blue-600 hover:underline pt-1"
                >
                  <Paperclip className="w-3.5 h-3.5" />
                  <span>View Resolution Proof Image</span>
                </a>
              )}
            </div>
          )}

          {/* Student Rating Form (Visible when Resolved or Closed) */}
          {(request.status === 'RESOLVED' || request.status === 'CLOSED') && (
            <RatingCard
              requestId={requestId}
              existingRating={existingRating}
              onRatingSubmitted={fetchData}
            />
          )}

          {/* Issue Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-3">
              <h3 className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-2">
                Request Information
              </h3>
              <div className="text-xs space-y-2">
                <div>
                  <span className="text-gray-400 block font-medium">Description</span>
                  <p className="text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-100 whitespace-pre-wrap leading-relaxed mt-1">
                    {request.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Location</span>
                    <span className="font-semibold text-gray-800 mt-0.5 block flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span>{request.location || 'Campus'}</span>
                    </span>
                  </div>

                  <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Building & Room</span>
                    <span className="font-semibold text-gray-800 mt-0.5 block flex items-center space-x-1">
                      <Building2 className="w-3.5 h-3.5 text-gray-400" />
                      <span>{request.building || 'General'} {request.room_number ? `• Rm ${request.room_number}` : ''}</span>
                    </span>
                  </div>
                </div>

                {attachments.length > 0 && (
                  <div className="pt-2">
                    <span className="text-gray-400 block font-medium mb-1.5">Submitted Attachment</span>
                    {attachments.map((att) => (
                      <a
                        key={att.id}
                        href={att.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-blue-600 transition"
                      >
                        <Paperclip className="w-3.5 h-3.5" />
                        <span className="truncate max-w-xs">{att.file_name}</span>
                        <ExternalLink className="w-3 h-3 text-gray-400" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Activity History */}
            <div className="space-y-3">
              <h3 className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-2 flex items-center space-x-1.5">
                <History className="w-4 h-4 text-blue-600" />
                <span>Ticket Progress Timeline</span>
              </h3>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {activityLogs.length === 0 ? (
                  <p className="text-xs text-gray-400">No activity recorded yet.</p>
                ) : (
                  activityLogs.map((log, idx) => (
                    <div key={idx} className="flex items-start space-x-3 text-xs">
                      <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0 ring-2 ring-blue-100"></div>
                      <div>
                        <p className="font-semibold text-gray-800">{log.action}</p>
                        <p className="text-[10px] text-gray-400">{new Date(log.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Discussion / Comments Card */}
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6 sm:p-8 space-y-4">
          <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center space-x-2">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <span>Discussion & Comments ({comments.length})</span>
          </h2>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {comments.length === 0 ? (
              <p className="text-xs text-gray-500 py-3 text-center">No comments posted yet.</p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="p-3.5 bg-gray-50 rounded-lg border border-gray-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-gray-900">{c.profiles?.full_name || 'Campus Member'}</span>
                      {c.profiles?.role && (
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold uppercase ${
                          c.profiles.role === 'STAFF' ? 'bg-purple-100 text-purple-700' : c.profiles.role === 'ADMIN' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {c.profiles.role}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400">{new Date(c.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed">{c.comment}</p>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleCommentSubmit} className="pt-3 border-t border-gray-100 space-y-2">
            {error && <div className="text-red-600 text-xs">{error}</div>}
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Ask a question or provide additional details to the assigned staff..."
              rows={3}
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={commenting || !commentText.trim()}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition shadow-2xs"
              >
                {commenting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Post Comment</span>
              </button>
            </div>
          </form>
        </div>
      </div>
  )
}
