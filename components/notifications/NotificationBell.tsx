'use client'

import { useEffect, useState, useRef } from 'react'
import { Bell, CheckCheck, Clock, ExternalLink } from 'lucide-react'
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
  darkTheme = false,
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
    fetchNotifications()

    // Setup Supabase Realtime subscription for notifications
    const supabase = createClient()
    let channel: any = null

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return

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
            setNotifications((prev) => [payload.new as NotificationItem, ...prev])
          }
        )
        .subscribe()
    })

    return () => {
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
    await markAllNotificationsAsRead()
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
  }

  const handleItemClick = async (notif: NotificationItem) => {
    if (!notif.is_read) {
      await markNotificationAsRead(notif.id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
      )
    }
    setOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className={`relative p-2 rounded-lg transition-colors focus:outline-none ${
          darkTheme
            ? 'text-slate-300 hover:text-white hover:bg-slate-800'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }`}
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-xs animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white shadow-2xl border border-gray-200 z-50 overflow-hidden text-gray-900">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-700">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center space-x-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
            {notifications.length === 0 ? (
              <div className="py-8 px-4 text-center text-xs text-gray-500">
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
                      !n.is_read ? 'bg-blue-50/40' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5 flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="text-xs font-bold text-gray-900">{n.title}</p>
                          {!n.is_read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 leading-snug">{n.message}</p>
                        <span className="text-[10px] text-gray-400 block pt-0.5">
                          {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &bull; {new Date(n.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      {targetUrl && (
                        <Link
                          href={targetUrl}
                          className="shrink-0 text-blue-600 p-1 hover:bg-blue-100 rounded"
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
