'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
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
  ShieldAlert,
  KeyRound,
} from 'lucide-react'
import { DEMO_USERS } from '@/lib/demo/mock-data'
import { setCurrentDemoUser } from '@/lib/demo/demo-service'
import { createClient } from '@/utils/supabase/client'

function LoginForm() {
  const searchParams = useSearchParams()
  const initialRole = (searchParams.get('role') || 'student').toLowerCase()
  const [activeTab, setActiveTab] = useState<'student' | 'staff' | 'admin'>(
    initialRole === 'admin' ? 'admin' : initialRole === 'staff' ? 'staff' : 'student'
  )

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  // Discrete Bottom-Right Demo Floating Widget
  const [showDemoMenu, setShowDemoMenu] = useState(false)

  const allUsers = Object.values(DEMO_USERS)
  const studentUsers = allUsers.filter((u) => u.role === 'STUDENT')
  const staffUsers = allUsers.filter((u) => u.role === 'STAFF')
  const adminUsers = allUsers.filter((u) => u.role === 'ADMIN')

  const handleLaunchDemo = (userId: string) => {
    const user = DEMO_USERS[userId]
    if (!user) return
    setCurrentDemoUser(user.id)
    if (user.role === 'STUDENT') {
      window.location.href = '/student/dashboard'
    } else if (user.role === 'STAFF') {
      window.location.href = '/staff/dashboard'
    } else {
      window.location.href = '/admin/dashboard'
    }
  }

  const switchTab = (tab: 'student' | 'staff' | 'admin') => {
    setActiveTab(tab)
    setErrorMessage(null)
    if (tab === 'admin') {
      setEmail('admin@campus')
      setPassword('Vasavi@123')
    } else {
      if (email === 'admin@campus') setEmail('')
      if (password === 'Vasavi@123') setPassword('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage(null)

    const cleanEmail = email.trim().toLowerCase()

    // 1. Direct Master Administrator Access (Hardcoded & Pre-provisioned)
    if (
      (cleanEmail === 'admin@campus' || cleanEmail === 'admin@svec.edu.in') &&
      password === 'Vasavi@123'
    ) {
      try {
        const supabase = createClient()
        await supabase.auth.signInWithPassword({
          email: 'admin@campus',
          password: 'Vasavi@123',
        })
      } catch {}

      try {
        localStorage.removeItem('force_demo_mode')
        localStorage.removeItem('campus_demo_current_user')
      } catch {}

      window.location.href = '/admin/dashboard'
      return
    }

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      })

      if (error) {
        setErrorMessage(error.message || 'Invalid credentials. Please verify your email and password.')
        setLoading(false)
        return
      }

      if (data?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, full_name, student_id')
          .eq('user_id', data.user.id)
          .maybeSingle()

        const userRole = (profile?.role || data.user.user_metadata?.role || 'STUDENT').toUpperCase()

        try {
          localStorage.removeItem('force_demo_mode')
          localStorage.removeItem('campus_demo_current_user')
        } catch {}

        const targetRoute =
          userRole === 'STAFF'
            ? '/staff/dashboard'
            : userRole === 'ADMIN'
            ? '/admin/dashboard'
            : '/student/dashboard'

        window.location.href = targetRoute
        return
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Authentication failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 sm:p-6 text-slate-900 font-sans relative">
      <div className="w-full max-w-md relative z-10">
        {/* Back to Home Link */}
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            <span>Back to SVEChelpdesk Portal</span>
          </Link>
        </div>

        {/* Main 3-Portal Auth Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
          {/* Brand Header */}
          <div className="p-6 text-center border-b border-slate-100 bg-linear-to-b from-slate-50 to-white">
            <div className="inline-flex items-center space-x-2.5 mb-2">
              <img
                src="/svec-logo.png"
                alt="Sri Vasavi Engineering College Logo"
                className="w-10 h-10 object-contain shrink-0 drop-shadow-xs"
              />
              <span className="font-extrabold text-xl tracking-tight text-slate-900">
                SVEC<span className="text-emerald-600">helpdesk</span>
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Sri Vasavi Engineering College &bull; Campus & Hostel Facilities Operations
            </p>
          </div>

          {/* THREE EQUAL CLEAN SIGN-IN TABS */}
          <div className="grid grid-cols-3 bg-slate-100/90 p-1.5 border-b border-slate-200 text-xs font-semibold text-center gap-1">
            <button
              type="button"
              onClick={() => switchTab('student')}
              className={`py-2.5 px-1 sm:px-2 rounded-xl flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer text-[11px] sm:text-xs ${
                activeTab === 'student'
                  ? 'bg-white text-emerald-700 shadow-xs border border-emerald-200 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Student Portal</span>
            </button>

            <button
              type="button"
              onClick={() => switchTab('staff')}
              className={`py-2.5 px-1 sm:px-2 rounded-xl flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer text-[11px] sm:text-xs ${
                activeTab === 'staff'
                  ? 'bg-white text-blue-700 shadow-xs border border-blue-200 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Wrench className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Staff Hub</span>
            </button>

            <button
              type="button"
              onClick={() => switchTab('admin')}
              className={`py-2.5 px-1 sm:px-2 rounded-xl flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer text-[11px] sm:text-xs ${
                activeTab === 'admin'
                  ? 'bg-white text-purple-700 shadow-xs border border-purple-200 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Admin Portal</span>
            </button>
          </div>

          {/* Form Content */}
          <div className="p-6 sm:p-7 space-y-4">
            {/* Role Context Pill */}
            <div
              className={`p-3 rounded-xl border text-xs flex items-center space-x-2 ${
                activeTab === 'student'
                  ? 'bg-emerald-50/60 border-emerald-200 text-emerald-800'
                  : activeTab === 'staff'
                  ? 'bg-blue-50/60 border-blue-200 text-blue-800'
                  : 'bg-purple-50/60 border-purple-200 text-purple-800'
              }`}
            >
              {activeTab === 'student' ? (
                <>
                  <GraduationCap className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>Student Access:</strong> Report hostel/room defects, track repairs, and view live status.
                  </span>
                </>
              ) : activeTab === 'staff' ? (
                <>
                  <Wrench className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    <strong>Technician Access:</strong> View department queue, update progress, and log resolutions.
                  </span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>
                    <strong>Master Administrator:</strong> Campus operations command, resource allocation & escalation.
                  </span>
                </>
              )}
            </div>

            {errorMessage && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2 text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  {activeTab === 'admin'
                    ? 'Master Admin Identifier / Email'
                    : activeTab === 'staff'
                    ? 'Staff Campus Email'
                    : 'Student College Email'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    placeholder={
                      activeTab === 'admin'
                        ? 'admin@campus'
                        : activeTab === 'staff'
                        ? 'staff@svec.edu.in'
                        : 'student@svec.edu.in'
                    }
                    className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Password
                  </label>
                  {activeTab !== 'admin' && (
                    <Link
                      href="/forgot-password"
                      className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold"
                    >
                      Forgot password?
                    </Link>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-white shadow-2xs transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'student'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : activeTab === 'staff'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in securely...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {activeTab === 'student'
                        ? 'Sign In as Student'
                        : activeTab === 'staff'
                        ? 'Sign In as Technician'
                        : 'Sign In as Administrator'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Registration Prompts or Master Admin Info */}
            {activeTab !== 'admin' ? (
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
                <span>Need an account?</span>
                <div>
                  {activeTab === 'student' ? (
                    <Link
                      href="/register?role=student"
                      className="text-emerald-700 hover:text-emerald-800 font-bold"
                    >
                      Register Student Account &rarr;
                    </Link>
                  ) : (
                    <Link
                      href="/register?role=staff"
                      className="text-blue-700 hover:text-blue-800 font-bold"
                    >
                      Register Staff Account &rarr;
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <div className="pt-3 border-t border-slate-100 text-center text-[11px] text-slate-400">
                Master Administrator credentials: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono">admin@campus</code> &bull; <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono">Vasavi@123</code>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Discrete Bottom-Right Floating Demo Mode Button strictly placed in corner */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          type="button"
          onClick={() => setShowDemoMenu(!showDemoMenu)}
          className="px-3 py-2 bg-slate-900/90 hover:bg-slate-900 text-white rounded-full text-xs font-medium shadow-lg backdrop-blur-sm border border-slate-700 flex items-center space-x-1.5 transition-all hover:scale-105 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Demo Personas</span>
        </button>

        {showDemoMenu && (
          <div className="absolute bottom-12 right-0 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 space-y-3 animate-in fade-in slide-in-from-bottom-2 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Instant Demo Access
              </span>
              <button
                onClick={() => setShowDemoMenu(false)}
                className="text-[11px] text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              One-click testing for evaluators without credentials:
            </p>

            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              <div className="text-[10px] font-bold uppercase text-slate-400 px-1 pt-1">Students</div>
              {studentUsers.slice(0, 2).map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleLaunchDemo(u.id)}
                  className="w-full text-left p-2 rounded-lg hover:bg-emerald-50 text-xs flex items-center justify-between border border-transparent hover:border-emerald-200 transition"
                >
                  <span className="font-semibold text-slate-800">{u.name}</span>
                  <span className="text-[10px] text-emerald-600 font-mono">{u.hostel}</span>
                </button>
              ))}

              <div className="text-[10px] font-bold uppercase text-slate-400 px-1 pt-2">Technicians</div>
              {staffUsers.slice(0, 2).map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleLaunchDemo(u.id)}
                  className="w-full text-left p-2 rounded-lg hover:bg-blue-50 text-xs flex items-center justify-between border border-transparent hover:border-blue-200 transition"
                >
                  <span className="font-semibold text-slate-800">{u.name}</span>
                  <span className="text-[10px] text-blue-600 font-mono">{u.department}</span>
                </button>
              ))}

              <div className="text-[10px] font-bold uppercase text-slate-400 px-1 pt-2">Administrators</div>
              {adminUsers.slice(0, 1).map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleLaunchDemo(u.id)}
                  className="w-full text-left p-2 rounded-lg hover:bg-purple-50 text-xs flex items-center justify-between border border-transparent hover:border-purple-200 transition"
                >
                  <span className="font-semibold text-slate-800">{u.name}</span>
                  <span className="text-[10px] text-purple-600 font-bold">Admin</span>
                </button>
              ))}
            </div>
          </div>
        )}
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
