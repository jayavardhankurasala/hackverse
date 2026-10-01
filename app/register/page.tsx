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
  Building2,
  CheckCircle2,
} from 'lucide-react'
import { register as registerAction } from '@/actions/auth'
import { createClient } from '@/lib/supabase/client'

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
  'Hostel & Facilities',
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
    if (isStaff && data.departmentId) formData.append('departmentId', data.departmentId)

    const result = await registerAction(formData)
    if (result?.error) {
      setServerError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 sm:p-6 text-slate-900 font-sans">
      <div className="w-full max-w-md relative z-10">
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
              {isAdmin ? (
                <ShieldAlert className="w-6 h-6 text-emerald-700" />
              ) : isStaff ? (
                <Wrench className="w-6 h-6 text-emerald-700" />
              ) : (
                <GraduationCap className="w-6 h-6 text-emerald-700" />
              )}
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              {isAdmin
                ? 'Administrator Registration'
                : isStaff
                ? 'Create Staff Account'
                : 'Create Student Account'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {isAdmin
                ? 'System administration access policy'
                : isStaff
                ? 'Register for the campus maintenance & repairs team'
                : 'Register to report facilities requests & track updates'}
            </p>
          </div>

          {/* Role Switcher Tabs */}
          <div className="grid grid-cols-3 bg-slate-100/80 p-1.5 border-b border-slate-200 text-xs font-medium text-center">
            <Link
              href="/register?role=student"
              className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                isStudent
                  ? 'bg-white text-emerald-700 font-bold shadow-2xs border border-emerald-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Student</span>
            </Link>
            <Link
              href="/register?role=staff"
              className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                isStaff
                  ? 'bg-white text-emerald-700 font-bold shadow-2xs border border-emerald-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Staff</span>
            </Link>
            <Link
              href="/register?role=admin"
              className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                isAdmin
                  ? 'bg-white text-emerald-700 font-bold shadow-2xs border border-emerald-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Admin</span>
            </Link>
          </div>

          {isAdmin ? (
            <div className="p-6 sm:p-7 text-center space-y-5">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs text-left leading-relaxed">
                <p className="font-bold text-amber-900 mb-1 flex items-center">
                  <ShieldAlert className="w-4 h-4 text-amber-600 mr-1.5" />
                  Security Policy: Administrator Accounts Pre-provisioned
                </p>
                To maintain campus systems integrity, administrative privileges are assigned directly by IT Systems Administrators. Please sign in with your issued credentials or use the demo login.
              </div>

              <Link
                href="/login?role=admin"
                className="w-full inline-flex justify-center items-center py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs transition-all shadow-2xs"
              >
                Proceed to Administrator Login
              </Link>
            </div>
          ) : (
            <div className="p-6 sm:p-7 space-y-4">
              {serverError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2 text-xs text-rose-700">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{serverError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      {...register('fullName')}
                      type="text"
                      placeholder={isStaff ? 'e.g. Vikram Rao' : 'e.g. Arjun Reddy'}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                    />
                  </div>
                  {errors.fullName && (
                    <p className="mt-1 text-xs text-rose-600 font-medium">{errors.fullName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Campus Email <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      {...register('email')}
                      type="email"
                      placeholder={isStaff ? 'staff@campus.edu' : 'student@campus.edu'}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-xs text-rose-600 font-medium">{errors.email.message}</p>
                  )}
                </div>

                {/* Role-Specific ID Field */}
                {isStudent ? (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                      Student ID <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <input
                        {...register('studentId')}
                        type="text"
                        placeholder="e.g. STU2026001"
                        className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                      Employee / Staff ID <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <input
                        {...register('staffId')}
                        type="text"
                        placeholder="e.g. EMP202601"
                        className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                      />
                    </div>
                  </div>
                )}

                {/* Service Department Selector ONLY FOR STAFF (Removed for students) */}
                {isStaff && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                      Work Domain / Service Department
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <select
                        {...register('departmentId')}
                        className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                        defaultValue="IT Support"
                      >
                        {departments.length > 0
                          ? departments.map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.name}
                              </option>
                            ))
                          : DEFAULT_DEPARTMENTS.map((name) => (
                              <option key={name} value={name}>
                                {name}
                              </option>
                            ))}
                      </select>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
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
                  className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-2xs transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : isStaff ? (
                    'Register as Staff Member'
                  ) : (
                    'Register Student Account'
                  )}
                </button>
              </form>

              <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
                Already registered?{' '}
                <Link
                  href={isStaff ? '/login?role=staff' : '/login?role=student'}
                  className="text-emerald-700 hover:text-emerald-800 font-semibold"
                >
                  Sign in here
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400 text-xs">
          Loading portal...
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  )
}
