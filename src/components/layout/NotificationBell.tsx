import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, BellRing } from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useNotifications } from '@/lib/notifications'
import { getPushPermissionState, subscribeToPush } from '@/lib/push'
import { cn } from '@/lib/utils'
import type { Notification } from '@/types/database'

function timeAgo(iso: string) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export function NotificationBell({ dark = false }: { dark?: boolean }) {
  const { authUser } = useAuth()
  const navigate = useNavigate()
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications()
  const [open, setOpen] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default')
  const [enabling, setEnabling] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    void getPushPermissionState().then(setPermission)
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleEnableNotifications() {
    if (!authUser) return
    setEnabling(true)
    const { error } = await subscribeToPush(authUser.id)
    setEnabling(false)
    setPermission(await getPushPermissionState())
    if (error) console.error(error)
  }

  function handleSelect(notification: Notification) {
    if (!notification.read_at) markRead(notification.id)
    setOpen(false)
    const url = notification.data?.url
    if (typeof url === 'string') navigate(url)
  }

  if (!authUser) return null

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        data-tour="notification-bell"
        className={cn(
          'relative p-2 transition-colors',
          dark ? 'text-white/70 hover:text-white' : 'text-black/60 hover:text-black',
        )}
      >
        {unreadCount > 0 ? <BellRing className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 max-w-[90vw] border border-black bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-black px-4 py-3">
            <span className="text-xs font-bold tracking-[0.15em] uppercase text-black">
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllRead()}
                className="text-[10px] font-semibold uppercase tracking-wide text-black/50 hover:text-black"
              >
                Mark all read
              </button>
            )}
          </div>

          {permission !== 'granted' && permission !== 'unsupported' && (
            <div className="border-b border-black/10 bg-zinc-50 px-4 py-3">
              <p className="text-xs text-black/60">
                Enable push notifications to hear about bookings even when TopDek is closed.
              </p>
              <button
                onClick={() => void handleEnableNotifications()}
                disabled={enabling}
                className="mt-2 border border-black bg-black px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white hover:bg-white hover:text-black disabled:opacity-50"
              >
                {enabling ? 'Enabling…' : 'Enable notifications'}
              </button>
            </div>
          )}

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-xs text-black/30">No notifications yet.</p>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleSelect(notification)}
                  className={cn(
                    'block w-full border-b border-black/10 px-4 py-3 text-left transition-colors hover:bg-zinc-50',
                    !notification.read_at && 'bg-zinc-100',
                  )}
                >
                  <p className="text-xs font-bold uppercase tracking-wide text-black">
                    {notification.title}
                  </p>
                  <p className="mt-1 text-xs text-black/60">{notification.body}</p>
                  <p className="mt-1 text-[10px] text-black/30">{timeAgo(notification.created_at)}</p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
