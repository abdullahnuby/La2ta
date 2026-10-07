// LA2TA — server-side admin authentication via an HttpOnly cookie.
import crypto from 'crypto'
import type { NextRequest, NextResponse } from 'next/server'

const COOKIE_NAME = 'la2ta_admin'
const MAX_AGE = 60 * 60 * 24 * 7 // 7 days

function adminPassword(): string {
  return process.env.LA2TA_ADMIN_PASSWORD || ''
}

export function adminToken(): string {
  const password = adminPassword()
  if (!password) throw new Error('LA2TA_ADMIN_PASSWORD is not configured')
  return crypto.createHash('sha256').update(`la2ta::${password}`).digest('hex')
}

export function checkPassword(pw: string): boolean {
  const expected = adminPassword()
  if (!expected) return false
  const a = Buffer.from(pw || '')
  const b = Buffer.from(expected)
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

export function requireAdmin(req: NextRequest): boolean {
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) return false

  const expected = (() => {
    try {
      return adminToken()
    } catch {
      return ''
    }
  })()

  const a = Buffer.from(token)
  const b = Buffer.from(expected)
  return !!expected && a.length === b.length && crypto.timingSafeEqual(a, b)
}

export function setAdminCookie(response: NextResponse): void {
  response.cookies.set({
    name: COOKIE_NAME,
    value: adminToken(),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: MAX_AGE,
  })
}

export function clearAdminCookie(response: NextResponse): void {
  response.cookies.set({
    name: COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  })
}

/** Compute discount % from prices (rounded), null when not applicable. */
export function computeDiscount(oldPrice?: number | null, newPrice?: number | null): number | null {
  if (
    oldPrice != null &&
    newPrice != null &&
    oldPrice > 0 &&
    newPrice >= 0 &&
    newPrice < oldPrice
  ) {
    return Math.round((1 - newPrice / oldPrice) * 100)
  }
  return null
}
