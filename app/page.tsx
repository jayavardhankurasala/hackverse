'use client'

import Link from 'next/link'
import {
  GraduationCap,
  Wrench,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  Layers,
  Cpu,
  Zap,
  Building,
  Activity,
  ChevronRight,
  ShieldCheck,
  Server,
  Star,
  Users,
} from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { PriorityBadge } from '@/components/ui/PriorityBadge'

export default function Home() {
  const categories = [
    { name: 'IT Support', desc: 'Wi-Fi, lab workstations, portal access, campus hardware', icon: Cpu, color: 'blue' },
    { name: 'Electrical', desc: 'Power points, lighting, circuit breakers, backup generators', icon: Zap, color: 'amber' },
    { name: 'Plumbing', desc: 'Water supply, drainage, restrooms, washroom fixtures', icon: Activity, color: 'cyan' },
    { name: 'Maintenance', desc: 'Carpentry, window panes, door locks, masonry repairs', icon: Wrench, color: 'emerald' },
    { name: 'Hostel', desc: 'Room amenities, furniture, accommodation facilities', icon: Building, color: 'purple' },
    { name: 'Transport', desc: 'Campus shuttle routes, vehicle parking, mobility services', icon: Layers, color: 'rose' },
    { name: 'Cleaning', desc: 'Janitorial sanitation, spill response, waste management', icon: CheckCircle2, color: 'teal' },
    { name: 'Administration', desc: 'Student documentation, access cards, generic inquiries', icon: Server, color: 'indigo' },
  ]

  const workflowSteps = [
    { status: 'SUBMITTED', title: '1. Ticket Logged', desc: 'Student submits issue with location & photo attachment' },
    { status: 'ASSIGNED', title: '2. Staff Dispatched', desc: 'Admin allocates ticket to department technician' },
    { status: 'IN_PROGRESS', title: '3. Work Underway', desc: 'Technician initiates on-site repair and diagnostics' },
    { status: 'RESOLVED', title: '4. Issue Solved', desc: 'Resolution note and verified completion photo submitted' },
    { status: 'CLOSED', title: '5. Student Rating', desc: 'Student provides 1-5 star rating and ticket is closed' },
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-600/30 selection:text-blue-200 overflow-x-hidden">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-blue-600/15 via-indigo-600/10 to-transparent blur-[140px]" />
        <div className="absolute top-[40%] -left-40 w-[600px] h-[600px] bg-blue-700/10 blur-[150px]" />
        <div className="absolute top-[60%] -right-40 w-[600px] h-[600px] bg-indigo-700/10 blur-[150px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* Top Header Navigation */}
      <header className="relative z-20 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 border border-white/20">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-white tracking-tight text-lg">
                Campus<span className="text-blue-500">Desk</span>
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-blue-950/80 text-blue-400 border border-blue-800/60 rounded-md">
                Command Center
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            <Link
              href="/login?role=student"
              className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-900 transition-colors"
            >
              Student Portal
            </Link>
            <Link
              href="/login?role=staff"
              className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-900 transition-colors"
            >
              Staff Portal
            </Link>
            <Link
              href="/login?role=admin"
              className="text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-700/80 transition-all shadow-xs"
            >
              Admin
            </Link>
          </div>
        </div>
      </header>

      {/* SECTION 1: HERO */}
      <section className="relative z-10 pt-16 sm:pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Tagline Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/70 border border-blue-800/60 text-xs font-semibold text-blue-300 mb-6 shadow-inner backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>Report. Track. Resolve.</span>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          <span className="text-slate-400 font-normal">Campus Facilities 2.0</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
          One campus.{' '}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
            One service desk.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Report campus issues, track progress with realtime timelines, and get problems resolved faster through AI-assisted automated triage.
        </p>

        {/* Three Portal CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-xl mx-auto">
          <Link
            href="/login?role=student"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/25 border border-blue-400/30 transition-all hover:scale-[1.02]"
          >
            <GraduationCap className="w-4 h-4" />
            <span>Student Portal</span>
            <ArrowRight className="w-3.5 h-3.5 text-blue-200" />
          </Link>

          <Link
            href="/login?role=staff"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm text-white bg-slate-900 hover:bg-slate-800 shadow-md border border-slate-700/80 transition-all hover:scale-[1.02]"
          >
            <Wrench className="w-4 h-4 text-indigo-400" />
            <span>Staff Portal</span>
          </Link>

          <Link
            href="/login?role=admin"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm text-slate-300 hover:text-white bg-slate-950 hover:bg-slate-900 border border-slate-800 transition-all hover:scale-[1.02]"
          >
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span>Admin Console</span>
          </Link>
        </div>

        {/* Live System Preview Glass Panel */}
        <div className="mt-16 sm:mt-20 max-w-4xl mx-auto">
          <GlassCard glow="blue" className="p-4 sm:p-6 text-left">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800/80 text-xs">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold text-white">Live Request Stream</span>
                <span className="text-slate-500">| University Central Registry</span>
              </div>
              <span className="text-slate-400 font-mono text-[11px]">Realtime Supabase Sync</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400">#CR-1048</span>
                  <PriorityBadge priority="HIGH" />
                </div>
                <h4 className="text-xs font-semibold text-white">Server Lab AC Compressor Offline</h4>
                <p className="text-[11px] text-slate-400">Engineering Complex &bull; Lab 302</p>
                <div className="pt-1">
                  <StatusBadge status="IN_PROGRESS" />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400">#CR-1049</span>
                  <PriorityBadge priority="CRITICAL" />
                </div>
                <h4 className="text-xs font-semibold text-white">Main Water Line Pressure Drop</h4>
                <p className="text-[11px] text-slate-400">Block B Hostel &bull; Floor 2</p>
                <div className="pt-1">
                  <StatusBadge status="ASSIGNED" />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400">#CR-1042</span>
                  <PriorityBadge priority="MEDIUM" />
                </div>
                <h4 className="text-xs font-semibold text-white">Projector HDMI Socket Replaced</h4>
                <p className="text-[11px] text-slate-400">Main Auditorium &bull; Room 101</p>
                <div className="pt-1">
                  <StatusBadge status="RESOLVED" />
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* SECTION 2: HOW IT WORKS */}
      <section className="relative z-10 py-20 border-t border-slate-800/60 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Operating Model</span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mt-2">
              How the platform operates
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Three streamlined phases built for transparency, accountability, and zero communication lag.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassCard glow="blue" className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-lg">
                01
              </div>
              <h3 className="text-lg font-bold text-white">REPORT</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Students submit issues with geotagged locations, building, room numbers, and photographic evidence. Gemini AI assists with automatic categorization and priority routing.
              </p>
            </GlassCard>

            <GlassCard glow="purple" className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-lg">
                02
              </div>
              <h3 className="text-lg font-bold text-white">TRACK</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Administrators allocate requests to specialized staff. Students follow every status transition in realtime with instant in-app alerts and milestone timelines.
              </p>
            </GlassCard>

            <GlassCard glow="emerald" className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-lg">
                03
              </div>
              <h3 className="text-lg font-bold text-white">RESOLVE</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Technicians provide work notes and completion photos upon resolution. Students rate service quality from 1 to 5 stars, feeding operational accountability analytics.
              </p>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* SECTION 3: SERVICE CATEGORIES */}
      <section className="relative z-10 py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Campus Coverage</span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mt-2">
            8 Specialized Service Categories
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Engineered to route requests directly to the responsible university department.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((c) => {
            const Icon = c.icon
            return (
              <GlassCard key={c.name} hoverEffect className="p-5 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-blue-400 mb-3">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-white">{c.name}</h4>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{c.desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center text-[11px] text-blue-400 font-medium">
                  <span>Available 24/7</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-auto text-slate-500" />
                </div>
              </GlassCard>
            )
          })}
        </div>
      </section>

      {/* SECTION 4: INTELLIGENT AI ASSISTANCE */}
      <section className="relative z-10 py-20 border-t border-slate-800/60 bg-gradient-to-b from-slate-900/40 to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-800/80 text-xs font-semibold text-blue-300 mb-4">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Powered by Google Gemini</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
                Automated triage and priority recommendations
              </h2>
              <p className="mt-4 text-sm text-slate-400 leading-relaxed">
                Before ticket submission, students can trigger intelligent AI analysis. Gemini processes issue descriptions, identifies critical safety hazards, suggests optimal routing, and summarizes the ticket for technicians.
              </p>

              <div className="mt-6 space-y-3.5">
                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-white">Smart Category & Department Inference</h5>
                    <p className="text-xs text-slate-400">Routes electrical hazards or plumbing emergencies to the right team instantly.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-white">Non-Blocking Fallback Architecture</h5>
                    <p className="text-xs text-slate-400">AI recommendations are optional and editable. AI downtime never prevents ticket creation.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-white">One-Sentence Technician Summary</h5>
                    <p className="text-xs text-slate-400">Technicians can review issue highlights in seconds without deciphering long logs.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Mock Card */}
            <div>
              <GlassCard glow="blue" className="p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-semibold text-white">Gemini AI Analysis Preview</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">Verified</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-500 uppercase font-semibold text-[10px]">Student Request Input</span>
                    <p className="text-slate-300 font-medium mt-0.5">"Sparking wall outlet near study table 4 in Main Library ground floor."</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Recommended Category:</span>
                      <span className="font-semibold text-blue-400">Electrical</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Suggested Priority:</span>
                      <PriorityBadge priority="CRITICAL" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Target Department:</span>
                      <span className="text-slate-200">Electrical Maintenance</span>
                    </div>
                    <div className="pt-2 border-t border-slate-800">
                      <span className="text-slate-400">AI Summary:</span>
                      <p className="text-slate-300 mt-0.5 italic">"Active electrical sparking at study station requires immediate breaker isolation."</p>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: ROLE-BASED PORTALS */}
      <section className="relative z-10 py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Role Architecture</span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mt-2">
            Tailored Experiences for Every Role
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Independent, purpose-built interfaces with strict server-side authorization enforcement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Student */}
          <GlassCard glow="blue" className="flex flex-col justify-between p-6">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Student Portal</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Log service requests with attachments, monitor live status timelines, engage in ticket discussions, and rate resolutions.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Interactive ticket submission form</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Realtime Supabase timeline updates</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>1-5 Star resolution rating</span>
                </li>
              </ul>
            </div>
            <Link
              href="/login?role=student"
              className="mt-6 w-full py-2.5 rounded-xl font-semibold text-xs text-center text-white bg-blue-600 hover:bg-blue-500 shadow-md transition-all"
            >
              Access Student Portal
            </Link>
          </GlassCard>

          {/* Staff */}
          <GlassCard glow="purple" className="flex flex-col justify-between p-6">
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
                <Wrench className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Staff Management</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                View assigned requests, filter by priority, update status from Assigned to In Progress, and record resolution notes with completion photos.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>Assigned queue with critical alerts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>Strict ASSIGNED &rarr; IN_PROGRESS &rarr; RESOLVED flow</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>Resolution image & note upload</span>
                </li>
              </ul>
            </div>
            <Link
              href="/login?role=staff"
              className="mt-6 w-full py-2.5 rounded-xl font-semibold text-xs text-center text-white bg-indigo-600 hover:bg-indigo-500 shadow-md transition-all"
            >
              Access Staff Portal
            </Link>
          </GlassCard>

          {/* Admin */}
          <GlassCard glow="red" className="flex flex-col justify-between p-6">
            <div>
              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-4">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Administrator Console</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Campus-wide command center with Recharts metrics, manual staff assignment, category override, and technician directory oversight.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-red-400" />
                  <span>Live campus KPI dashboard</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-red-400" />
                  <span>Staff dispatch & reassignment engine</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-red-400" />
                  <span>Staff workload & activity audit logs</span>
                </li>
              </ul>
            </div>
            <Link
              href="/login?role=admin"
              className="mt-6 w-full py-2.5 rounded-xl font-semibold text-xs text-center text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 shadow-md transition-all"
            >
              Access Admin Console
            </Link>
          </GlassCard>
        </div>
      </section>

      {/* SECTION 6: WORKFLOW & STATUS TIMELINE */}
      <section className="relative z-10 py-20 border-t border-slate-800/60 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Strict State Machine</span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mt-2">
              Lifecycle of a Service Ticket
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Protected by server-side validation to prevent arbitrary or out-of-order transitions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {workflowSteps.map((step) => (
              <GlassCard key={step.status} className="p-4 flex flex-col justify-between">
                <div>
                  <StatusBadge status={step.status} />
                  <h4 className="text-sm font-bold text-white mt-3">{step.title}</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{step.desc}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7: CTA */}
      <section className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <GlassCard glow="blue" className="p-8 sm:p-14 space-y-6">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Ready to streamline campus facilities?
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
            Join hundreds of students and staff members maintaining campus excellence with realtime transparency.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-3.5 pt-2">
            <Link
              href="/register?role=student"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/25 transition-all"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Register as Student</span>
            </Link>

            <Link
              href="/register?role=staff"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-500 shadow-md transition-all"
            >
              <Wrench className="w-4 h-4" />
              <span>Register as Staff</span>
            </Link>
          </div>
        </GlassCard>
      </section>

      {/* SECTION 8: FOOTER */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-slate-950 py-10 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
              C
            </div>
            <span className="font-semibold text-slate-300">
              Campus Service Request Platform &bull; Report. Track. Resolve.
            </span>
          </div>

          <div className="flex items-center space-x-6 text-slate-400">
            <Link href="/login?role=student" className="hover:text-white transition-colors">
              Student
            </Link>
            <Link href="/login?role=staff" className="hover:text-white transition-colors">
              Staff
            </Link>
            <Link href="/login?role=admin" className="hover:text-white transition-colors">
              Admin
            </Link>
            <span>&copy; {new Date().getFullYear()} CampusDesk</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
