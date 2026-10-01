'use client'

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
  Activity, 
  Zap, 
  Laptop, 
  Lightbulb, 
  Droplet, 
  Hammer, 
  Home, 
  Bus, 
  Sparkle, 
  Building,
  BarChart3,
  CheckCircle,
  Play
} from 'lucide-react'
import { DemoModeBadge } from '@/components/demo/DemoModeBadge'
import { PriorityBadge } from '@/components/ui/PriorityBadge'
import { StatusBadge } from '@/components/ui/StatusBadge'

export default function LandingPage() {
  const serviceCategories = [
    { name: 'IT Support', icon: Laptop, desc: 'Computers, Wi-Fi connectivity, projectors, academic portals' },
    { name: 'Electrical', icon: Lightbulb, desc: 'Lighting, power sockets, breaker trips, appliance repairs' },
    { name: 'Plumbing', icon: Droplet, desc: 'Leakages, water supply, washroom fittings, drain lines' },
    { name: 'Maintenance', icon: Hammer, desc: 'Doors, windows, furniture repairs, lock replacements' },
    { name: 'Hostel', icon: Home, desc: 'Room amenities, hostel facilities, shared residential areas' },
    { name: 'Transport', icon: Bus, desc: 'Campus shuttle logistics, parking passes, vehicle services' },
    { name: 'Cleaning', icon: Sparkle, desc: 'Corridor sanitation, waste clearance, spill response' },
    { name: 'Administration', icon: Building, desc: 'Campus security desk, ID cards, departmental inquiries' },
  ]

  const workflowSteps = [
    {
      step: '01',
      title: 'Report Incident',
      desc: 'Student logs issue with location, room number, description, and optional photo attachment.',
    },
    {
      step: '02',
      title: 'AI Triage & Routing',
      desc: 'Google Gemini analyzes description, recommends priority SLA, and auto-dispatches to the specialist.',
    },
    {
      step: '03',
      title: 'Technician Resolution',
      desc: 'Technician commences hands-on repair, records completion notes, and closes the ticket loop.',
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-lg tracking-tight">
                Campus<span className="text-emerald-600">Desk</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold text-slate-400">
                Enterprise Service Platform
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <DemoModeBadge />
            <Link
              href="/login"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition"
            >
              Sign In
            </Link>
            <Link
              href="/student/dashboard"
              className="inline-flex items-center space-x-1 px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-2xs"
            >
              <span>Explore Demo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Subtle pill tag */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
          <span>One Campus. One Service Desk.</span>
          <span className="text-emerald-400">•</span>
          <span className="text-emerald-700">AI-Powered Operations</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.12]">
          Report Campus Issues. Track Progress. <span className="text-emerald-600">Resolve Faster.</span>
        </h1>

        <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          The centralized platform connecting students, maintenance technicians, and campus administrators for lightning-fast facilities resolution.
        </p>

        {/* 3 Role Portal CTA Cards */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          <Link
            href="/student/dashboard"
            className="p-5 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-md transition text-left group"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center justify-between">
              <span>Student Portal</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition" />
            </h3>
            <p className="text-xs text-slate-500 mt-1">Submit tickets, view status milestones, and rate repairs.</p>
          </Link>

          <Link
            href="/staff/dashboard"
            className="p-5 rounded-xl bg-white border border-slate-200 hover:border-blue-500 hover:shadow-md transition text-left group"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Wrench className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center justify-between">
              <span>Staff Hub</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition" />
            </h3>
            <p className="text-xs text-slate-500 mt-1">Access domain queues, commence repairs, and log resolutions.</p>
          </Link>

          <Link
            href="/admin/dashboard"
            className="p-5 rounded-xl bg-white border border-slate-200 hover:border-purple-500 hover:shadow-md transition text-left group"
          >
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center justify-between">
              <span>Command Center</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition" />
            </h3>
            <p className="text-xs text-slate-500 mt-1">Priority queue, auto staff delegation, and SLA analytics.</p>
          </Link>
        </div>

        {/* Live Preview Ticket Simulation */}
        <div className="mt-14 max-w-4xl mx-auto rounded-2xl bg-white border border-slate-200/90 shadow-md p-6 text-left">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                CR-1001
              </span>
              <PriorityBadge priority="HIGH" />
              <StatusBadge status="IN_PROGRESS" />
              <span className="text-xs text-slate-500 font-medium">IT Support • Hostel Block A</span>
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              <span>Assigned to Vikram Rao</span>
            </div>
          </div>

          <h3 className="text-base font-bold text-slate-900 mb-1">
            Wi-Fi connection unstable in room A-204
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
            "Signal keeps dropping every few minutes on the second floor wing. Affects multiple students preparing for upcoming midterms."
          </p>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-emerald-700 bg-emerald-50/80 px-2.5 py-1 rounded-md">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-medium">AI Match: IT Support (99% confidence) &bull; SLA: 4 Hours</span>
            </div>
            <Link href="/student/requests/req-1001" className="text-emerald-600 hover:text-emerald-700 font-semibold flex items-center space-x-1">
              <span>View Full Ticket</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Streamlined Operations
            </h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              How Campus Service Requests Get Solved
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {workflowSteps.map((ws) => (
              <div key={ws.step} className="p-6 rounded-xl bg-slate-50 border border-slate-200 relative">
                <span className="text-3xl font-black text-emerald-600/30 font-mono absolute top-4 right-5">
                  {ws.step}
                </span>
                <div className="w-10 h-10 rounded-lg bg-emerald-100/80 text-emerald-700 flex items-center justify-center font-bold text-sm mb-4">
                  {ws.step}
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1.5">{ws.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{ws.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Categories Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-600">
            Comprehensive Coverage
          </h2>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            8 Specialized Campus Service Domains
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {serviceCategories.map((cat) => {
            const Icon = cat.icon
            return (
              <div
                key={cat.name}
                className="p-5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-xs transition"
              >
                <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center mb-3">
                  <Icon className="w-4 h-4 text-emerald-600" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">{cat.name}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{cat.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* AI Assistance Spotlight */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Google Gemini 3.8 Flash Powered</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Intelligent Triage & Auto Staff Delegation
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                When an issue is reported, our integrated Gemini assistant analyzes textual descriptions, highlights safety hazards, predicts appropriate turnaround SLA, and identifies the best technician specialist automatically.
              </p>

              <div className="space-y-2.5 pt-2 text-xs text-slate-300">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Non-blocking advisory intelligence (always user-editable)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Automatic priority escalation for safety and critical outages</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Technician domain matching based on specialized expertise</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400">
                  <Sparkles className="w-4 h-4" />
                  <span>Live AI Recommendation Preview</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                  gemini-3.8-flash
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Assigned Domain</span>
                  <span className="font-bold text-white mt-0.5 block">IT Support</span>
                </div>
                <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Recommended SLA</span>
                  <span className="font-bold text-amber-400 mt-0.5 block">HIGH (4h Turnaround)</span>
                </div>
              </div>

              <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 text-xs space-y-1">
                <span className="font-semibold text-slate-300 block">Suggested Technician:</span>
                <span className="text-emerald-400 font-bold block">Vikram Rao (Network Specialist)</span>
                <p className="text-slate-400 text-[11px] pt-1">
                  Reasoning: Repeated Wi-Fi drops across floor cluster requires AP signal diagnostic on controller.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-md bg-emerald-600 flex items-center justify-center text-white">
              <GraduationCap className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-800">Campus Service Request Platform</span>
            <span>&bull;</span>
            <span>Report. Track. Resolve.</span>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/student/dashboard" className="hover:text-emerald-600 transition">Student</Link>
            <Link href="/staff/dashboard" className="hover:text-emerald-600 transition">Staff</Link>
            <Link href="/admin/dashboard" className="hover:text-emerald-600 transition">Admin</Link>
            <Link href="/login" className="hover:text-emerald-600 transition">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
