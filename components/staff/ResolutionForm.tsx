'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle2, Upload, AlertCircle, Loader2, Image as ImageIcon } from 'lucide-react'
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
    <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-5 sm:p-6 shadow-xs">
      <div className="flex items-start space-x-3 mb-4">
        <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-900">
            Resolve Service Request
          </h3>
          <p className="text-xs text-gray-600 mt-0.5">
            Document the completed work to mark ticket <span className="font-semibold text-gray-800">{ticketNumber}</span> as resolved. The student will be notified.
          </p>
        </div>
      </div>

      {serverError && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start space-x-2 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Resolution Note Field */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label htmlFor="resolutionNote" className="text-xs font-semibold text-gray-700">
              Resolution Summary & Work Performed <span className="text-red-500">*</span>
            </label>
            <span className="text-[11px] text-gray-400">
              {currentNote.length}/1000 characters
            </span>
          </div>

          <textarea
            id="resolutionNote"
            {...register('resolutionNote')}
            rows={3}
            placeholder="e.g., Replaced faulty breaker, tested light sockets, and confirmed proper operation with the room occupant."
            className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg outline-none transition focus:ring-2 ${
              errors.resolutionNote
                ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                : 'border-gray-200 focus:ring-emerald-200 focus:border-emerald-500'
            }`}
          />
          {errors.resolutionNote && (
            <p className="mt-1 text-xs text-red-600 flex items-center space-x-1">
              <span>{errors.resolutionNote.message}</span>
            </p>
          )}
        </div>

        {/* Optional Resolution Image Upload */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Resolution Proof / Photo (Optional)
          </label>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <label className="cursor-pointer inline-flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition shadow-2xs">
              <Upload className="w-4 h-4 text-gray-500" />
              <span>{selectedFile ? 'Change Photo' : 'Upload Completion Photo'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {selectedFile && (
              <span className="text-xs text-gray-600 font-medium truncate max-w-xs">
                {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </span>
            )}
          </div>

          {filePreview && (
            <div className="mt-3 relative w-36 h-28 rounded-lg overflow-hidden border border-emerald-300 bg-white shadow-2xs">
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
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold rounded-lg text-sm transition-colors shadow-xs"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Submitting Resolution...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark as RESOLVED</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
