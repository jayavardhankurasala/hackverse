'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Sparkles,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Upload,
  Info,
  Check,
  X,
  FileText,
  MapPin,
  Building,
  Bus,
  CheckCircle2,
  Eye,
  ArrowRight,
  Shield,
  User,
  Wrench,
} from 'lucide-react'
import { requestAIAnalysis } from '@/actions/ai'
import { createServiceRequest } from '@/actions/requests'
import { AIRecommendation } from '@/lib/ai/gemini'
import { PriorityBadge } from '@/components/ui/PriorityBadge'
import { getCurrentDemoUser, createDemoRequest } from '@/lib/demo/demo-service'
import { ServiceCategory, RequestPriority } from '@/lib/demo/types'

const requestSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(8, 'Description must be at least 8 characters'),
  category: z.string().min(1, 'Category is required'),
  priority: z.string().min(1, 'Priority is required'),
  building: z.string().min(1, 'Building is required'),
  room: z.string().optional(),
  location: z.string().min(1, 'Location detail is required'),
})

type RequestFormValues = z.infer<typeof requestSchema>

const CATEGORIES: ServiceCategory[] = [
  'IT Support',
  'Electrical',
  'Plumbing',
  'Maintenance',
  'Hostel',
  'Cleaning',
  'Transport',
  'Administration',
]

const PRIORITIES: RequestPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

const DOMAIN_STAFF_MAP: Record<string, string> = {
  'IT Support': 'Vikram Rao (IT)',
  Electrical: 'Suresh Kumar (Electrical)',
  Plumbing: 'Ramesh Naidu (Plumbing)',
  Maintenance: 'K. Prasad (Maintenance)',
  Hostel: 'Anjali Devi (Hostel Warden)',
  Transport: 'M. Venkat (Transport Incharge)',
  Cleaning: 'Lakshmi Bai (Sanitation)',
  Administration: 'G. Satyanarayana (Admin Office)',
}

