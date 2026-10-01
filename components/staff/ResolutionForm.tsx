'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle2, Upload, AlertCircle, Loader2, Image as ImageIcon, Sparkles } from 'lucide-react'
import { resolveRequest } from '@/actions/staff'

const resolutionSchema = z.object({
  resolutionNote: z
    .string()
    .trim()
    .min(10, 'Resolution note must be at least 10 characters long')
    .max(1000, 'Resolution note cannot exceed 1000 characters'),
})

type ResolutionFormData = z.infer<typeof resolutionSchema>

interface ResolutionFormProps {
  requestId: string
  ticketNumber: string
  onSuccess?: () => void
}

export function ResolutionForm({
  requestId,
  ticketNumber,
  onSuccess,
}: ResolutionFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResolutionFormData>({
    resolver: zodResolver(resolutionSchema),
    defaultValues: {
      resolutionNote: '',
    },
  })

  const currentNote = watch('resolutionNote') || ''

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (file) {
      if (!file.type.startsWith('image/')) {
        setServerError('Only image files (JPG, PNG, WebP, GIF) are allowed')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setServerError('Image size must be less than 5MB')
        return
      }
      setSelectedFile(file)
      setFilePreview(URL.createObjectURL(file))
      setServerError(null)
    } else {
      setSelectedFile(null)
      setFilePreview(null)
    }
  }

  const onSubmit = async (data: ResolutionFormData) => {
    setIsSubmitting(true)
    setServerError(null)

    try {
      const formData = new FormData()
      formData.append('requestId', requestId)
      formData.append('resolutionNote', data.resolutionNote)
      if (selectedFile) {
        formData.append('resolutionImage', selectedFile)
      }

      const res = await resolveRequest(formData)

      if (res?.error) {
        setServerError(res.error)
        setIsSubmitting(false)
      } else {
        if (onSuccess) {
          onSuccess()
        } else {
          window.location.reload()
        }
      }
    } catch (err: any) {
      setServerError(err?.message || 'Failed to submit resolution. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-6 backdrop-blur-md space-y-5">
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <span>Formal Service Ticket Resolution</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Document completed technician actions to mark ticket <span className="font-mono text-emerald-300 font-semibold">{ticketNumber}</span> as resolved. The student will be notified and invited to submit rating feedback.
          </p>
        </div>
      </div>

      {serverError && (
        <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/60 flex items-start space-x-2.5 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Resolution Note Field */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label htmlFor="resolutionNote" className="text-xs font-semibold text-slate-300">
              Resolution Summary & Technical Work Performed <span className="text-rose-400">*</span>
            </label>
            <span className="text-[11px] text-slate-500 font-mono">
              {currentNote.length}/1000
            </span>
          </div>

          <textarea
            id="resolutionNote"
            {...register('resolutionNote')}
            rows={3}
            placeholder="Describe the root cause and remedy (e.g., Replaced blown fuse in sub-distribution board, verified voltage on load, tested circuits with occupant)."
            className={`w-full px-4 py-3 text-sm bg-slate-900/80 border rounded-xl outline-none transition text-white placeholder-slate-500 focus:ring-2 ${
              errors.resolutionNote
                ? 'border-rose-500/60 focus:ring-rose-500/20'
                : 'border-slate-800 focus:border-emerald-500/80 focus:ring-emerald-500/20'
            }`}
          />
          {errors.resolutionNote && (
            <p className="mt-1.5 text-xs text-rose-400 flex items-center space-x-1">
              <span>{errors.resolutionNote.message}</span>
            </p>
          )}
        </div>

        {/* Optional Resolution Image Upload */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Resolution Proof / Completion Photo (Optional)
          </label>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <label className="cursor-pointer inline-flex items-center space-x-2 px-4 py-2.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-xs font-semibold text-slate-200 transition">
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>{selectedFile ? 'Change Photo' : 'Upload Verification Photo'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {selectedFile && (
              <span className="text-xs text-slate-300 font-mono truncate max-w-xs bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </span>
            )}
          </div>

          {filePreview && (
            <div className="mt-3 relative w-40 h-28 rounded-xl overflow-hidden border border-emerald-500/40 bg-slate-950 shadow-md">
              <img
                src={filePreview}
                alt="Resolution preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Recording Resolution...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Mark as RESOLVED</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
