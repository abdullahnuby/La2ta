'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useAuth } from '@/components/la2ta/auth-provider'

export interface AppNotification {
  id: number
  type: 'favorite_expiring'
  offerId: number | null
  title: string
  body: string
  href: string
  createdAt: string
  readAt: string | null
}

interface NotificationsContextValue {
  notifications: AppNotification[]
  unreadCount: number
  loading: boolean
  refresh: () => Promise<void>
  markRead: (notificationId: number) => Promise<void>
  markAllRead: () => Promise<void>
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null)

async function readBody(response: Response) {
  const body = (await response.json().catch(() => ({}))) as { error?: string }
  if (!response.ok) throw new Error(body.error || 'تعذر تحديث التنبيهات.')
  return body
}

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { session, user } = useAuth()
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(Boolean(user))

  const refresh = useCallback(async () => {
    if (!session?.access_token) {
      setNotifications([])
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${session.access_token}` },
        cache: 'no-store',
      })
      const body = (await readBody(response)) as {
        notifications?: Array<{
          id: number
          type: 'favorite_expiring'
          offer_id: number | null
          title: string
          body: string
          href: string
          created_at: string
          read_at: string | null
        }>
      }

      setNotifications(
        (body.notifications ?? []).map((item) => ({
          id: item.id,
          type: item.type,
          offerId: item.offer_id,
          title: item.title,
          body: item.body,
          href: item.href,
          createdAt: item.created_at,
          readAt: item.read_at,
        }))
      )
    } catch {
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }, [session?.access_token])

  useEffect(() => {
    void refresh()
    if (!session?.access_token) return
    const interval = window.setInterval(() => void refresh(), 60_000)
    return () => window.clearInterval(interval)
  }, [refresh, session?.access_token])

  const markRead = useCallback(
    async (notificationId: number) => {
      if (!session?.access_token) return

      const previous = notifications
      setNotifications((items) =>
        items.map((item) =>
          item.id === notificationId
            ? { ...item, readAt: item.readAt ?? new Date().toISOString() }
            : item
        )
      )

      try {
        const response = await fetch('/api/notifications', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ notificationId }),
        })
        await readBody(response)
      } catch (error) {
        setNotifications(previous)
        throw error
      }
    },
    [notifications, session?.access_token]
  )

  const markAllRead = useCallback(async () => {
    if (!session?.access_token) return
    const previous = notifications
    const stamp = new Date().toISOString()
    setNotifications((items) => items.map((item) => ({ ...item, readAt: item.readAt ?? stamp })))

    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ all: true }),
      })
      await readBody(response)
    } catch (error) {
      setNotifications(previous)
      throw error
    }
  }, [notifications, session?.access_token])

  const unreadCount = notifications.reduce(
    (count, item) => count + (item.readAt ? 0 : 1),
    0
  )

  const value = useMemo<NotificationsContextValue>(
    () => ({ notifications, unreadCount, loading, refresh, markRead, markAllRead }),
    [loading, markAllRead, markRead, notifications, refresh, unreadCount]
  )

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
}

export function useNotifications() {
  const value = useContext(NotificationsContext)
  if (!value) throw new Error('useNotifications must be used inside NotificationsProvider')
  return value
}
