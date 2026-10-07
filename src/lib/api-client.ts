// LA2TA — client fetch helpers + tracking + admin token store
'use client'

import { create } from 'zustand'
import type { TrackEvent } from '@/lib/types'

/* ------------------------------------------------------------------ */
/* Admin session state (the real credential stays in an HttpOnly cookie) */
/* ------------------------------------------------------------------ */

interface AdminState {
  token: string | null
  ready: boolean
  setToken: (t: string | null) => void
  hydrate: () => Promise<void>
  logout: () => Promise<void>
}

export const useAdminStore = create<AdminState>((set) => ({
  token: null,
  ready: false,
  setToken: (t) => set({ token: t, ready: true }),
  hydrate: async () => {
    try {
      const res = await fetch('/api/admin/session', { cache: 'no-store' })
      const body = await res.json().catch(() => ({}))
      set({ token: body.authenticated ? 'session' : null, ready: true })
    } catch {
      set({ token: null, ready: true })
    }
  },
  logout: async () => {
    await fetch('/api/admin/logout', { method: 'POST' }).catch(() => {})
    set({ token: null, ready: true })
  },
}))

/* ------------------------------------------------------------------ */
/* Fetch helpers                                                       */
/* ------------------------------------------------------------------ */

export class UnauthorizedError extends Error {
  constructor() {
    super('انتهت الجلسة — سجّل دخول تاني')
    this.name = 'UnauthorizedError'
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, init)
  if (!res.ok) {
    const body = await res.json().catch(() => ({} as { error?: string }))
    throw new Error(body.error || `طلب فشل (${res.status})`)
  }
  return res.json() as Promise<T>
}

export async function adminApi<T>(
  path: string,
  _token: string | null,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(path, {
    ...init,
    cache: 'no-store',
    headers: {
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init?.headers || {}),
    },
  })
  if (res.status === 401) {
    useAdminStore.getState().setToken(null)
    throw new UnauthorizedError()
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({} as { error?: string }))
    throw new Error(body.error || `طلب فشل (${res.status})`)
  }
  return res.json() as Promise<T>
}

/* ------------------------------------------------------------------ */
/* Lightweight analytics tracking (fire & forget)                      */
/* ------------------------------------------------------------------ */

const sentOnce = new Set<string>()

export function track(offerId: number, event: TrackEvent, once = false) {
  const key = `${offerId}:${event}`
  if (once && sentOnce.has(key)) return
  sentOnce.add(key)
  fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ offerId, event }),
    keepalive: true,
  }).catch(() => {})
}
