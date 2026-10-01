'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Link from 'next/link'
import { 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  Upload, 
  Info,
  Check
} from 'lucide-react'
import { createServiceRequest } from '@/actions/requests'
import { requestAIAnalysis } from '@/actions/ai'
import { AIRecommendation } from '@/lib/ai/gemini'
import { PriorityBadge } from '@/components/ui/PriorityBadge'

const requestSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Category is required'),
  priority: z.string().min(1, 'Priority is required'),
  location: z.string().min(1, 'Location is required'),
  building: z.string().optional(),
  roomNumber: z.string().optional(),
  image: z.any().optional(),
})

type RequestFormValues = z.infer<typeof requestSchema>

export default function NewRequestPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // AI State
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false)
  const [aiResult, setAiResult] = useState<AIRecommendation | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)
  const [aiApplied, setAiApplied] = useState(false)

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<RequestFormValues>({
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
        setAiError(res.error || 'AI analysis unavailable. You can continue manually.')
      }
    } catch (err: any) {
      setAiError('AI analysis unavailable. You can continue manually.')
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

  const onSubmit = async (data: RequestFormValues, e: any) => {
    e.preventDefault()
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

    // Append AI suggestions if generated
    if (aiResult) {
      formData.append('aiCategory', aiResult.category)
      formData.append('aiPriority', aiResult.priority)
      formData.append('aiSummary', aiResult.summary)
    }

    const fileInput = e.target.querySelector('input[type="file"]')
    if (fileInput && fileInput.files[0]) {
      formData.append('image', fileInput.files[0])
    }

    const result = await createServiceRequest(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            href="/student/dashboard"
            className="inline-flex items-center space-x-2 text-xs font-semibold text-gray-600 hover:text-blue-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Student Dashboard</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6 sm:p-8 space-y-6">
          <div className="border-b border-gray-100 pb-5">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Create Service Request
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Submit a campus maintenance, IT, or facility service ticket. Campus staff will be dispatched to resolve it.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={(e) => handleSubmit((data) => onSubmit(data, e))(e)} className="space-y-6">
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Issue Title <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('title')}
                  placeholder="e.g., Broken ceiling light in room 302 or Wi-Fi connectivity lost"
                  className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
              </div>

              {/* Description */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-gray-700">
                    Detailed Description <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] text-gray-400">Be as specific as possible</span>
                </div>
                <textarea
                  {...register('description')}
                  rows={4}
                  placeholder="Explain what is broken, when it started, and any symptoms or safety risks..."
                  className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
              </div>

              {/* AI Triage Trigger */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleAIAnalysis}
                  disabled={isAnalyzingAI}
                  className="inline-flex items-center space-x-2 px-3.5 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold transition shadow-2xs disabled:opacity-50"
                >
                  {isAnalyzingAI ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                      <span>Analyzing with Gemini AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      <span>Analyze with Gemini AI</span>
                    </>
                  )}
                </button>
              </div>

              {/* AI Feedback / Recommendations Card */}
              {aiError && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start space-x-2">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{aiError}</span>
                </div>
              )}

              {aiResult && (
                <div className="p-4 bg-gradient-to-br from-blue-50/70 via-indigo-50/60 to-purple-50/50 border border-blue-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 text-blue-900 font-bold text-xs">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span>Gemini AI Recommendations</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleApplyAI}
                      className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold transition shadow-2xs"
                    >
                      {aiApplied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Applied!</span>
                        </>
                      ) : (
                        <span>Apply Suggestions</span>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                    <div className="bg-white/80 p-2.5 rounded-lg border border-blue-100">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">Recommended Category</span>
                      <span className="font-bold text-gray-900 mt-0.5 block">{aiResult.category}</span>
                    </div>

                    <div className="bg-white/80 p-2.5 rounded-lg border border-blue-100">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">Recommended Priority</span>
                      <span className="mt-0.5 inline-block"><PriorityBadge priority={aiResult.priority} /></span>
                    </div>

                    <div className="bg-white/80 p-2.5 rounded-lg border border-blue-100">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">Target Department</span>
                      <span className="font-semibold text-gray-900 mt-0.5 block">{aiResult.department}</span>
                    </div>
                  </div>

                  <div className="bg-white/80 p-2.5 rounded-lg border border-blue-100 text-xs text-gray-600 space-y-1">
                    <p><span className="font-semibold text-gray-800">Summary:</span> {aiResult.summary}</p>
                    <p className="text-[11px] text-gray-500 italic"><span className="font-semibold">Reasoning:</span> {aiResult.reasoning}</p>
                  </div>
                </div>
              )}

              {/* Category & Priority Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('category')}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition font-medium text-gray-800"
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
                  {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Priority <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('priority')}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition font-medium text-gray-800"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                  {errors.priority && <p className="text-red-500 text-xs mt-1">{errors.priority.message}</p>}
                </div>
              </div>

              {/* Location Fields */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  General Location / Area <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('location')}
                  placeholder="e.g., North Campus, Hostel Block B, Main Library 2nd floor"
                  className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                />
                {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Building (Optional)
                  </label>
                  <input
                    {...register('building')}
                    placeholder="e.g., Ramanujan Hall"
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Room Number (Optional)
                  </label>
                  <input
                    {...register('roomNumber')}
                    placeholder="e.g., 204"
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                  />
                </div>
              </div>

              {/* Attachment */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Attachment Photo (Optional)
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="file"
                    accept="image/jpeg, image/png, image/webp"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-gray-50 text-gray-700 file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">Accepted file formats: JPEG, PNG, WEBP (Max 5MB)</p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end space-x-3">
              <Link
                href="/student/dashboard"
                className="px-4 py-2.5 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center space-x-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition shadow-xs disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Submitting Request...</span>
                  </>
                ) : (
                  <span>Submit Service Request</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
  )
}
