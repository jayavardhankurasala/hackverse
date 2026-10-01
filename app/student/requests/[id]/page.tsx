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
  Sparkles,
  ShieldCheck,
  AlertCircle
} from 'lucide-react'
import { addComment } from '@/actions/comments'
import { PriorityBadge } from '@/components/ui/PriorityBadge'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { RatingCard } from '@/components/student/RatingCard'
import { GlassCard } from '@/components/ui/GlassCard'
import { motion } from 'framer-motion'

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
    try {
      const supabase = createClient()
      const { data: reqData } = await supabase
        .from('service_requests')
        .select('*, departments(name)')
        .eq('id', requestId)
        .maybeSingle()

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
    } catch (err) {
      console.error('Error fetching request data:', err)
    } finally {
      setLoading(false)
    }
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

    try {
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
    } catch (err: any) {
      setError(err?.message || 'Failed to submit comment')
    } finally {
      setCommenting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
        <p className="text-sm font-medium text-slate-400">Loading Request Details...</p>
      </div>
    )
  }

  if (!request) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <GlassCard className="p-8 text-center max-w-md w-full">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-3 opacity-90" />
          <h2 className="text-lg font-bold text-white mb-2">Request Not Found</h2>
          <p className="text-sm text-slate-400 mb-6">
            The requested service ticket does not exist or you do not have permission to view it.
          </p>
          <Link
            href="/student/dashboard"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-cyan-500/20"
          >
            Return to Dashboard
          </Link>
        </GlassCard>
      </div>
    )
  }

  const statusFlow = ['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']
  const currentIndex = statusFlow.indexOf(request.status)

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/student/requests"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Requests</span>
        </Link>
        <span className="text-xs font-mono text-slate-500 bg-slate-900/60 px-3 py-1 rounded-lg border border-slate-800">
          ID: {request.id.slice(0, 8)}
        </span>
      </div>

      {/* Main Details Card */}
      <GlassCard className="p-6 sm:p-8 space-y-8" glow>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800/80 pb-6">
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
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {request.title}
            </h1>
            <p className="text-xs text-slate-400 flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Created on {new Date(request.created_at).toLocaleString()}</span>
            </p>
          </div>
        </div>

        {/* Status Lifecycle Tracker */}
        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Lifecycle Milestone Progression</span>
            </span>
            <span className="text-xs font-bold text-cyan-400 bg-cyan-950/40 px-2.5 py-0.5 rounded border border-cyan-900/50">
              Current: {request.status.replace('_', ' ')}
            </span>
          </div>

          <div className="relative flex items-center justify-between py-3 px-2 sm:px-6">
            <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-slate-800 rounded-full z-0"></div>
            <div
              className="absolute left-6 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-700 rounded-full z-0"
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
                      isCurrent
                        ? 'text-cyan-400 font-bold'
                        : isPassed
                        ? 'text-slate-300'
                        : 'text-slate-500'
                    }`}
                  >
                    {s.replace('_', ' ')}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Resolution Banner */}
        {request.status === 'RESOLVED' && (
          <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-3 backdrop-blur-md">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Service Request Marked as Resolved by Campus Operations</span>
            </div>
            {request.resolution_note && (
              <div className="bg-slate-950/60 p-4 rounded-xl border border-emerald-500/20 text-xs text-slate-200">
                <span className="font-semibold text-emerald-400 block mb-1">Resolution Summary:</span>
                <p className="leading-relaxed text-slate-300">{request.resolution_note}</p>
              </div>
            )}
            {request.resolution_attachment_url && (
              <a
                href={request.resolution_attachment_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-2 text-xs text-cyan-400 hover:text-cyan-300 hover:underline pt-1"
              >
                <Paperclip className="w-3.5 h-3.5" />
                <span>View Attached Resolution Verification Image</span>
              </a>
            )}
          </div>
        )}

        {/* Rating Submission Card (if Resolved/Closed) */}
        {(request.status === 'RESOLVED' || request.status === 'CLOSED') && (
          <RatingCard
            requestId={requestId}
            existingRating={existingRating}
            onRatingSubmitted={fetchData}
          />
        )}

        {/* Issue Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="space-y-4">
            <h3 className="font-bold text-white text-sm border-b border-slate-800 pb-2.5 flex items-center space-x-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Ticket Specifications</span>
            </h3>
            
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block font-medium mb-1.5">Problem Description</span>
                <div className="text-slate-200 bg-slate-900/60 p-4 rounded-xl border border-slate-800 whitespace-pre-wrap leading-relaxed">
                  {request.description}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="bg-slate-900/50 p-3.5 rounded-xl border border-slate-800/80">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Campus Area</span>
                  <span className="font-semibold text-slate-200 mt-1 flex items-center space-x-1.5 text-xs">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{request.location || 'Main Campus'}</span>
                  </span>
                </div>

                <div className="bg-slate-900/50 p-3.5 rounded-xl border border-slate-800/80">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Building & Unit</span>
                  <span className="font-semibold text-slate-200 mt-1 flex items-center space-x-1.5 text-xs">
                    <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="truncate">{request.building || 'General'}{request.room_number ? ` • Room ${request.room_number}` : ''}</span>
                  </span>
                </div>
              </div>

              {attachments.length > 0 && (
                <div className="pt-2">
                  <span className="text-slate-400 block font-medium mb-2">Attached Documentation</span>
                  <div className="flex flex-wrap gap-2">
                    {attachments.map((att) => (
                      <a
                        key={att.id}
                        href={att.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-2 px-3.5 py-2 bg-slate-900/60 hover:bg-slate-800/80 border border-slate-700/60 rounded-xl text-cyan-400 hover:text-cyan-300 transition text-xs"
                      >
                        <Paperclip className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[200px]">{att.file_name}</span>
                        <ExternalLink className="w-3 h-3 text-slate-500" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Activity Logs Timeline */}
          <div className="space-y-4">
            <h3 className="font-bold text-white text-sm border-b border-slate-800 pb-2.5 flex items-center space-x-2">
              <History className="w-4 h-4 text-indigo-400" />
              <span>Activity & Status Log</span>
            </h3>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {activityLogs.length === 0 ? (
                <p className="text-xs text-slate-500 italic p-3">No activity recorded yet.</p>
              ) : (
                activityLogs.map((log, idx) => (
                  <div key={idx} className="flex items-start space-x-3 text-xs bg-slate-900/30 p-3 rounded-xl border border-slate-800/50">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 mt-1.5 shrink-0 ring-4 ring-cyan-500/20"></div>
                    <div>
                      <p className="font-semibold text-slate-200">{log.action}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{new Date(log.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Discussion / Comments Section */}
      <GlassCard className="p-6 sm:p-8 space-y-6">
        <h2 className="text-base font-bold text-white border-b border-slate-800 pb-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4 text-cyan-400" />
            <span>Discussion Thread</span>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300">
            {comments.length} {comments.length === 1 ? 'Message' : 'Messages'}
          </span>
        </h2>

        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {comments.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
              <p className="text-xs text-slate-400">No comments posted yet. Send a note to the operations team below.</p>
            </div>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="p-4 bg-slate-900/60 rounded-xl border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-white">{c.profiles?.full_name || 'Campus Member'}</span>
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
                  <span className="text-[10px] text-slate-500">{new Date(c.created_at).toLocaleString()}</span>
                </div>
                <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">{c.comment}</p>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleCommentSubmit} className="pt-4 border-t border-slate-800 space-y-3">
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add additional details or communicate with assigned campus staff..."
            rows={3}
            className="w-full px-4 py-3 text-sm bg-slate-900/70 border border-slate-800 rounded-xl text-white placeholder-slate-500 outline-none focus:border-cyan-500/80 focus:ring-2 focus:ring-cyan-500/20 transition resize-none"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={commenting || !commentText.trim()}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-cyan-500/20"
            >
              {commenting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>Post Comment</span>
            </button>
          </div>
        </form>
      </GlassCard>
    </div>
  )
}
