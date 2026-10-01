'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  GraduationCap,
  Wrench,
  ShieldAlert,
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User,
  CreditCard,
  Building,
} from 'lucide-react'
import { register as registerAction } from '@/actions/auth'
import { createClient } from '@/lib/supabase/client'
import { GlassCard } from '@/components/ui/GlassCard'

const registerSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters'),
  email: z.string().trim().email('Please enter a valid campus email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  studentId: z.string().optional(),
  staffId: z.string().optional(),
  departmentId: z.string().optional(),
})

type RegisterFormValues = z.infer<typeof registerSchema>

const DEFAULT_DEPARTMENTS = [
  'IT Support',
  'Electrical',
  'Plumbing',
  'Maintenance',
  'Hostel',
  'Transport',
  'Cleaning',
  'Administration',
]

function RegisterForm() {
  const searchParams = useSearchParams()
  const currentRole = (searchParams.get('role') || 'student').toLowerCase()
  const [serverError, setServerError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([])

  const isAdmin = currentRole === 'admin'
  const isStaff = currentRole === 'staff'
  const isStudent = !isStaff && !isAdmin

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      studentId: '',
      staffId: '',
      departmentId: '',
    },
  })

  useEffect(() => {
    async function loadDepartments() {
      try {
        const supabase = createClient()
        const { data } = await supabase.from('departments').select('id, name').order('name')
        if (data && data.length > 0) {
          setDepartments(data)
        }
      } catch {
        // Fallback
      }
    }
    loadDepartments()
  }, [])

  async function onSubmit(data: RegisterFormValues) {
    if (isStudent && (!data.studentId || data.studentId.trim().length === 0)) {
      setServerError('Student ID is required for student registration')
      return
    }

    setLoading(true)
    setServerError(null)

    const formData = new FormData()
    formData.append('role', isStaff ? 'STAFF' : 'STUDENT')
    formData.append('fullName', data.fullName)
    formData.append('email', data.email)
    formData.append('password', data.password)
    if (data.studentId) formData.append('studentId', data.studentId)
    if (data.staffId) formData.append('staffId', data.staffId)
    if (data.departmentId) formData.append('departmentId', data.departmentId)

    const result = await registerAction(formData)
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
        {/* Back Link */}
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
                ? 'Admin Registration Restricted'
                : isStaff
                ? 'Staff Account Registration'
                : 'Student Account Registration'}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {isAdmin
                ? 'Administrative roles require authorization'
                : isStaff
                ? 'Join the campus facilities and resolution team'
                : 'Submit and monitor campus maintenance requests'}
            </p>
          </div>

          {/* Role Tabs for Student / Staff */}
          {!isAdmin && (
            <div className="grid grid-cols-2 bg-slate-950/80 p-1 border-b border-slate-800/80 text-xs font-medium text-center">
              <Link
                href="/register?role=student"
                className={`py-2 rounded-lg transition-all ${
                  isStudent
                    ? 'bg-blue-600/20 text-blue-300 font-semibold border border-blue-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Student Registration
              </Link>
              <Link
                href="/register?role=staff"
                className={`py-2 rounded-lg transition-all ${
                  isStaff
                    ? 'bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Staff Registration
              </Link>
            </div>
          )}

          {/* Admin Block View */}
          {isAdmin ? (
            <div className="p-6 sm:p-8 text-center space-y-5">
              <div className="p-4 bg-red-950/40 border border-red-800/60 rounded-xl text-red-300 text-xs text-left leading-relaxed">
                <p className="font-semibold text-red-200 mb-1 flex items-center">
                  <ShieldAlert className="w-4 h-4 text-red-400 mr-1.5" />
                  Security Policy: Public Admin Registration Disabled
                </p>
                To maintain university systems security, administrative privileges are assigned directly by IT Systems Administrators. Please sign in with your issued credentials.
              </div>

              <Link
                href="/login?role=admin"
                className="w-full inline-flex justify-center items-center py-2.5 px-4 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-red-600/20"
              >
                Proceed to Administrator Login
              </Link>
            </div>
          ) : (
            /* Student or Staff Registration Form */
            <div className="p-6 sm:p-8 space-y-4">
              {serverError && (
                <div className="p-3.5 bg-rose-950/50 border border-rose-800/80 rounded-xl flex items-start space-x-2.5 text-xs text-rose-300">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{serverError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      {...register('fullName')}
                      type="text"
                      placeholder={isStaff ? 'e.g. John Doe' : 'e.g. Alex Morgan'}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  {errors.fullName && (
                    <p className="mt-1 text-xs text-rose-400 font-medium">{errors.fullName.message}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Campus Email <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      {...register('email')}
                      type="email"
                      placeholder={isStaff ? 'staff@campus.edu' : 'student@campus.edu'}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-xs text-rose-400 font-medium">{errors.email.message}</p>
                  )}
                </div>

                {/* Role-Specific ID Field */}
                {isStudent ? (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Student ID <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <input
                        {...register('studentId')}
                        type="text"
                        placeholder="e.g. STU-2024-8841"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Employee / Staff ID <span className="text-slate-500 font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <input
                        {...register('staffId')}
                        type="text"
                        placeholder="e.g. EMP-1049"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                )}

                {/* Department Selector */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>{isStaff ? 'Service Department' : 'Department / Hostel'}</span>
                    <span className="text-slate-500 font-normal">Optional</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Building className="w-4 h-4" />
                    </div>
                    <select
                      {...register('departmentId')}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      defaultValue=""
                    >
                      <option value="" className="bg-slate-900 text-slate-400">Select department...</option>
                      {departments.length > 0
                        ? departments.map((d) => (
                            <option key={d.id} value={d.id} className="bg-slate-900 text-white">
                              {d.name}
                            </option>
                          ))
                        : DEFAULT_DEPARTMENTS.map((name) => (
                            <option key={name} value="" className="bg-slate-900 text-white">
                              {name}
                            </option>
                          ))}
                    </select>
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Password <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="At least 6 characters"
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
                    isStaff
                      ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20'
                      : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20'
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : isStaff ? (
                    'Complete Staff Registration'
                  ) : (
                    'Complete Student Registration'
                  )}
                </button>
              </form>

              {/* Login link */}
              <div className="pt-4 border-t border-slate-800/80 text-center text-xs text-slate-400">
                Already have an account?{' '}
                <Link
                  href={isStaff ? '/login?role=staff' : '/login?role=student'}
                  className={`${isStaff ? 'text-indigo-400' : 'text-blue-400'} font-semibold hover:underline`}
                >
                  Sign in here
                </Link>
              </div>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400 text-xs">
          Loading registration...
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  )
}
