'use client'

import { useState } from 'react'
import Link from 'next/link'
import { GraduationCap, ArrowLeft, Mail, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { requestPasswordReset } from '@/actions/auth'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const res = await requestPasswordReset(email, window.location.origin)
      if (res.error) {
        setErrorMessage(res.error)
      } else {
        setSuccessMessage(res.message || 'Password reset link sent! Check your inbox.')
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send reset link. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 sm:p-6 text-slate-900 font-sans">
      <div className="w-full max-w-md">
        <div className="mb-4">
          <Link
            href="/login"
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            <span>Back to Sign In</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
          <div className="p-6 text-center border-b border-slate-100 bg-linear-to-b from-emerald-50/50 to-white">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 mb-3 border border-emerald-200 shadow-2xs">
              <GraduationCap className="w-6 h-6 text-emerald-700" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Reset Your Password
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Enter your registered campus email address and we'll send you a password recovery link.
            </p>
          </div>

          <div className="p-6 sm:p-7 space-y-4">
            {successMessage ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h3 className="text-sm font-bold text-emerald-900">Recovery Email Sent</h3>
                <p className="text-xs text-emerald-700 leading-relaxed">{successMessage}</p>
                <div className="pt-2">
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition"
                  >
                    Return to Login
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMessage && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2 text-xs text-rose-700">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Campus Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@campus.edu or staff@campus.edu"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-2xs transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending Recovery Link...</span>
                    </>
                  ) : (
                    <span>Send Password Reset Link</span>
                  )}
                </button>
              </form>
            )}

            <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
              Remember your password?{' '}
              <Link href="/login" className="text-emerald-700 hover:text-emerald-800 font-semibold">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
