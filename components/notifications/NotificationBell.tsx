'use client'

import { useEffect, useState, useRef } from 'react'
import { Bell, CheckCheck, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { markNotificationAsRead, markAllNotificationsAsRead } from '@/actions/notifications'

interface NotificationItem {
  id: string
  request_id?: string | null
  title: string
  message: string
  type: string
  is_read: boolean
  created_at: string
}

interface NotificationBellProps {
  baseRoute?: '/student' | '/staff' | '/admin'
}

const DEFAULT_DEMO_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'demo-notif-1',
    request_id: 'req-1008',
    title: 'Critical Outage Alert',
    message: 'CR-1008: Floor-wide internet disruption reported in Hostel Block A.',
    type: 'ALERT',
    is_read: false,
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 'demo-notif-2',
    request_id: 'req-1001',
    title: 'Technician Assigned',
    message: 'Vikram Rao was assigned to investigate Wi-Fi connectivity in room A-204.',
    type: 'STATUS_UPDATE',
    is_read: false,
    created_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
  },
  {
    id: 'demo-notif-3',
    request_id: 'req-1004',
    title: 'Service Request Resolved',
    message: 'CR-1004: Projector HDMI cable in CS-301 replaced and verified.',
    type: 'RESOLUTION',
    is_read: true,
    created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
]

export function NotificationBell({
  baseRoute = '/student',
}: NotificationBellProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(DEFAULT_DEMO_NOTIFICATIONS)
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter((n) => !n.is_read).length

  const fetchNotifications = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(15)

      if (data && data.length > 0) {
        setNotifications(data)
      }
    } catch {
      // Graceful fallback to demo notifications
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead()
    } catch {
      // ignore in demo
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
  }

  const handleItemClick = async (n: NotificationItem) => {
    if (!n.is_read) {
      try {
        await markNotificationAsRead(n.id)
      } catch {
        // ignore in demo
      }
      setNotifications((prev) =>
        prev.map((item) => (item.id === n.id ? { ...item, is_read: true } : item))
      )
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-all focus:outline-none cursor-pointer shadow-2xs"
        aria-label="Notifications"
        title="View Notifications"
      >
        <Bell className="w-5 h-5 text-slate-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 px-1.5 items-center justify-center rounded-full bg-rose-600 text-[11px] font-black text-white shadow-md border-2 border-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white shadow-xl border border-slate-200 z-50 overflow-hidden text-slate-800">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center space-x-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="py-8 px-4 text-center text-xs text-slate-400">
                No notifications received yet.
              </div>
            ) : (
              notifications.map((n) => {
                const targetUrl = n.request_id ? `${baseRoute}/requests/${n.request_id}` : null
                return (
                  <div
                    key={n.id}
                    onClick={() => handleItemClick(n)}
                    className={`p-3.5 hover:bg-slate-50 transition cursor-pointer ${
                      !n.is_read ? 'bg-emerald-50/40' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5 flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="text-xs font-bold text-slate-900">{n.title}</p>
                          {!n.is_read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-slate-600 leading-snug">{n.message}</p>
                        <p className="text-[10px] text-slate-400 pt-0.5">
                          {new Date(n.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>

                      {targetUrl && (
                        <Link
                          href={targetUrl}
                          onClick={() => setOpen(false)}
                          className="p-1 rounded text-slate-400 hover:text-emerald-600 transition"
                          title="Open ticket"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
