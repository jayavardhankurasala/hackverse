'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  Users, 
  GraduationCap, 
  Wrench, 
  Laptop, 
  Lightbulb, 
  Droplet, 
  Hammer, 
  Home, 
  Bus, 
  Sparkle, 
  Building, 
  AlertCircle,
  ShieldAlert,
  CheckCircle,
} from 'lucide-react'
import { PriorityBadge } from '@/components/ui/PriorityBadge'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { DEMO_USERS } from '@/lib/demo/mock-data'
import { setCurrentDemoUser } from '@/lib/demo/demo-service'

export default function LandingPage() {
  const [showDemoMenu, setShowDemoMenu] = useState(false)

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

  const serviceCategories = [
    { name: 'IT Support', icon: Laptop, desc: 'Computers, Wi-Fi networks, projectors, academic labs' },
    { name: 'Electrical', icon: Lightbulb, desc: 'Lighting, power sockets, ceiling fans, breaker trips' },
    { name: 'Plumbing', icon: Droplet, desc: 'Water leakages, tap fittings, washroom lines, water coolers' },
    { name: 'Maintenance', icon: Hammer, desc: 'Doors, window latches, furniture repairs, lock replacement' },
    { name: 'Hostel Amenities', icon: Home, desc: 'Room cupboards, hostel facilities, shared common areas' },
    { name: 'Transport', icon: Bus, desc: 'Campus shuttle logistics, college bus passes, parking' },
    { name: 'Cleaning & Sanitation', icon: Sparkle, desc: 'Hostel corridors, washroom hygiene, waste disposal' },
    { name: 'Administration', icon: Building, desc: 'Security desk, ID cards, departmental inquiries' },
  ]

  const workflowSteps = [
    {
      step: '01',
      title: 'Student Reports Grievance',
      desc: 'Student logs issue with hostel block, room number, description, and optional photo attachment.',
      icon: GraduationCap,
    },
    {
      step: '02',
      title: 'Groq AI Llama-3.3 Triage',
      desc: 'Groq AI instantly analyzes incident text, predicts urgency (Critical/High), sets SLA, and routes to the specialist.',
      icon: Sparkles,
    },
    {
      step: '03',
      title: 'Technician Resolution',
      desc: 'Assigned specialist starts repair, uploads completion notes, and closes the ticket loop.',
      icon: Wrench,
    },
    {
      step: '04',
      title: 'Admin Oversight & Rating',
      desc: 'Central administrators monitor college SLA response times, while students rate the completed service.',
      icon: ShieldCheck,
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-emerald-100 selection:text-emerald-900 font-sans">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo Badge on Top-Left Edge */}
          <div className="flex items-center space-x-3">
            <img
              src="/svec-logo.png"
              alt="Sri Vasavi Engineering College Logo"
              className="w-10 h-10 object-contain shrink-0 drop-shadow-xs"
            />
            <div>
              <span className="font-extrabold text-slate-900 text-lg tracking-tight">
                SVEC<span className="text-emerald-600">helpdesk</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold text-slate-400">
                Sri Vasavi Engineering College
              </span>
            </div>
          </div>

          {/* High-Contrast Nav Actions */}
          <div className="flex items-center space-x-3">
            <Link
              href="/login"
              className="text-xs font-bold text-slate-700 hover:text-slate-900 px-3.5 py-2 rounded-xl hover:bg-slate-100 transition"
            >
              Sign In
            </Link>
            <Link
              href="/register?role=student"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm"
            >
              <span>Student Register</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* College Tag */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
          <span>Sri Vasavi Engineering College</span>
          <span className="text-emerald-400">•</span>
          <span className="text-emerald-700">Official Facilities Helpdesk</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.12]">
          Report Campus & Hostel Issues. Track Progress. <span className="text-emerald-600">Resolve Faster.</span>
        </h1>

        <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          The unified digital service platform connecting SVEC students, hostel residents, maintenance technicians, and college administrators for lightning-fast facilities resolution.
        </p>

        {/* High-Contrast Primary CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
          <Link
            href="/login?role=student"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <GraduationCap className="w-4 h-4" />
            <span>Student Sign In & Report</span>
          </Link>

          <Link
            href="/login?role=staff"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Wrench className="w-4 h-4" />
            <span>Technician & Staff Portal</span>
          </Link>
        </div>

        {/* 2 Main Portal Info Cards */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-3xl mx-auto text-left">
          <Link
            href="/login?role=student"
            className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-md transition group"
          >
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base flex items-center justify-between">
              <span>Student Service Desk</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition" />
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Log room repairs, Wi-Fi glitches, or electrical faults in your hostel block. Track every milestone live and rate service quality.
            </p>
          </Link>

          <Link
            href="/login?role=staff"
            className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-blue-500 hover:shadow-md transition group"
          >
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Wrench className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base flex items-center justify-between">
              <span>Field Technician Hub</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition" />
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Dedicated queue strictly filtered for your domain (Plumbing, Electrical, IT, etc.). Commence work and log completion notes.
            </p>
          </Link>
        </div>

        {/* Live Ticket Card Simulation */}
        <div className="mt-14 max-w-4xl mx-auto rounded-2xl bg-white border border-slate-200 shadow-md p-6 text-left">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                CR-1001
              </span>
              <PriorityBadge priority="HIGH" />
              <StatusBadge status="IN_PROGRESS" />
              <span className="text-xs text-slate-500 font-medium">IT Support • SVEC Hostel Block A</span>
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-slate-500">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Assigned: Vikram Rao (Network Specialist)</span>
            </div>
          </div>

          <h3 className="text-base font-bold text-slate-900 mb-1">
            Wi-Fi connection unstable in room A-204
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
            "Signal keeps dropping on the second floor wing. Students preparing for semester lab examinations cannot connect."
          </p>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-emerald-700 bg-emerald-50/80 px-2.5 py-1 rounded-md">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-semibold">AI Match: IT Support (99% confidence) &bull; SLA: 4 Hours</span>
            </div>
            <Link href="/login" className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center space-x-1">
              <span>Sign In to Track</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* The Problem vs Solution Comparison Section */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Why SVEChelpdesk?
            </h2>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              Solving Campus Grievances at Scale
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-sm">
                ✕
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Traditional Hostel Registers</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Complaints written in paper books at warden offices or sent on WhatsApp groups get easily lost or forgotten with zero accountability.
              </p>
              <div className="pt-2 border-t border-slate-200 text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" />
                <span>SVEC Solution: Centralized Digital Ticket Tracking</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
                !
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Delayed Triage & Hazards</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Critical hazards like sparking sockets or bathroom water flooding sit for days in the same queue as minor cosmetic touch-ups.
              </p>
              <div className="pt-2 border-t border-slate-200 text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" />
                <span>SVEC Solution: Groq AI Instant Severity Triage</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                ?
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Status Black Hole</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Students have no visibility into whether anyone has acknowledged their request, who is assigned, or when repairs will occur.
              </p>
              <div className="pt-2 border-t border-slate-200 text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" />
                <span>SVEC Solution: Real-Time Milestones & 2-Way Chat</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step Workflow Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-600">
            Streamlined Resolution
          </h2>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            How Facilities Requests Get Solved
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {workflowSteps.map((ws) => {
            const Icon = ws.icon
            return (
              <div key={ws.step} className="p-6 rounded-2xl bg-white border border-slate-200 relative shadow-2xs">
                <span className="text-3xl font-black text-emerald-600/20 font-mono absolute top-4 right-5">
                  {ws.step}
                </span>
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-sm mb-1.5">{ws.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{ws.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* 8 Campus Service Domains */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Department Coverage
            </h2>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              8 Specialized Campus Service Domains
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {serviceCategories.map((cat) => {
              const Icon = cat.icon
              return (
                <div
                  key={cat.name}
                  className="p-5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition"
                >
                  <div className="w-9 h-9 rounded-lg bg-white text-slate-700 flex items-center justify-center mb-3 shadow-2xs">
                    <Icon className="w-4 h-4 text-emerald-600" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">{cat.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{cat.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-16 bg-slate-900 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sri Vasavi Engineering College Operations</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Ready to report or track a campus facility request?
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
            Sign in with your registered college credentials to access your personalized student or technician portal.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login"
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition"
            >
              Sign In to SVEChelpdesk &rarr;
            </Link>
            <Link
              href="/register?role=student"
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 transition"
            >
              Create Student Account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <img
              src="/svec-logo.png"
              alt="SVEC Logo"
              className="w-6 h-6 object-contain shrink-0"
            />
            <span className="font-extrabold text-slate-800">SVEChelpdesk</span>
            <span>&bull;</span>
            <span>Sri Vasavi Engineering College</span>
            <span>&bull;</span>
            <span>Campus & Hostel Facilities Desk</span>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/login?role=student" className="hover:text-emerald-600 transition">Student Portal</Link>
            <Link href="/login?role=staff" className="hover:text-emerald-600 transition">Staff Hub</Link>
            <Link href="/login" className="hover:text-emerald-600 transition font-bold text-emerald-700">Sign In</Link>
          </div>
        </div>
      </footer>

      {/* Discrete Bottom-Right Floating Demo Mode Button strictly in corner */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          type="button"
          onClick={() => setShowDemoMenu(!showDemoMenu)}
          className="px-3 py-2 bg-slate-900/90 hover:bg-slate-900 text-white rounded-full text-xs font-medium shadow-lg backdrop-blur-sm border border-slate-700 flex items-center space-x-1.5 transition-all hover:scale-105 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Demo Mode</span>
        </button>

        {showDemoMenu && (
          <div className="absolute bottom-12 right-0 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 space-y-3 animate-in fade-in slide-in-from-bottom-2 text-slate-900 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Evaluator Quick Demo
              </span>
              <button
                onClick={() => setShowDemoMenu(false)}
                className="text-[11px] text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Test any role instantly with pre-populated campus data:
            </p>

            <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
              <div className="text-[10px] font-bold uppercase text-slate-400 px-1 pt-1">Students</div>
              {DEMO_USERS['student-1'] && (
                <button
                  onClick={() => handleLaunchDemo('student-1')}
                  className="w-full text-left p-2 rounded-lg hover:bg-emerald-50 text-xs flex items-center justify-between border border-transparent hover:border-emerald-200 transition"
                >
                  <span className="font-semibold text-slate-800">{DEMO_USERS['student-1'].name}</span>
                  <span className="text-[10px] text-emerald-600 font-mono">Hostel A</span>
                </button>
              )}

              <div className="text-[10px] font-bold uppercase text-slate-400 px-1 pt-2">Technicians</div>
              {DEMO_USERS['staff-1'] && (
                <button
                  onClick={() => handleLaunchDemo('staff-1')}
                  className="w-full text-left p-2 rounded-lg hover:bg-blue-50 text-xs flex items-center justify-between border border-transparent hover:border-blue-200 transition"
                >
                  <span className="font-semibold text-slate-800">{DEMO_USERS['staff-1'].name}</span>
                  <span className="text-[10px] text-blue-600 font-mono">IT Specialist</span>
                </button>
              )}

              <div className="text-[10px] font-bold uppercase text-slate-400 px-1 pt-2">Administrators</div>
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