export default function NewRequestPage() {
  const router = useRouter()
  const currentUser = getCurrentDemoUser()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Attachment State
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)

  // AI State
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false)
  const [aiResult, setAiResult] = useState<AIRecommendation | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)
  const [aiApplied, setAiApplied] = useState(false)

  // Success State
  const [createdTicket, setCreatedTicket] = useState<{ id: string; ticketNumber: string } | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'IT Support',
      priority: 'HIGH',
      building: 'Hostel Block A',
      room: 'A-204',
      location: 'Hostel Block A, 2nd Floor',
    },
  })

  const currentTitle = watch('title') || ''
  const currentDescription = watch('description') || ''
  const currentLocation = watch('location') || ''
  const currentCategory = watch('category') as ServiceCategory
  const currentPriority = watch('priority') as RequestPriority
  const currentBuilding = watch('building') || ''
  const currentRoom = watch('room') || ''

  const isBusOrTransport =
    currentBuilding.toLowerCase().includes('bus') ||
    currentBuilding.toLowerCase().includes('transport') ||
    currentCategory === 'Transport'

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null)
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setFileError('File size exceeds 5MB limit. Please upload a smaller image.')
      return
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setFileError('Unsupported file format. Please upload JPEG, PNG, or WebP images.')
      return
    }

    setSelectedFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setFilePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const removeFile = () => {
    setSelectedFile(null)
    setFilePreview(null)
    setFileError(null)
  }

  // Pre-fill demo scenario: Wi-Fi issue
  const handleLoadDemoPreset = () => {
    setValue('title', 'Wi-Fi not working in Hostel Block A')
    setValue(
      'description',
      'The Wi-Fi connection in my room keeps disconnecting. The issue started yesterday and several students on the same floor are experiencing the same problem.'
    )
    setValue('building', 'Hostel Block A')
    setValue('room', 'A-204')
    setValue('location', 'Hostel Block A, Room A-204')
    setFilePreview('https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80')
  }

  // Analyze with AI
  const handleAIAnalysis = async () => {
    if (currentTitle.trim().length < 3) {
      setAiError('Please enter an issue title before analyzing with AI.')
      return
    }

    if (currentDescription.trim().length < 5) {
      setAiError('Please provide a brief description before analyzing with AI.')
      return
    }

    setIsAnalyzingAI(true)
    setAiError(null)
    setAiResult(null)
    setAiApplied(false)

    try {
      const res = await requestAIAnalysis({
        title: currentTitle,
        description: currentDescription,
        location: `${currentBuilding} ${currentRoom} ${currentLocation}`,
        currentCategory,
        currentPriority,
      })

      if (res.success && res.data) {
        setAiResult(res.data)
        // Automatically override inaccurate user selections instantly before submission
        setValue('category', res.data.category, { shouldValidate: true })
        setValue('priority', res.data.priority, { shouldValidate: true })
        setAiApplied(true)
      } else {
        setAiError(res.error || 'AI analysis temporarily unavailable. You can proceed manually.')
      }
    } catch {
      setAiError('AI analysis temporarily unavailable. You can proceed manually.')
    } finally {
      setIsAnalyzingAI(false)
    }
  }

  // Apply AI recommendations to form (advisory, editable)
  const handleApplyAI = () => {
    if (!aiResult) return
    setValue('category', aiResult.category, { shouldValidate: true })
    setValue('priority', aiResult.priority, { shouldValidate: true })
    setAiApplied(true)
  }

  const onSubmit = async (data: RequestFormValues) => {
    setLoading(true)
    setError(null)

    try {
      // If AI analysis hasn't been run yet, do an automated triage pass to catch safety overrides
      let finalAi = aiResult
      if (!finalAi && (data.title || data.description)) {
        try {
          const autoRes = await requestAIAnalysis({
            title: data.title,
            description: data.description,
            location: `${data.building} ${data.room} ${data.location}`,
            currentCategory: data.category,
            currentPriority: data.priority,
          })
          if (autoRes.success && autoRes.data) {
            finalAi = autoRes.data
            if (autoRes.data.isSafetyOverride || autoRes.data.priority === 'CRITICAL') {
              data.category = autoRes.data.category
              data.priority = autoRes.data.priority
            }
          }
        } catch {}
      }

      const { createClient } = await import('@/utils/supabase/client')
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user

      if (user) {
        const formData = new FormData()
        formData.append('title', data.title)
        formData.append('description', data.description)
        formData.append('category', data.category)
        formData.append('priority', data.priority)
        formData.append('location', data.location)
        formData.append('building', data.building)
        formData.append('roomNumber', data.room || '')
        if (selectedFile) {
          formData.append('image', selectedFile)
        }
        if (finalAi) {
          formData.append('aiCategory', finalAi.category)
          formData.append('aiPriority', finalAi.priority)
          formData.append('aiSummary', finalAi.summary)
        }

        try {
          const res = await createServiceRequest(formData)
          if ((res as any)?.error) {
            setError((res as any).error)
            setLoading(false)
            return
          }
        } catch (redirectError: any) {
          // Next.js redirect throws NEXT_REDIRECT which is expected when successful
          if (redirectError?.digest?.startsWith('NEXT_REDIRECT')) {
            throw redirectError
          }
        }
      }

      // Fallback or demo user mode
      const created = createDemoRequest({
        title: data.title,
        description: data.description,
        category: data.category as ServiceCategory,
        priority: data.priority as RequestPriority,
        location: data.location,
        building: data.building,
        room: data.room,
        imageUrl: filePreview || undefined,
        studentId: currentUser?.id || 'student-1',
        studentName: currentUser?.name || 'Student Submitter',
        aiRecommendation: aiResult
          ? {
              category: aiResult.category as ServiceCategory,
              priority: aiResult.priority as RequestPriority,
              department: aiResult.department,
              suggestedStaff: 'Domain Technician',
              summary: aiResult.summary,
              reasoning: aiResult.reasoning,
            }
          : undefined,
      })

      setCreatedTicket({
        id: created.id,
        ticketNumber: created.ticketNumber,
      })
    } catch (e: any) {
      if (e?.digest?.startsWith('NEXT_REDIRECT')) throw e
      setError(e?.message || 'Failed to submit service request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Success Confirmation Screen
  if (createdTicket) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 font-sans">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-lg space-y-6 animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Request Submitted Successfully
            </h1>
            <div className="mt-2.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-sm font-mono font-bold text-emerald-800">
              <span>Ticket ID:</span>
              <span className="text-emerald-700">{createdTicket.ticketNumber}</span>
            </div>
            <p className="text-sm text-slate-600 mt-3 max-w-md mx-auto leading-relaxed">
              Your service request has been logged and routed to the central campus facilities queue. Technicians will be assigned based on severity SLA.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={`/student/requests/${createdTicket.id}`}
              className="px-6 py-3 rounded-xl font-semibold text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-2xs transition flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" />
              <span>Track Ticket Status</span>
            </Link>
            <Link
              href="/student/dashboard"
              className="px-6 py-3 rounded-xl font-semibold text-sm text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition flex items-center justify-center gap-2"
            >
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16 font-sans">
      {/* Navigation Breadcrumb & Preset Button */}
      <div className="flex items-center justify-between">
        <Link
          href="/student/dashboard"
          className="inline-flex items-center space-x-2 text-sm font-semibold text-slate-600 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Student Dashboard</span>
        </Link>

        <button
          type="button"
          onClick={handleLoadDemoPreset}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-sm font-semibold hover:bg-emerald-100 transition shadow-2xs cursor-pointer"
          title="Autofill the Wi-Fi Issue Demo Scenario"
        >
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>Load Demo Scenario (Wi-Fi Issue)</span>
        </button>
      </div>

      {/* Main Container Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-slate-100 bg-linear-to-r from-emerald-50/40 via-white to-slate-50/40">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 mb-2.5">
            <span>New Service Request</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Create Service Request
          </h1>
          <p className="text-sm text-slate-600 mt-1.5">
            Tell us what needs attention and we'll route it to the right team.
          </p>
        </div>

        {error && (
          <div className="mx-6 sm:mx-8 mt-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 sm:p-8 space-y-8">
          {/* SECTION 1: REQUEST DETAILS */}
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                1. Request Details
              </h2>
              <span className="text-xs font-medium text-slate-400">Step 1 of 3</span>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                Problem Title <span className="text-rose-500">*</span>
              </label>
              <input
                {...register('title')}
                type="text"
                placeholder="e.g. Wi-Fi not working in Hostel Block A"
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
              {errors.title && (
                <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                Detailed Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                {...register('description')}
                rows={4}
                placeholder="Explain the issue, when it started, and any symptoms or specific equipment affected..."
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
              {errors.description && (
                <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                  Category
                </label>
                <select
                  {...register('category')}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition font-medium"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                  Priority SLA
                </label>
                <select
                  {...register('priority')}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition font-medium"
                >
                  {PRIORITIES.map((pri) => (
                    <option key={pri} value={pri}>
                      {pri}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* AI ASSISTANCE PANEL */}
          <div className="p-5 rounded-2xl bg-linear-to-r from-emerald-50/70 via-slate-50 to-emerald-50/40 border border-emerald-200/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-2xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    AI Assistance Engine
                  </h3>
                  <p className="text-xs text-slate-500">
                    Auto-evaluates priority SLA, categorization, and optimal technician dispatch
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAIAnalysis}
                disabled={isAnalyzingAI}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-emerald-800 bg-white hover:bg-emerald-50 border border-emerald-300 transition-all shadow-2xs disabled:opacity-60 cursor-pointer"
              >
                {isAnalyzingAI ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                    <span>Analyzing Request...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Analyze with AI</span>
                  </>
                )}
              </button>
            </div>

            {aiError && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{aiError}</span>
              </div>
            )}

            {aiResult && (
              <div className="bg-white p-4.5 rounded-xl border border-emerald-200 shadow-2xs space-y-3.5 animate-in fade-in-50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600" />
                    AI Triage Recommendations
                  </span>
                  <span className="text-xs text-slate-400">Advisory • Fully Editable</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-xs font-semibold text-slate-400 uppercase block">Category</span>
                    <span className="text-sm font-bold text-slate-800">{aiResult.category}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-xs font-semibold text-slate-400 uppercase block">Priority</span>
                    <PriorityBadge priority={aiResult.priority} />
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-xs font-semibold text-slate-400 uppercase block">Department</span>
                    <span className="text-sm font-bold text-slate-800">{aiResult.department}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-xs font-semibold text-slate-400 uppercase block">Suggested Staff</span>
                    <span className="text-sm font-bold text-emerald-700">
                      {DOMAIN_STAFF_MAP[aiResult.category] || 'Domain Technician'}
                    </span>
                  </div>
                </div>

                {aiResult.isSafetyOverride && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5 font-medium animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold text-rose-900 block">Critical Safety Hazard Auto-Corrected</strong>
                      <span>The AI engine identified an urgent safety risk. Priority was forcefully elevated to <strong>CRITICAL</strong> and domain locked to <strong>{aiResult.category}</strong>.</span>
                    </div>
                  </div>
                )}

                <div className="text-xs space-y-1.5 bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100">
                  <p className="text-slate-700 leading-relaxed">
                    <strong className="text-slate-900 font-semibold">Summary: </strong>
                    {aiResult.summary}
                  </p>
                  <p className="text-slate-600 leading-relaxed">
                    <strong className="text-slate-800 font-semibold">Reasoning: </strong>
                    {aiResult.reasoning}
                  </p>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleApplyAI}
                    disabled={aiApplied}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition disabled:opacity-50 cursor-pointer shadow-2xs"
                  >
                    <Check className="w-4 h-4" />
                    <span>{aiApplied ? 'Recommendations Applied' : 'Apply Recommendations'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: LOCATION */}
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                2. Location & Facility Details
              </h2>
              <span className="text-xs font-medium text-slate-400">Step 2 of 3</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-semibold text-slate-800">
                    Building / Block / Bus <span className="text-rose-500">*</span>
                  </label>
                  {isBusOrTransport && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      <Bus className="w-3 h-3 text-amber-600" />
                      Transport / Bus
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    {...register('building')}
                    type="text"
                    list="campus-locations-list"
                    placeholder="e.g. Hostel Block A, CSE Block, or College Bus #14"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  />
                  <datalist id="campus-locations-list">
                    <option value="Hostel Block A (Boys)" />
                    <option value="Hostel Block B (Boys)" />
                    <option value="Hostel Block C (Girls)" />
                    <option value="Academic Block (Main)" />
                    <option value="CSE / IT Block" />
                    <option value="ECE / EEE Block" />
                    <option value="Mechanical & Civil Block" />
                    <option value="Library & Admin Block" />
                    <option value="College Bus / Transport Fleet" />
                    <option value="College Bus #12 (Bhimavaram)" />
                    <option value="College Bus #14 (Eluru)" />
                    <option value="College Bus #18 (Tanuku)" />
                    <option value="College Bus #22 (Palakollu)" />
                    <option value="Canteen & Mess Hall" />
                    <option value="Sports Complex & Grounds" />
                  </datalist>
                </div>

                {/* Quick Select Location Pills */}
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-slate-400 font-medium mr-0.5">Quick:</span>
                  {[
                    { label: 'Hostel Block A', val: 'Hostel Block A' },
                    { label: 'Hostel Block B', val: 'Hostel Block B' },
                    { label: 'CSE Block', val: 'CSE / IT Block' },
                    { label: '🚌 College Bus', val: 'College Bus / Transport Fleet', isBus: true },
                    { label: 'Library', val: 'Library & Admin Block' },
                  ].map((chip) => (
                    <button
                      key={chip.val}
                      type="button"
                      onClick={() => {
                        setValue('building', chip.val, { shouldValidate: true })
                        if (chip.isBus && currentCategory === 'IT Support') {
                          setValue('category', 'Transport')
                        }
                      }}
                      className={`text-[11px] px-2.5 py-0.5 rounded-lg border transition font-medium cursor-pointer ${
                        currentBuilding === chip.val
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold'
                          : chip.isBus
                          ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>

                {errors.building && (
                  <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.building.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                  {isBusOrTransport ? 'Bus Number / Route / Seat' : 'Room / Lab Number'}
                </label>
                <input
                  {...register('room')}
                  type="text"
                  placeholder={
                    isBusOrTransport
                      ? 'e.g. Bus #14 (Eluru Route), Seat 22'
                      : 'e.g. A-204 or Lab 3'
                  }
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                Exact Location Notes <span className="text-rose-500">*</span>
              </label>
              <input
                {...register('location')}
                type="text"
                placeholder={
                  isBusOrTransport
                    ? 'e.g. Boarding at campus gate 2 or en-route to Tadepalligudem'
                    : 'e.g. 2nd Floor corridor opposite water cooler'
                }
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
              {errors.location && (
                <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.location.message}</p>
              )}
            </div>
          </div>

          {/* SECTION 3: ATTACHMENT */}
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                3. Photo Attachment
              </h2>
              <span className="text-xs font-medium text-slate-400">Step 3 of 3</span>
            </div>

            {fileError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{fileError}</span>
              </div>
            )}

            {filePreview ? (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">
                    Attachment Preview:
                  </span>
                  <div className="flex items-center gap-2">
                    <label className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100 transition shadow-2xs">
                      <span>Replace</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-white border border-rose-200 rounded-lg hover:bg-rose-50 transition cursor-pointer shadow-2xs"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="max-w-xs overflow-hidden rounded-xl border border-slate-200 shadow-2xs">
                  <img
                    src={filePreview}
                    alt="Upload preview"
                    className="w-full h-44 object-cover"
                  />
                </div>
              </div>
            ) : (
              <label className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl p-7 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-emerald-50/20 transition-all">
                <Upload className="w-8 h-8 text-slate-400 mb-2" />
                <span className="text-sm font-semibold text-slate-800">
                  Upload photo of the issue
                </span>
                <span className="text-xs text-slate-400 mt-1">
                  Supports JPEG, PNG, WebP up to 5MB
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* SUBMIT BUTTON */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Link
              href="/student/dashboard"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 transition"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-2xs transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Request...</span>
                </>
              ) : (
                <>
                  <span>Submit Request</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
