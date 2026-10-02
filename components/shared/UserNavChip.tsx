'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { GraduationCap, Wrench, ShieldCheck, LogOut, Camera, Loader2 } from 'lucide-react'
import { logout, updateAvatarUrl } from '@/actions/auth'
import { getCurrentDemoUser } from '@/lib/demo/demo-service'
import { NotificationBell } from '@/components/notifications/NotificationBell'

interface ActiveProfile {
  id: string
  userId: string
  fullName: string
  email: string
  role: 'STUDENT' | 'STAFF' | 'ADMIN'
  studentId?: string | null
  rollNumber?: string | null
  branch?: string | null
  year?: string | null
  departmentName?: string | null
  avatarUrl?: string | null
}

export function UserNavChip({ expectedRole }: { expectedRole?: 'student' | 'staff' | 'admin' }) {
  const [profile, setProfile] = useState<ActiveProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let isMounted = true

    async function checkAuth() {
      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        const user = session?.user || (await supabase.auth.getUser()).data.user

        if (user && isMounted) {
          // Immediately set optimistic profile from session metadata to eliminate render lag
          const metaRole = (user.user_metadata?.role || 'STUDENT').toUpperCase() as 'STUDENT' | 'STAFF' | 'ADMIN'
          const metaName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Campus User'
          const metaId = user.user_metadata?.roll_number || user.user_metadata?.student_id || null

          setProfile({
            id: user.id,
            userId: user.id,
            fullName: metaName,
            email: user.email || '',
            role: metaRole,
            studentId: metaId,
            rollNumber: metaId,
            branch: user.user_metadata?.branch || null,
            year: user.user_metadata?.year || null,
            departmentName: null,
            avatarUrl: user.user_metadata?.avatar_url || null,
          })
          setLoading(false)

          // Fetch full DB profile in the background
          const { data: dbProfile } = await supabase
            .from('profiles')
            .select('*, departments(id, name)')
            .eq('user_id', user.id)
            .maybeSingle()

          if (dbProfile && isMounted) {
            const role = (dbProfile.role || user.user_metadata?.role || 'STUDENT').toUpperCase() as 'STUDENT' | 'STAFF' | 'ADMIN'
            const fullName = dbProfile.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Campus User'
            const studentId = dbProfile.roll_number || dbProfile.student_id || user.user_metadata?.roll_number || user.user_metadata?.student_id || null
            const departmentName = dbProfile.departments?.name || (typeof dbProfile.department_id === 'string' ? dbProfile.department_id : null)

            setProfile({
              id: dbProfile.id || user.id,
              userId: user.id,
              fullName,
              email: user.email || '',
              role,
              studentId,
              rollNumber: studentId,
              branch: dbProfile.branch || user.user_metadata?.branch || null,
              year: dbProfile.year || user.user_metadata?.year || null,
              departmentName,
              avatarUrl: dbProfile.avatar_url || user.user_metadata?.avatar_url || null,
            })
          }
          return
        }

        // Fallback to active demo session if no live Supabase auth token
        const demoUser = getCurrentDemoUser()
        if (demoUser && isMounted) {
          setProfile({
            id: demoUser.id,
            userId: demoUser.id,
            fullName: demoUser.name,
            email: demoUser.email,
            role: demoUser.role as any,
            studentId: (demoUser as any).studentId || (demoUser as any).rollNo || null,
            departmentName: (demoUser as any).department || null,
            avatarUrl: demoUser.avatarUrl || null,
          })
        }
      } catch (err) {
        console.warn('UserNavChip fetch notice:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    checkAuth()

    return () => {
      isMounted = false
    }
  }, [])

  const handleSignOut = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch {}

    try {
      localStorage.removeItem('campus_demo_current_user')
      localStorage.removeItem('force_demo_mode')
    } catch {}

    try {
      await logout()
    } catch {}

    window.location.href = '/login'
  }

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile) return

    setUploading(true)

    try {
      const supabase = createClient()
      const fileExt = file.name.split('.').pop() || 'jpg'
      const filePath = `${profile.userId}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) {
        console.warn('Avatar storage upload warning:', uploadError.message)
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Update in database
      await updateAvatarUrl(publicUrl)

      // Immediate state update
      setProfile((prev) => (prev ? { ...prev, avatarUrl: publicUrl } : null))
    } catch (err: any) {
      console.error('Avatar update failed:', err)
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center space-x-2 animate-pulse">
        <div className="w-8 h-8 rounded-full bg-slate-200" />
        <div className="w-24 h-4 rounded bg-slate-200 hidden sm:block" />
      </div>
    )
  }

  if (!profile) {
    return null
  }

  const isStudent = profile.role === 'STUDENT'
  const isStaff = profile.role === 'STAFF'
  const isAdmin = profile.role === 'ADMIN'

  const roleBadgeStyle = isStudent
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : isStaff
    ? 'bg-blue-50 text-blue-700 border-blue-200'
    : 'bg-purple-50 text-purple-700 border-purple-200'

  const baseRoute = isStudent ? '/student' : isStaff ? '/staff' : '/admin'

  return (
    <div className="flex items-center space-x-2.5">
      {/* Hidden File Input for Avatar Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAvatarFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* 1. User Profile Avatar & Name Chip */}
      <div className="flex items-center space-x-2 bg-slate-50 hover:bg-slate-100/80 px-2 py-1.5 rounded-full border border-slate-200 shadow-2xs transition">
        {/* Avatar with Camera Overlay Trigger */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="relative w-7 h-7 rounded-full bg-slate-200 overflow-hidden cursor-pointer group shrink-0 border border-slate-300"
          title="Click to update profile photo"
        >
          {uploading ? (
            <div className="w-full h-full flex items-center justify-center bg-slate-900/60 text-white">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            </div>
          ) : profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.fullName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-emerald-600 text-white font-bold text-xs">
              {profile.fullName.charAt(0).toUpperCase()}
            </div>
          )}

          {/* Hover overlay hint */}
          <div className="absolute inset-0 bg-black/40 items-center justify-center text-white hidden group-hover:flex transition">
            <Camera className="w-3 h-3" />
          </div>
        </div>

        {/* Name and ID */}
        <div className="flex items-center space-x-1.5 text-xs pr-1">
          <span className="font-bold text-slate-800 max-w-[110px] sm:max-w-[140px] truncate">
            {profile.fullName}
          </span>

          {/* Role Badge */}
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded-md font-extrabold uppercase border ${roleBadgeStyle}`}
          >
            {profile.role}
          </span>

          {/* Student: Roll Number & Branch */}
          {isStudent && profile.studentId && (
            <span className="hidden xl:inline text-[11px] font-mono text-slate-500 font-medium">
              • {profile.studentId} {profile.branch ? `(${profile.branch})` : ''}
            </span>
          )}

          {/* Staff: Department Domain */}
          {isStaff && profile.departmentName && (
            <span className="hidden xl:inline text-[11px] font-semibold text-blue-600">
              • {profile.departmentName}
            </span>
          )}

          {/* Admin: Operations Command */}
          {isAdmin && (
            <span className="hidden xl:inline text-[11px] font-semibold text-purple-600">
              • Central Operations
            </span>
          )}
        </div>
      </div>

      {/* 2. Enlarged Notification Bell with Badge */}
      <NotificationBell baseRoute={baseRoute} />

      {/* 3. Clean Logout Button */}
      <button
        onClick={handleSignOut}
        className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition cursor-pointer shadow-2xs"
        title="Sign Out of SVEChelpdesk"
      >
        <LogOut className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Logout</span>
      </button>
    </div>
  )
}
