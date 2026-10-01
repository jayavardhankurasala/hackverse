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
  darkTheme?: boolean
}

export function NotificationBell({
  baseRoute = '/student',
}: NotificationBellProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
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

      if (data) {
        setNotifications(data)
      }
    } catch {
      // Graceful error
    }
  }

  useEffect(() => {
    let isMounted = true
    let channel: any = null
    const supabase = createClient()

    fetchNotifications()

    // Setup Supabase Realtime subscription for notifications safely
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!isMounted || !user) return

      channel = supabase
        .channel(`user-notifications-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            if (isMounted) {
              setNotifications((prev) => [payload.new as NotificationItem, ...prev])
            }
          }
        )
        .subscribe()
    })

    return () => {
      isMounted = false
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
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
    const res = await markAllNotificationsAsRead()
    if (res?.success) {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    }
  }

  const handleItemClick = async (n: NotificationItem) => {
    if (!n.is_read) {
      await markNotificationAsRead(n.id)
      setNotifications((prev) =>
        prev.map((item) => (item.id === n.id ? { ...item, is_read: true } : item))
      )
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800/80 transition-all focus:outline-none"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white shadow-xs animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900/95 shadow-2xl border border-slate-800/90 z-50 overflow-hidden text-slate-100 backdrop-blur-2xl">
          <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-950 text-blue-300 border border-blue-800">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center space-x-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
            {notifications.length === 0 ? (
              <div className="py-8 px-4 text-center text-xs text-slate-500">
                No notifications received yet.
              </div>
            ) : (
              notifications.map((n) => {
                const targetUrl = n.request_id ? `${baseRoute}/requests/${n.request_id}` : null
                return (
                  <div
                    key={n.id}
                    onClick={() => handleItemClick(n)}
                    className={`p-3.5 hover:bg-slate-800/50 transition cursor-pointer ${
                      !n.is_read ? 'bg-blue-950/20' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5 flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="text-xs font-bold text-white">{n.title}</p>
                          {!n.is_read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                          )}
                        </div>
                        <p className="text-xs text-slate-300 leading-snug">{n.message}</p>
                        <span className="text-[10px] text-slate-500 block pt-0.5">
                          {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &bull; {new Date(n.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      {targetUrl && (
                        <Link
                          href={targetUrl}
                          className="shrink-0 text-blue-400 p-1 hover:bg-blue-950/60 rounded-lg"
                          title="View Request"
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
