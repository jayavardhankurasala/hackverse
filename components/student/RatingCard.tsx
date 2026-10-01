'use client'

import React, { useState } from 'react'
import { Star, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { submitRequestRating } from '@/actions/ratings'
import { GlassCard } from '@/components/ui/GlassCard'

interface RatingCardProps {
  requestId: string
  existingRating?: { rating: number; feedback?: string | null } | null
  onRatingSubmitted?: () => void
}

export function RatingCard({
  requestId,
  existingRating,
  onRatingSubmitted,
}: RatingCardProps) {
  const [stars, setStars] = useState<number>(existingRating?.rating || 0)
  const [hoverStars, setHoverStars] = useState<number>(0)
  const [feedback, setFeedback] = useState<string>(existingRating?.feedback || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState<boolean>(!!existingRating)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (stars === 0) {
      setError('Please select a star rating (1 to 5).')
      return
    }

    setIsSubmitting(true)
    setError(null)

    const res = await submitRequestRating({
      requestId,
      rating: stars,
      feedback: feedback.trim() || null,
    })

    if (res?.error) {
      setError(res.error)
      setIsSubmitting(false)
    } else {
      setSubmitted(true)
      setIsSubmitting(false)
      if (onRatingSubmitted) onRatingSubmitted()
    }
  }

  // Already submitted view
  if (submitted) {
    return (
      <GlassCard glow="emerald" className="p-5">
        <div className="flex items-center space-x-2 text-emerald-300 font-bold text-sm mb-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Your Service Resolution Feedback</span>
        </div>
        <div className="flex items-center space-x-1.5 my-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              className={`w-5 h-5 ${
                s <= (existingRating?.rating || stars)
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-slate-700'
              }`}
            />
          ))}
          <span className="text-xs font-semibold text-slate-300 ml-2">
            ({existingRating?.rating || stars} / 5 Stars)
          </span>
        </div>
        {(existingRating?.feedback || feedback) && (
          <p className="text-xs text-slate-300 mt-2 italic bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            "{existingRating?.feedback || feedback}"
          </p>
        )}
      </GlassCard>
    )
  }

  return (
    <GlassCard glow="blue" className="p-5 space-y-4">
      <div>
        <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span>Rate Service Quality</span>
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          This ticket has been marked as resolved. How satisfied are you with the technician's resolution?
        </p>
      </div>

      {error && (
        <div className="p-3 bg-rose-950/50 border border-rose-800/80 rounded-xl text-xs text-rose-300 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Star Selector */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Rating <span className="text-rose-400">*</span>
          </label>
          <div className="flex items-center space-x-1.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onMouseEnter={() => setHoverStars(s)}
                onMouseLeave={() => setHoverStars(0)}
                onClick={() => setStars(s)}
                className="p-1 rounded-lg hover:scale-110 transition-transform focus:outline-none"
              >
                <Star
                  className={`w-6 h-6 transition-colors ${
                    s <= (hoverStars || stars)
                      ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                      : 'text-slate-700'
                  }`}
                />
              </button>
            ))}
            <span className="text-xs font-semibold text-slate-300 ml-2">
              {stars > 0 ? `${stars} of 5 stars` : 'Select rating'}
            </span>
          </div>
        </div>

        {/* Feedback text */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Feedback Note <span className="text-slate-500 font-normal">(Optional)</span>
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={2}
            placeholder="Share feedback on technician response time, politeness, or repair quality..."
            className="w-full px-3 py-2 text-xs bg-slate-950/70 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || stars === 0}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-600/25 transition-all disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Submitting Rating...</span>
            </>
          ) : (
            <span>Submit Rating</span>
          )}
        </button>
      </form>
    </GlassCard>
  )
}
