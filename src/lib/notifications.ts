import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/hooks/useAuth'
import type { Notification, NotificationType } from '@/types/database'

type BookingEvent = Exclude<NotificationType, 'ticket_message'>

/** Reports a booking event so the *other* party gets notified (in-app +
 * push). Call this right after the mutation that caused the event succeeds. */
export async function notifyUser(bookingId: string, event: BookingEvent) {
  const { error } = await supabase.functions.invoke('create-notification', {
    body: { bookingId, event },
  })
  if (error) {
    console.error('Failed to send notification:', error.message)
  }
}

const NOTIFICATIONS_KEY = ['notifications'] as const

export function useNotifications() {
  const { authUser } = useAuth()
  const queryClient = useQueryClient()
  const userId = authUser?.id

  const query = useQuery({
    queryKey: NOTIFICATIONS_KEY,
    queryFn: async (): Promise<Notification[]> => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)
      if (error) throw error
      return (data ?? []) as Notification[]
    },
    enabled: !!userId,
  })

  useEffect(() => {
    if (!userId) return

    // Unique per effect run (not just per userId) — React StrictMode's dev-only
    // mount→cleanup→mount double-invoke can otherwise hand back the same
    // still-subscribed channel object before its async removal completes,
    // and Supabase throws on .on() after .subscribe().
    const channel = supabase
      .channel(`notifications:${userId}:${Date.now()}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        (payload) => {
          queryClient.setQueryData<Notification[]>(NOTIFICATIONS_KEY, (current) => [
            payload.new as Notification,
            ...(current ?? []),
          ])
        },
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        (payload) => {
          queryClient.setQueryData<Notification[]>(NOTIFICATIONS_KEY, (current) =>
            (current ?? []).map((n) => (n.id === payload.new.id ? (payload.new as Notification) : n)),
          )
        },
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [userId, queryClient])

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
    },
  })

  const markAllRead = useMutation({
    mutationFn: async () => {
      const unreadIds = (query.data ?? []).filter((n) => !n.read_at).map((n) => n.id)
      if (unreadIds.length === 0) return
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .in('id', unreadIds)
      if (error) throw error
    },
  })

  const notifications = query.data ?? []
  const unreadCount = notifications.filter((n) => !n.read_at).length

  return {
    notifications,
    unreadCount,
    isLoading: query.isLoading,
    markRead: markRead.mutate,
    markAllRead: markAllRead.mutate,
  }
}
