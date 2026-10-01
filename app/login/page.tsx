'use client'

import { useState, Suspense, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  GraduationCap,
  Wrench,
  ShieldCheck,
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Sparkles,
  ArrowRight,
  Check,
} from 'lucide-react'
import { login } from '@/actions/auth'
import { DEMO_USERS } from '@/lib/demo/mock-data'
import { setCurrentDemoUser, getCurrentDemoUser } from '@/lib/demo/demo-service'
import { DemoUser } from '@/lib/demo/types'

const loginSchema = z.object({
  email: z.string().trim().email('Please enter a valid campus email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormValues = z.infer<typeof loginSchema>

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentRole = (searchParams.get('role') || 'student').toLowerCase()
  const [serverError, setServerError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const isStaff = currentRole === 'staff'
  const isAdmin = currentRole === 'admin'
  const isStudent = !isStaff && !isAdmin

  // Demo user selection
  const allUsers = Object.values(DEMO_USERS)
  const studentUsers = allUsers.filter((u) => u.role === 'STUDENT')
  const staffUsers = allUsers.filter((u) => u.role === 'STAFF')
  const adminUsers = allUsers.filter((u) => u.role === 'ADMIN')

  const initialSelectedId = isStaff
    ? 'staff-1'
    : isAdmin
    ? 'admin-1'
    : 'student-1'

  const [selectedDemoUserId, setSelectedDemoUserId] = useState<string>(initialSelectedId)

  useEffect(() => {
    if (isStaff) setSelectedDemoUserId('staff-1')
    else if (isAdmin) setSelectedDemoUserId('admin-1')
    else setSelectedDemoUserId('student-1')
  }, [currentRole, isStaff, isAdmin])

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  // Autofill form when demo user selected
  useEffect(() => {
    const user = DEMO_USERS[selectedDemoUserId]
    if (user) {
      setValue('email', user.email)
    }
  }, [selectedDemoUserId, setValue])

  const handleContinueDemo = () => {
    const user = DEMO_USERS[selectedDemoUserId]
    if (!user) return
    setCurrentDemoUser(user.id)
    if (user.role === 'STUDENT') {
      router.push('/student/dashboard')
    } else if (user.role === 'STAFF') {
      router.push('/staff/dashboard')
    } else {
      router.push('/admin/dashboard')
    }
  }

  async function onSubmit(data: LoginFormValues) {
    setLoading(true)
    setServerError(null)

    const formData = new FormData()
    formData.append('email', data.email)
    formData.append('password', data.password)

    const result = await login(formData)
    if (result?.error) {
      // In demo mode without DB, if login fails, still allow graceful fallback to demo user
      setServerError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 sm:p-6 text-slate-900 font-sans">
      <div className="w-full max-w-md relative z-10">
        {/* Back Link */}
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            <span>Back to Campus Portal</span>
          </Link>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
          {/* Header Banner */}
          <div className="p-6 text-center border-b border-slate-100 bg-linear-to-b from-emerald-50/50 to-white">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 mb-3 border border-emerald-200 shadow-2xs">
              {isAdmin ? (
                <ShieldCheck className="w-6 h-6 text-emerald-700" />
              ) : isStaff ? (
                <Wrench className="w-6 h-6 text-emerald-700" />
              ) : (
                <GraduationCap className="w-6 h-6 text-emerald-700" />
              )}
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Campus Service Request Platform
            </h1>
            <p className="text-xs font-semibold text-emerald-700 mt-1">
              Report. Track. Resolve.
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {isAdmin
                ? 'Central administrative governance & facilities triage'
                : isStaff
                ? 'Maintenance specialist & repair technician queue'
                : 'Student incident reporting & live request tracking'}
            </p>
          </div>

          {/* Role Switcher Tabs */}
          <div className="grid grid-cols-3 bg-slate-100/80 p-1.5 border-b border-slate-200 text-xs font-medium text-center">
            <Link
              href="/login?role=student"
              className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                isStudent
                  ? 'bg-white text-emerald-700 font-bold shadow-2xs border border-emerald-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Student</span>
            </Link>
            <Link
              href="/login?role=staff"
              className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                isStaff
                  ? 'bg-white text-emerald-700 font-bold shadow-2xs border border-emerald-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Staff</span>
            </Link>
            <Link
              href="/login?role=admin"
              className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                isAdmin
                  ? 'bg-white text-emerald-700 font-bold shadow-2xs border border-emerald-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin</span>
            </Link>
          </div>

          <div className="p-6 sm:p-7 space-y-5">
            {/* Quick Demo Selector Box */}
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Demo Mode — Select Persona</span>
                </span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Instant Access
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Choose {isStudent ? 'Student' : isStaff ? 'Staff Specialist' : 'Administrator'}:
                </label>
                <select
                  value={selectedDemoUserId}
                  onChange={(e) => setSelectedDemoUserId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                >
                  {isStudent &&
                    studentUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.studentId} • {u.hostel || 'Hostel'})
                      </option>
                    ))}
                  {isStaff &&
                    staffUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} — {u.department} ({u.specialization})
                      </option>
                    ))}
                  {isAdmin &&
                    adminUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} — {u.department}
                      </option>
                    ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleContinueDemo}
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Continue to Demo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="grow border-t border-slate-200"></div>
              <span className="shrink mx-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Or Sign In With Password
              </span>
              <div className="grow border-t border-slate-200"></div>
            </div>

            {serverError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2 text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{serverError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Campus Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
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
                    className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-rose-600 font-medium">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-rose-600 font-medium">{errors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-white bg-slate-900 hover:bg-slate-800 shadow-2xs transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  'Sign In with University SSO'
                )}
              </button>
            </form>

            <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
              {isAdmin ? (
                <p>
                  Administrative privileges are pre-provisioned by university central IT.
                </p>
              ) : isStaff ? (
                <p>
                  New staff technician?{' '}
                  <Link
                    href="/register?role=staff"
                    className="text-emerald-700 hover:text-emerald-800 font-semibold"
                  >
                    Register staff account
                  </Link>
                </p>
              ) : (
                <p>
                  First time reporting an issue?{' '}
                  <Link
                    href="/register?role=student"
                    className="text-emerald-700 hover:text-emerald-800 font-semibold"
                  >
                    Register student account
                  </Link>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400 text-xs">
          Loading portal...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
