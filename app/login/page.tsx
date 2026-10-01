'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  GraduationCap,
  Wrench,
  ShieldAlert,
  ShieldCheck,
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
} from 'lucide-react'
import { login } from '@/actions/auth'
import { GlassCard } from '@/components/ui/GlassCard'

const loginSchema = z.object({
  email: z.string().trim().email('Please enter a valid campus email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormValues = z.infer<typeof loginSchema>

function LoginForm() {
  const searchParams = useSearchParams()
  const currentRole = (searchParams.get('role') || 'student').toLowerCase()
  const [serverError, setServerError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const isStaff = currentRole === 'staff'
  const isAdmin = currentRole === 'admin'
  const isStudent = !isStaff && !isAdmin

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(data: LoginFormValues) {
    setLoading(true)
    setServerError(null)

    const formData = new FormData()
    formData.append('email', data.email)
    formData.append('password', data.password)

    const result = await login(formData)
    if (result?.error) {
      setServerError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-4 sm:p-6 text-slate-100 relative">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-600/10 blur-[130px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Back to Portal Hub */}
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1 text-slate-400" />
            <span>Back to Campus Portal</span>
          </Link>
        </div>

        {/* Card */}
        <GlassCard
          glow={isAdmin ? 'red' : isStaff ? 'purple' : 'blue'}
          className="p-0 overflow-hidden shadow-2xl"
        >
          {/* Header Banner */}
          <div
            className={`p-6 text-center border-b ${
              isAdmin
                ? 'bg-gradient-to-r from-red-950/80 to-slate-900 border-red-800/60'
                : isStaff
                ? 'bg-gradient-to-r from-indigo-950/80 to-slate-900 border-indigo-800/60'
                : 'bg-gradient-to-r from-blue-950/80 to-slate-900 border-blue-800/60'
            }`}
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md mb-3">
              {isAdmin ? (
                <ShieldAlert className="w-6 h-6 text-red-400" />
              ) : isStaff ? (
                <Wrench className="w-6 h-6 text-indigo-400" />
              ) : (
                <GraduationCap className="w-6 h-6 text-blue-400" />
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {isAdmin
                ? 'Administrator Command Center'
                : isStaff
                ? 'Staff Service Portal'
                : 'Student Service Portal'}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {isAdmin
                ? 'Central facilities dispatch & analytics console'
                : isStaff
                ? 'Technician resolution & maintenance queue'
                : 'Report campus issues & track live progress'}
            </p>
          </div>

          {/* Role Switcher Tabs */}
          <div className="grid grid-cols-3 bg-slate-950/80 p-1 border-b border-slate-800/80 text-xs font-medium text-center">
            <Link
              href="/login?role=student"
              className={`py-2 rounded-lg transition-all ${
                isStudent
                  ? 'bg-blue-600/20 text-blue-300 font-semibold border border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Student
            </Link>
            <Link
              href="/login?role=staff"
              className={`py-2 rounded-lg transition-all ${
                isStaff
                  ? 'bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Staff
            </Link>
            <Link
              href="/login?role=admin"
              className={`py-2 rounded-lg transition-all ${
                isAdmin
                  ? 'bg-red-600/20 text-red-300 font-semibold border border-red-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Admin
            </Link>
          </div>

          {/* Form Content */}
          <div className="p-6 sm:p-8 space-y-5">
            {isAdmin && (
              <div className="p-3.5 bg-red-950/40 border border-red-800/60 rounded-xl flex items-start space-x-2.5 text-xs text-red-300">
                <ShieldCheck className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-semibold text-red-200">Restricted Access:</span> Administrator accounts are pre-provisioned by system administrators. Public registration is disabled.
                </div>
              </div>
            )}

            {serverError && (
              <div className="p-3.5 bg-rose-950/50 border border-rose-800/80 rounded-xl flex items-start space-x-2.5 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{serverError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Campus Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    {...register('email')}
                    type="email"
                    autoComplete="email"
                    placeholder={
                      isAdmin
                        ? 'admin@campus.edu'
                        : isStaff
                        ? 'staff@campus.edu'
                        : 'student@campus.edu'
                    }
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-rose-400 font-medium">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-rose-400 font-medium">{errors.password.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2.5 px-4 rounded-xl font-semibold text-sm text-white shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2 ${
                  isAdmin
                    ? 'bg-red-600 hover:bg-red-500 shadow-red-600/20'
                    : isStaff
                    ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20'
                    : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : isAdmin ? (
                  'Sign In to Command Center'
                ) : isStaff ? (
                  'Sign In as Staff'
                ) : (
                  'Sign In as Student'
                )}
              </button>
            </form>

            {/* Bottom Links */}
            <div className="pt-4 border-t border-slate-800/80 text-center text-xs text-slate-400">
              {isAdmin ? (
                <p>
                  Need administrator access?{' '}
                  <span className="text-slate-300 font-semibold">Contact University IT Systems.</span>
                </p>
              ) : isStaff ? (
                <p>
                  New staff technician?{' '}
                  <Link
                    href="/register?role=staff"
                    className="text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    Register staff account
                  </Link>
                </p>
              ) : (
                <p>
                  New to the platform?{' '}
                  <Link
                    href="/register?role=student"
                    className="text-blue-400 hover:text-blue-300 font-semibold"
                  >
                    Create student account
                  </Link>
                </p>
              )}
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400 text-xs">
          Loading portal...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
