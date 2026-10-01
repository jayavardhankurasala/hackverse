'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentDemoUser, setCurrentDemoUser, getAllDemoUsers } from '@/lib/demo/demo-service'
import { DemoUser } from '@/lib/demo/types'
import { ChevronDown, Sparkles, User, Wrench, Shield, Check } from 'lucide-react'

export function DemoModeBadge() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<DemoUser | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setCurrentUser(getCurrentDemoUser())

    const handleUserChange = () => {
      setCurrentUser(getCurrentDemoUser())
    }

    window.addEventListener('demo-user-changed', handleUserChange)
    return () => window.removeEventListener('demo-user-changed', handleUserChange)
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!currentUser) return null

  const allUsers = getAllDemoUsers()

  const handleSelectUser = (user: DemoUser) => {
    setCurrentDemoUser(user.id)
    setIsOpen(false)
    if (user.role === 'STUDENT') {
      router.push('/student/dashboard')
    } else if (user.role === 'STAFF') {
      router.push('/staff/dashboard')
    } else {
      router.push('/admin/dashboard')
    }
  }

  const roleIcon = (role: string) => {
    if (role === 'STUDENT') return <User className="w-3.5 h-3.5 text-emerald-600" />
    if (role === 'STAFF') return <Wrench className="w-3.5 h-3.5 text-blue-600" />
    return <Shield className="w-3.5 h-3.5 text-purple-600" />
  }

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition shadow-2xs cursor-pointer"
        title="Interactive Demo Mode: Click to switch simulated campus user accounts"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="font-semibold">Demo Mode:</span>
        <span className="text-slate-700 max-w-[140px] truncate">{currentUser.name}</span>
        <span className="text-[10px] px-1.5 py-0.2 rounded bg-white text-emerald-700 font-bold border border-emerald-200 uppercase">
          {currentUser.role}
        </span>
        <ChevronDown className="w-3 h-3 text-emerald-700" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in-50 zoom-in-95">
          <div className="px-3.5 py-2 border-b border-slate-100">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Simulated Campus Persona</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Switch role instantly to test end-to-end workflows
            </p>
          </div>

          <div className="max-h-72 overflow-y-auto p-1.5 space-y-1">
            <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Students
            </div>
            {allUsers
              .filter((u) => u.role === 'STUDENT')
              .map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleSelectUser(u)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition cursor-pointer ${
                    currentUser.id === u.id
                      ? 'bg-emerald-50 text-emerald-900 font-semibold'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    {roleIcon(u.role)}
                    <div className="truncate">
                      <p className="truncate leading-tight">{u.name}</p>
                      <p className="text-[10px] text-slate-400 leading-tight">
                        {u.hostel} • {u.room}
                      </p>
                    </div>
                  </div>
                  {currentUser.id === u.id && (
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  )}
                </button>
              ))}

            <div className="px-2 pt-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-t border-slate-100">
              Staff Specialists
            </div>
            {allUsers
              .filter((u) => u.role === 'STAFF')
              .map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleSelectUser(u)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition cursor-pointer ${
                    currentUser.id === u.id
                      ? 'bg-emerald-50 text-emerald-900 font-semibold'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    {roleIcon(u.role)}
                    <div className="truncate">
                      <p className="truncate leading-tight">{u.name}</p>
                      <p className="text-[10px] text-slate-400 leading-tight">
                        {u.department} ({u.specialization?.split(',')[0]})
                      </p>
                    </div>
                  </div>
                  {currentUser.id === u.id && (
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  )}
                </button>
              ))}

            <div className="px-2 pt-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-t border-slate-100">
              Central Administration
            </div>
            {allUsers
              .filter((u) => u.role === 'ADMIN')
              .map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleSelectUser(u)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition cursor-pointer ${
                    currentUser.id === u.id
                      ? 'bg-emerald-50 text-emerald-900 font-semibold'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    {roleIcon(u.role)}
                    <div className="truncate">
                      <p className="truncate leading-tight">{u.name}</p>
                      <p className="text-[10px] text-slate-400 leading-tight">
                        Command Superuser
                      </p>
                    </div>
                  </div>
                  {currentUser.id === u.id && (
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  )}
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
