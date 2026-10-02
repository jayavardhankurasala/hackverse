'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
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
  Phone,
  BookOpen,
  Calendar,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'
import { registerStudent, registerStaff } from '@/actions/auth'
import { createClient } from '@/lib/supabase/client'
import { DEMO_USERS } from '@/lib/demo/mock-data'
import { setCurrentDemoUser } from '@/lib/demo/demo-service'

const CAMPUS_BRANCHES = [
  'Computer Science & Engineering (CSE)',
  'Information Technology (IT)',
  'Artificial Intelligence & Machine Learning (AI/ML)',
  'Electronics & Communication Engineering (ECE)',
  'Electrical & Electronics Engineering (EEE)',
  'Mechanical Engineering (ME)',
  'Civil Engineering (CE)',
  'Other Campus Department',
]

const ACADEMIC_YEARS = [
  '1st Year (Freshman)',
  '2nd Year (Sophomore)',
  '3rd Year (Junior)',
  '4th Year (Senior)',
  'Post-Graduate / M.Tech / MBA',
]

const DEFAULT_DEPARTMENTS = [
  { id: '7bf9e2dc-0b38-4e9e-bcb5-2c2d6b05efde', name: 'IT Support (Wi-Fi, Networks, Computers)' },
  { id: '52b9246c-15a1-4107-b8b3-a379cf005331', name: 'Electrical (Lighting, Breakers, Sockets)' },
  { id: '302a444b-8cf1-44de-9be7-1f245455a180', name: 'Plumbing (Water supply, Drainage, Leaks)' },
  { id: 'bb0efb4b-65fb-415a-8f0f-65c3873d56fb', name: 'Maintenance (Carpentry & Facilities Maintenance)' },
  { id: 'a8ba437f-77a6-4ef3-9ae3-0d97fde6fbfe', name: 'Hostel & Residential Amenities' },
  { id: '5e85b851-d564-4d18-bc05-9a602477cca8', name: 'Transport & Campus Logistics' },
  { id: '3cf78ab1-d347-4009-b384-70178b4c948b', name: 'Cleaning (Sanitation & Housekeeping)' },
  { id: '5c077125-0603-469b-a93d-538639045c2f', name: 'Administration & Security Desk' },
]

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialRole = (searchParams.get('role') || 'student').toLowerCase()
  const [activeTab, setActiveTab] = useState<'student' | 'staff'>(
    initialRole === 'staff' ? 'staff' : 'student'
  )

  // Student Fields
  const [studentFullName, setStudentFullName] = useState('')
  const [studentEmail, setStudentEmail] = useState('')
  const [studentRollNo, setStudentRollNo] = useState('')
  const [studentBranch, setStudentBranch] = useState(CAMPUS_BRANCHES[0])
  const [studentYear, setStudentYear] = useState(ACADEMIC_YEARS[0])
  const [studentPhone, setStudentPhone] = useState('')
  const [studentPassword, setStudentPassword] = useState('')
  const [studentConfirmPassword, setStudentConfirmPassword] = useState('')

  // Staff Fields
  const [staffFullName, setStaffFullName] = useState('')
  const [staffEmail, setStaffEmail] = useState('')
  const [staffPhone, setStaffPhone] = useState('')
  const [staffDepartmentId, setStaffDepartmentId] = useState('')
  const [staffPassword, setStaffPassword] = useState('')
  const [staffConfirmPassword, setStaffConfirmPassword] = useState('')

  // State
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([])
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showDemoMenu, setShowDemoMenu] = useState(false)

  // Student Password Match Logic
  const studentHasEnteredBoth = studentPassword.length > 0 && studentConfirmPassword.length > 0
  const studentPasswordsMatch = studentHasEnteredBoth && studentPassword === studentConfirmPassword && studentPassword.length >= 6
  const studentPasswordsMismatch = studentHasEnteredBoth && studentPassword !== studentConfirmPassword

  // Staff Password Match Logic
  const staffHasEnteredBoth = staffPassword.length > 0 && staffConfirmPassword.length > 0
  const staffPasswordsMatch = staffHasEnteredBoth && staffPassword === staffConfirmPassword && staffPassword.length >= 6
  const staffPasswordsMismatch = staffHasEnteredBoth && staffPassword !== staffConfirmPassword

  useEffect(() => {
    async function loadDepts() {
      try {
        const supabase = createClient()
        const { data } = await supabase.from('departments').select('id, name').order('name')
        if (data && data.length > 0) {
          setDepartments(data)
          setStaffDepartmentId(data[0].id)
        } else {
          setDepartments(DEFAULT_DEPARTMENTS)
          setStaffDepartmentId(DEFAULT_DEPARTMENTS[0].id)
        }
      } catch {
        setDepartments(DEFAULT_DEPARTMENTS)
        setStaffDepartmentId(DEFAULT_DEPARTMENTS[0].id)
      }
    }
    loadDepts()
  }, [])

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

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (studentPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.')
      return
    }

    if (studentPassword !== studentConfirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.')
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('fullName', studentFullName)
      formData.append('email', studentEmail)
      formData.append('studentId', studentRollNo)
      formData.append('rollNumber', studentRollNo)
      formData.append('branch', studentBranch)
      formData.append('year', studentYear)
      formData.append('phone', studentPhone)
      formData.append('password', studentPassword)
      formData.append('confirmPassword', studentConfirmPassword)

      const result = await registerStudent(formData)
      if (result?.error) {
        setErrorMessage(result.error)
        setLoading(false)
      } else if (result?.redirectUrl) {
        window.location.href = result.redirectUrl
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to complete registration.')
      setLoading(false)
    }
  }

  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (staffPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.')
      return
    }

    if (staffPassword !== staffConfirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.')
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('fullName', staffFullName)
      formData.append('email', staffEmail)
      formData.append('phone', staffPhone)
      formData.append('departmentId', staffDepartmentId)
      formData.append('password', staffPassword)
      formData.append('confirmPassword', staffConfirmPassword)

      const result = await registerStaff(formData)
      if (result?.error) {
        setErrorMessage(result.error)
        setLoading(false)
      } else if (result?.redirectUrl) {
        window.location.href = result.redirectUrl
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to complete staff registration.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 sm:p-6 text-slate-900 font-sans relative">
      <div className="w-full max-w-xl relative z-10">
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
            <h1 className="text-base font-bold text-slate-900">Create Campus Account</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Select your role category to register on the Sri Vasavi facilities desk.
            </p>
          </div>

          {/* 2 Main Portals Tabs */}
          <div className="grid grid-cols-2 bg-slate-100/90 p-1.5 border-b border-slate-200 text-xs font-semibold text-center">
            <button
              type="button"
              onClick={() => {
                setActiveTab('student')
                setErrorMessage(null)
              }}
              className={`py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'student'
                  ? 'bg-white text-emerald-700 shadow-xs border border-emerald-200 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Student Registration</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('staff')
                setErrorMessage(null)
              }}
              className={`py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'staff'
                  ? 'bg-white text-blue-700 shadow-xs border border-blue-200 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>Staff / Technician</span>
            </button>
          </div>

          {/* Tab 1: Student Registration Form */}
          {activeTab === 'student' && (
            <div className="p-6 sm:p-7 space-y-4">
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2 text-xs text-rose-700">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleStudentSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={studentFullName}
                        onChange={(e) => setStudentFullName(e.target.value)}
                        placeholder="e.g. Sai Swaroop"
                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                      College Email <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        value={studentEmail}
                        onChange={(e) => setStudentEmail(e.target.value)}
                        placeholder="student@svec.edu.in"
                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                      Roll Number / Student ID <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={studentRollNo}
                        onChange={(e) => setStudentRollNo(e.target.value)}
                        placeholder="e.g. 24A81A05L9"
                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        required
                        value={studentPhone}
                        onChange={(e) => setStudentPhone(e.target.value)}
                        placeholder="e.g. 9876543210"
                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                      Branch / Department <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <select
                        value={studentBranch}
                        onChange={(e) => setStudentBranch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        {CAMPUS_BRANCHES.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                      Academic Year <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <select
                        value={studentYear}
                        onChange={(e) => setStudentYear(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        {ACADEMIC_YEARS.map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Password Fields with Real-Time Match Feedback */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                      Password (min 6 chars) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={studentPassword}
                        onChange={(e) => setStudentPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`w-full pl-9 pr-8 py-2 bg-white border rounded-xl text-xs text-slate-900 placeholder-slate-400 transition-all focus:outline-none ${
                          studentPasswordsMatch
                            ? 'border-emerald-500 ring-2 ring-emerald-500/25 shadow-sm shadow-emerald-500/10'
                            : studentPasswordsMismatch
                            ? 'border-rose-500 ring-2 ring-rose-500/25 shadow-sm shadow-rose-500/10'
                            : 'border-slate-200 focus:ring-2 focus:ring-emerald-500'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                      Confirm Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={studentConfirmPassword}
                        onChange={(e) => setStudentConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`w-full pl-9 pr-3 py-2 bg-white border rounded-xl text-xs text-slate-900 placeholder-slate-400 transition-all focus:outline-none ${
                          studentPasswordsMatch
                            ? 'border-emerald-500 ring-2 ring-emerald-500/25 shadow-sm shadow-emerald-500/10'
                            : studentPasswordsMismatch
                            ? 'border-rose-500 ring-2 ring-rose-500/25 shadow-sm shadow-rose-500/10'
                            : 'border-slate-200 focus:ring-2 focus:ring-emerald-500'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Password Match Status Helper */}
                {studentPasswordsMatch && (
                  <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-1.5 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>✓ Passwords match securely (6+ characters)</span>
                  </div>
                )}
                {studentPasswordsMismatch && (
                  <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-1.5 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>Passwords do not match. Please verify both entries.</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || (studentHasEnteredBoth && !studentPasswordsMatch)}
                  className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-2xs transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Registering Student Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Student Registration</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Tab 2: Staff / Technician Registration Form */}
          {activeTab === 'staff' && (
            <div className="p-6 sm:p-7 space-y-4">
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2 text-xs text-rose-700">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleStaffSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={staffFullName}
                        onChange={(e) => setStaffFullName(e.target.value)}
                        placeholder="e.g. Vikram Rao"
                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                      Staff Email <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        value={staffEmail}
                        onChange={(e) => setStaffEmail(e.target.value)}
                        placeholder="technician@svec.edu.in"
                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                      Phone Number <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        value={staffPhone}
                        onChange={(e) => setStaffPhone(e.target.value)}
                        placeholder="e.g. 9876543210"
                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                      Service Department Group <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <select
                        value={staffDepartmentId}
                        onChange={(e) => setStaffDepartmentId(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {departments.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Password Fields with Real-Time Match Feedback */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                      Password (min 6 chars) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={staffPassword}
                        onChange={(e) => setStaffPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`w-full pl-9 pr-8 py-2 bg-white border rounded-xl text-xs text-slate-900 placeholder-slate-400 transition-all focus:outline-none ${
                          staffPasswordsMatch
                            ? 'border-emerald-500 ring-2 ring-emerald-500/25 shadow-sm shadow-emerald-500/10'
                            : staffPasswordsMismatch
                            ? 'border-rose-500 ring-2 ring-rose-500/25 shadow-sm shadow-rose-500/10'
                            : 'border-slate-200 focus:ring-2 focus:ring-blue-500'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                      Confirm Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={staffConfirmPassword}
                        onChange={(e) => setStaffConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`w-full pl-9 pr-3 py-2 bg-white border rounded-xl text-xs text-slate-900 placeholder-slate-400 transition-all focus:outline-none ${
                          staffPasswordsMatch
                            ? 'border-emerald-500 ring-2 ring-emerald-500/25 shadow-sm shadow-emerald-500/10'
                            : staffPasswordsMismatch
                            ? 'border-rose-500 ring-2 ring-rose-500/25 shadow-sm shadow-rose-500/10'
                            : 'border-slate-200 focus:ring-2 focus:ring-blue-500'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Password Match Status Helper */}
                {staffPasswordsMatch && (
                  <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-1.5 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>✓ Passwords match securely (6+ characters)</span>
                  </div>
                )}
                {staffPasswordsMismatch && (
                  <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-1.5 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>Passwords do not match. Please verify both entries.</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || (staffHasEnteredBoth && !staffPasswordsMatch)}
                  className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-white bg-blue-600 hover:bg-blue-700 shadow-2xs transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Registering Staff Member...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Staff Registration</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Bottom sign-in link */}
          <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 text-center text-xs text-slate-500">
            Already registered on SVEChelpdesk?{' '}
            <Link href="/login" className="text-emerald-700 hover:text-emerald-800 font-bold">
              Sign in here &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Discrete Bottom-Right Floating Demo Mode Button */}
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
              One-click testing for evaluators without signing up:
            </p>

            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              <div className="text-[10px] font-bold uppercase text-slate-400 px-1 pt-1">Students</div>
              {DEMO_USERS['student-1'] && (
                <button
                  onClick={() => handleLaunchDemo('student-1')}
                  className="w-full text-left p-2 rounded-lg hover:bg-emerald-50 text-xs flex items-center justify-between border border-transparent hover:border-emerald-200 transition"
                >
                  <span className="font-semibold text-slate-800">{DEMO_USERS['student-1'].name}</span>
                  <span className="text-[10px] text-emerald-600 font-mono">Student</span>
                </button>
              )}

              <div className="text-[10px] font-bold uppercase text-slate-400 px-1 pt-2">Staff</div>
              {DEMO_USERS['staff-1'] && (
                <button
                  onClick={() => handleLaunchDemo('staff-1')}
                  className="w-full text-left p-2 rounded-lg hover:bg-blue-50 text-xs flex items-center justify-between border border-transparent hover:border-blue-200 transition"
                >
                  <span className="font-semibold text-slate-800">{DEMO_USERS['staff-1'].name}</span>
                  <span className="text-[10px] text-blue-600 font-mono">IT Tech</span>
                </button>
              )}

              <div className="text-[10px] font-bold uppercase text-slate-400 px-1 pt-2">Admin</div>
              {DEMO_USERS['admin-1'] && (
                <button
                  onClick={() => handleLaunchDemo('admin-1')}
                  className="w-full text-left p-2 rounded-lg hover:bg-purple-50 text-xs flex items-center justify-between border border-transparent hover:border-purple-200 transition"
                >
                  <span className="font-semibold text-slate-800">{DEMO_USERS['admin-1'].name}</span>
                  <span className="text-[10px] text-purple-600 font-bold">Admin</span>
                </button>
              )}
            </div>
          </div>
        )}
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
