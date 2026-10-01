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
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Send,
  UserCheck,
  ShieldCheck,
  Sparkles,
  Check,
  Wrench,
  ChevronDown,
} from 'lucide-react'
import { PriorityBadge } from '@/components/ui/PriorityBadge'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { LoadingState } from '@/components/ui/LoadingState'
import {
  getDemoRequestById,
  getDemoComments,
  addDemoComment,
  getCurrentDemoUser,
  assignDemoRequest,
  getDemoLogs,
  getAllDemoUsers,
} from '@/lib/demo/demo-service'
import { DemoRequest, DemoComment, DemoActivityLog, DemoUser } from '@/lib/demo/types'

export default function AdminRequestDetailPage({
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
  const [allStaff, setAllStaff] = useState<DemoUser[]>([])
  const [loading, setLoading] = useState(true)

  // Assignment state
  const [selectedStaffId, setSelectedStaffId] = useState<string>('')
  const [isAssigning, setIsAssigning] = useState(false)
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null)

  // Comment state
  const [commentText, setCommentText] = useState('')
  const [isPostingComment, setIsPostingComment] = useState(false)

  const loadTicket = () => {
    const r = getDemoRequestById(requestId)
    if (r) {
      setRequest(r)
      setComments(getDemoComments(r.id))
      setLogs(getDemoLogs(r.id))
    }
    const staff = getAllDemoUsers().filter((u) => u.role === 'STAFF')
    setAllStaff(staff)
    setLoading(false)
  }

  useEffect(() => {
    loadTicket()

    const handleUpdate = () => loadTicket()
    window.addEventListener('demo-data-changed', handleUpdate)
    return () => window.removeEventListener('demo-data-changed', handleUpdate)
  }, [requestId])

  const handleAssign = (staffIdOrName: string) => {
    if (!request) return
    setIsAssigning(true)
    assignDemoRequest(request.id, staffIdOrName)
    setAssignSuccess(`Ticket assigned to ${staffIdOrName} successfully.`)
    setTimeout(() => setAssignSuccess(null), 3000)
    setIsAssigning(false)
    loadTicket()
  }

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!request || !commentText.trim()) return

    setIsPostingComment(true)
    const user = getCurrentDemoUser()
    addDemoComment(request.id, commentText.trim(), 'Admin Office', 'ADMIN')
    setCommentText('')
    setComments(getDemoComments(request.id))
    setIsPostingComment(false)
  }

  if (loading) {
    return <LoadingState message="Loading ticket control view..." />
  }

  if (!request) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center font-sans">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Ticket Not Found</h2>
          <p className="text-xs text-slate-500">The requested ticket does not exist.</p>
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Command Center</span>
          </Link>
        </div>
      </div>
    )
  }

  const suggestedStaff =
    request.aiRecommendation?.suggestedStaff ||
    (request.category === 'IT Support'
      ? 'Vikram Rao'
      : request.category === 'Electrical'
      ? 'Suresh Kumar'
      : 'Anjali Devi')

  return (
    <div className="space-y-6 pb-16 font-sans">
      {/* Top Breadcrumb */}
      <div>
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Command Center</span>
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
              Status: <strong className="text-slate-700">{request.status}</strong>
            </div>
          </div>
        </div>
      </div>

      {assignSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800 animate-in fade-in-50">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{assignSuccess}</span>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI RECOMMENDATION & ASSIGNMENT DISPATCH BOX */}
          <div className="bg-emerald-50/50 rounded-2xl border border-emerald-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <h2 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                  AI Triage & Recommended Specialist Dispatch
                </h2>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase">
                Advisory Routing
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-3 bg-white rounded-xl border border-emerald-100">
                <span className="text-[10px] font-semibold text-slate-400 uppercase block">Category</span>
                <span className="font-bold text-slate-800">{request.category}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-emerald-100">
                <span className="text-[10px] font-semibold text-slate-400 uppercase block">Priority</span>
                <PriorityBadge priority={request.priority} />
              </div>
              <div className="p-3 bg-white rounded-xl border border-emerald-100">
                <span className="text-[10px] font-semibold text-slate-400 uppercase block">Department</span>
                <span className="font-bold text-slate-800">{request.department}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-emerald-100">
                <span className="text-[10px] font-semibold text-slate-400 uppercase block">Suggested Staff</span>
                <span className="font-bold text-emerald-700">{suggestedStaff}</span>
              </div>
            </div>

            {request.aiRecommendation && (
              <div className="text-xs space-y-1 bg-white p-3.5 rounded-xl border border-emerald-100">
                <p className="text-slate-700">
                  <strong className="text-slate-900">Summary: </strong>
                  {request.aiRecommendation.summary}
                </p>
                <p className="text-slate-500 text-[11px]">
                  <strong className="text-slate-700">Reasoning: </strong>
                  {request.aiRecommendation.reasoning}
                </p>
              </div>
            )}

            {/* Quick 1-Click Assignment Action */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-emerald-100">
              <div className="text-xs text-slate-600">
                Current Assigned Staff:{' '}
                <strong className="text-slate-900">
                  {request.assignedStaffName || 'None (Pending)'}
                </strong>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAssign(suggestedStaff)}
                  disabled={isAssigning || request.assignedStaffName === suggestedStaff}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-2xs transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Assign to {suggestedStaff}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Details Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
              Reported Issue Description
            </h2>

            <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
              {request.description}
            </p>

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

          {/* Resolution Report (if present) */}
          {request.resolutionNote && (
            <div className="bg-white rounded-2xl border border-emerald-200 p-6 shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="w-5 h-5" />
                <h2 className="text-sm font-bold text-slate-900">
                  Technician Resolution Report
                </h2>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                {request.resolutionNote}
              </p>
            </div>
          )}

          {/* Comments & Communication */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
              <span>Administrative Communication Logs ({comments.length})</span>
            </h2>

            {comments.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">
                No comments on record for this ticket.
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
                placeholder="Post administrative directive or note..."
                className="flex-1 px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                disabled={isPostingComment || !commentText.trim()}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit</span>
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          {/* Manual Staff Assignment Override */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
              Manual Assignment Control
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reassign to Any Specialist:
                </label>
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Choose Staff Specialist...</option>
                  {allStaff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.department})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => selectedStaffId && handleAssign(selectedStaffId)}
                disabled={!selectedStaffId || isAssigning}
                className="w-full py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 hover:bg-slate-50 transition disabled:opacity-50 cursor-pointer"
              >
                Confirm Specialist Reassignment
              </button>
            </div>
          </div>

          {/* Ticket Information */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
              Facility Information
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase block">
                  Reporting Student
                </span>
                <span className="font-bold text-slate-800 mt-0.5 block">
                  {request.studentName}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase block">
                  Building & Location
                </span>
                <span className="font-semibold text-slate-700 mt-0.5 block">
                  {request.building} {request.room ? `• Room ${request.room}` : ''}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase block">
                  Service Category
                </span>
                <span className="font-semibold text-slate-700 mt-0.5 block">
                  {request.category}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase block">
                  Assigned Domain
                </span>
                <span className="font-semibold text-slate-700 mt-0.5 block">
                  {request.department}
                </span>
              </div>
            </div>
          </div>

          {/* Activity Logs */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-slate-400" />
              <span>Full Audit Trail</span>
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
