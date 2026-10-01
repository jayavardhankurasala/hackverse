'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Link from 'next/link'
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
  Hash,
} from 'lucide-react'
import { createServiceRequest } from '@/actions/requests'
import { requestAIAnalysis } from '@/actions/ai'
import { AIRecommendation } from '@/lib/ai/gemini'
import { PriorityBadge } from '@/components/ui/PriorityBadge'
import { GlassCard } from '@/components/ui/GlassCard'

const requestSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Category is required'),
  priority: z.string().min(1, 'Priority is required'),
  location: z.string().min(1, 'Location is required'),
  building: z.string().optional(),
  roomNumber: z.string().optional(),
})

type RequestFormValues = z.infer<typeof requestSchema>

export default function NewRequestPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Attachment State
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)

  // AI State
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false)
  const [aiResult, setAiResult] = useState<AIRecommendation | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)
  const [aiApplied, setAiApplied] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      category: 'Maintenance',
      priority: 'LOW',
      location: '',
      building: '',
      roomNumber: '',
    },
  })

  const currentTitle = watch('title') || ''
  const currentDescription = watch('description') || ''
  const currentLocation = watch('location') || ''
  const currentCategory = watch('category')
  const currentPriority = watch('priority')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null)
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setFileError('File size exceeds the 5MB limit. Please upload a smaller image.')
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

  // Run AI Analysis
  const handleAIAnalysis = async () => {
    if (currentTitle.trim().length < 3) {
      setAiError('Please enter a title (at least 3 characters) before analyzing with AI.')
      return
    }

    if (currentDescription.trim().length < 5) {
      setAiError('Please describe the issue in more detail before analyzing with AI.')
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
        location: currentLocation,
        currentCategory,
        currentPriority,
      })

      if (res.success && res.data) {
        setAiResult(res.data)
      } else {
        setAiError(res.error || 'AI analysis temporarily unavailable. You can proceed manually.')
      }
    } catch {
      setAiError('AI analysis temporarily unavailable. You can proceed manually.')
    } finally {
      setIsAnalyzingAI(false)
    }
  }

  // Apply AI recommendations to form
  const handleApplyAI = () => {
    if (!aiResult) return
    setValue('category', aiResult.category)
    setValue('priority', aiResult.priority)
    setAiApplied(true)
  }

  const onSubmit = async (data: RequestFormValues) => {
    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('title', data.title)
    formData.append('description', data.description)
    formData.append('category', data.category)
    formData.append('priority', data.priority)
    formData.append('location', data.location)
    if (data.building) formData.append('building', data.building)
    if (data.roomNumber) formData.append('roomNumber', data.roomNumber)

    if (aiResult) {
      formData.append('aiCategory', aiResult.category)
      formData.append('aiPriority', aiResult.priority)
      formData.append('aiSummary', aiResult.summary)
    }

    if (selectedFile) {
      formData.append('image', selectedFile)
    }

    const result = await createServiceRequest(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Navigation Breadcrumb */}
      <div>
        <Link
          href="/student/dashboard"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Student Dashboard</span>
        </Link>
      </div>

      {/* Main Glass Card */}
      <GlassCard glow="blue" className="p-6 sm:p-8 space-y-6">
        <div className="border-b border-slate-800/80 pb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/70 border border-blue-800/60 text-xs font-semibold text-blue-300 mb-2">
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span>New Ticket Submission</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Create Campus Service Request
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Submit a campus maintenance, electrical, or facilities issue. Campus technicians will be automatically triaged and dispatched.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-rose-950/60 border border-rose-800/80 rounded-xl text-xs text-rose-300 flex items-center space-x-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Issue Title <span className="text-rose-400">*</span>
              </label>
              <input
                {...register('title')}
                placeholder="e.g., Broken ceiling light in room 302 or Wi-Fi connectivity lost"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-950/70 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              {errors.title && <p className="text-rose-400 text-xs mt-1 font-medium">{errors.title.message}</p>}
            </div>

            {/* Description */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Detailed Description <span className="text-rose-400">*</span>
                </label>
                <span className="text-[11px] text-slate-500">Be as specific as possible</span>
              </div>
              <textarea
                {...register('description')}
                rows={4}
                placeholder="Explain what is broken, when it started, and any symptoms or safety risks..."
                className="w-full px-3.5 py-2.5 text-sm bg-slate-950/70 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all leading-relaxed"
              />
              {errors.description && <p className="text-rose-400 text-xs mt-1 font-medium">{errors.description.message}</p>}
            </div>

            {/* AI Triage Trigger */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleAIAnalysis}
                disabled={isAnalyzingAI}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-900/60 to-indigo-900/60 hover:from-blue-800/80 hover:to-indigo-800/80 text-blue-200 border border-blue-500/40 rounded-xl text-xs font-semibold transition-all shadow-md shadow-blue-500/10 disabled:opacity-50"
              >
                {isAnalyzingAI ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                    <span>Analyzing with Gemini AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                    <span>Triage with Gemini AI</span>
                  </>
                )}
              </button>
            </div>

            {/* AI Non-blocking Error */}
            {aiError && (
              <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-xl text-xs text-amber-300 flex items-start space-x-2">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{aiError}</span>
              </div>
            )}

            {/* AI Result Card */}
            {aiResult && (
              <div className="p-4 bg-gradient-to-br from-blue-950/40 via-indigo-950/30 to-slate-900/60 border border-blue-500/30 rounded-2xl space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-blue-300 font-bold text-xs">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <span>Gemini AI Intelligent Triage</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleApplyAI}
                    className="inline-flex items-center space-x-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-all shadow-xs"
                  >
                    {aiApplied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Applied to Form!</span>
                      </>
                    ) : (
                      <span>Apply Suggestions</span>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Recommended Category</span>
                    <span className="font-bold text-white mt-1 block">{aiResult.category}</span>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Recommended Priority</span>
                    <span className="mt-1 inline-block">
                      <PriorityBadge priority={aiResult.priority} />
                    </span>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Target Department</span>
                    <span className="font-semibold text-white mt-1 block">{aiResult.department}</span>
                  </div>
                </div>

                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
                  <p><span className="font-semibold text-slate-200">AI Summary:</span> {aiResult.summary}</p>
                  <p className="text-[11px] text-slate-400 italic"><span className="font-semibold text-slate-300">Reasoning:</span> {aiResult.reasoning}</p>
                </div>
              </div>
            )}

            {/* Category & Priority Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Category <span className="text-rose-400">*</span>
                </label>
                <select
                  {...register('category')}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-950/70 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition font-medium"
                >
                  <option value="IT Support" className="bg-slate-900">IT Support</option>
                  <option value="Electrical" className="bg-slate-900">Electrical</option>
                  <option value="Plumbing" className="bg-slate-900">Plumbing</option>
                  <option value="Maintenance" className="bg-slate-900">Maintenance</option>
                  <option value="Hostel" className="bg-slate-900">Hostel</option>
                  <option value="Transport" className="bg-slate-900">Transport</option>
                  <option value="Cleaning" className="bg-slate-900">Cleaning</option>
                  <option value="Administration" className="bg-slate-900">Administration</option>
                </select>
                {errors.category && <p className="text-rose-400 text-xs mt-1 font-medium">{errors.category.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Priority <span className="text-rose-400">*</span>
                </label>
                <select
                  {...register('priority')}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-950/70 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition font-medium"
                >
                  <option value="LOW" className="bg-slate-900">LOW (Routine / Non-urgent)</option>
                  <option value="MEDIUM" className="bg-slate-900">MEDIUM (Standard issue)</option>
                  <option value="HIGH" className="bg-slate-900">HIGH (Significant disruption)</option>
                  <option value="CRITICAL" className="bg-slate-900">CRITICAL (Emergency / Hazard)</option>
                </select>
                {errors.priority && <p className="text-rose-400 text-xs mt-1 font-medium">{errors.priority.message}</p>}
              </div>
            </div>

            {/* Location Fields */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>General Location / Area</span> <span className="text-rose-400">*</span>
              </label>
              <input
                {...register('location')}
                placeholder="e.g., North Campus, Hostel Block B, Main Library 2nd floor"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-950/70 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
              {errors.location && <p className="text-rose-400 text-xs mt-1 font-medium">{errors.location.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-500" />
                  <span>Building (Optional)</span>
                </label>
                <input
                  {...register('building')}
                  placeholder="e.g., Ramanujan Hall"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-950/70 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-slate-500" />
                  <span>Room Number (Optional)</span>
                </label>
                <input
                  {...register('roomNumber')}
                  placeholder="e.g., 204"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-950/70 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
            </div>

            {/* Attachment Dropzone */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Attachment Photo (Optional)
              </label>

              {fileError && (
                <div className="mb-2 p-2.5 bg-rose-950/50 border border-rose-800/80 rounded-lg text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>{fileError}</span>
                </div>
              )}

              {filePreview ? (
                <div className="relative p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={filePreview}
                      alt="Attachment Preview"
                      className="w-14 h-14 object-cover rounded-lg border border-slate-700"
                    />
                    <div>
                      <p className="text-xs font-semibold text-white truncate max-w-xs">{selectedFile?.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {selectedFile ? (selectedFile.size / 1024 / 1024).toFixed(2) : 0} MB &bull; Ready to upload
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-800 rounded-xl bg-slate-950/40 hover:bg-slate-900/40 hover:border-slate-700 cursor-pointer transition group">
                  <Upload className="w-6 h-6 text-slate-500 group-hover:text-blue-400 transition" />
                  <span className="text-xs font-semibold text-slate-300 mt-2">
                    Click to browse or drop photo here
                  </span>
                  <span className="text-[11px] text-slate-500 mt-0.5">
                    JPEG, PNG, or WebP &bull; Maximum 5MB
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg, image/png, image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-end space-x-3">
            <Link
              href="/student/dashboard"
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-900 border border-slate-800 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center space-x-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-all shadow-lg shadow-blue-600/25 border border-blue-400/30 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Submitting Ticket...</span>
                </>
              ) : (
                <span>Submit Service Request</span>
              )}
            </button>
          </div>
        </form>
      </GlassCard>
    </div>
  )
}
