// LA2TA — client fetch helpers + tracking + admin token store
'use client'

import { create } from 'zustand'
import type { TrackEvent } from '@/lib/types'

/* ------------------------------------------------------------------ */
/* Admin token store (zustand + localStorage persistence)             */
/* ------------------------------------------------------------------ */

interface AdminState {
  token: string | null
  ready: boolean
  setToken: (t: string | null) => void
  hydrate: () => void
  logout: () => void
}

export const useAdminStore = create<AdminState>((set) => ({
  token: null,
  ready: false,
  setToken: (t) => {
    if (t) localStorage.setItem('la2ta_admin', t)
    else localStorage.removeItem('la2ta_admin')
    set({ token: t, ready: true })
  },
  hydrate: () => {
    set({ token: localStorage.getItem('la2ta_admin'), ready: true })
  },
  logout: () => {
    localStorage.removeItem('la2ta_admin')
    set({ token: null })
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
  token: string | null,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { 'x-admin-token': token } : {}),
      ...(init?.headers || {}),
    },
  })
  if (res.status === 401) throw new UnauthorizedError()
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
