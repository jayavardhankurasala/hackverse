'use client'

import React, { useState } from 'react'
import { Star, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { submitRequestRating } from '@/actions/ratings'

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
      <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center space-x-2 text-emerald-900 font-bold text-sm mb-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Your Service Resolution Feedback</span>
        </div>
        <div className="flex items-center space-x-1 my-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              className={`w-5 h-5 ${
                s <= (existingRating?.rating || stars)
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-gray-300'
              }`}
            />
          ))}
          <span className="text-xs font-bold text-gray-700 ml-2">
            {existingRating?.rating || stars} of 5 Stars
          </span>
        </div>
        {(existingRating?.feedback || feedback) && (
          <p className="text-xs text-gray-700 italic mt-1 bg-white p-3 rounded-lg border border-emerald-100">
            &ldquo;{existingRating?.feedback || feedback}&rdquo;
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-5 shadow-xs space-y-3">
      <div>
        <h3 className="text-sm font-bold text-gray-900">
          Rate the Resolution Experience
        </h3>
        <p className="text-xs text-gray-600 mt-0.5">
          Your feedback helps us maintain campus quality standards and evaluate staff performance.
        </p>
      </div>

      {error && (
        <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center space-x-1.5">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Star Selector */}
        <div className="flex items-center space-x-1.5">
          {[1, 2, 3, 4, 5].map((starVal) => {
            const isFilled = (hoverStars || stars) >= starVal
            return (
              <button
                key={starVal}
                type="button"
                onMouseEnter={() => setHoverStars(starVal)}
                onMouseLeave={() => setHoverStars(0)}
                onClick={() => setStars(starVal)}
                className="p-1 hover:scale-110 transition-transform focus:outline-none"
              >
                <Star
                  className={`w-6 h-6 transition-colors ${
                    isFilled ? 'text-amber-400 fill-amber-400' : 'text-gray-300'
                  }`}
                />
              </button>
            )
          })}
          <span className="text-xs font-semibold text-gray-600 ml-2">
            {stars > 0 ? `${stars} of 5 Stars` : 'Click to rate'}
          </span>
        </div>

        {/* Optional Feedback */}
        <div>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={2}
            placeholder="Additional comments or notes about the service (optional)..."
            className="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-300 transition"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || stars === 0}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-2xs transition"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <span>Submit Rating</span>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
