// LA2TA — server-side admin auth (simple shared-password MVP)
import crypto from 'crypto'
import type { NextRequest } from 'next/server'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'la2ta2024'

export function adminToken(): string {
  return crypto
    .createHash('sha256')
    .update(`la2ta::${ADMIN_PASSWORD}`)
    .digest('hex')
}

export function checkPassword(pw: string): boolean {
  const a = Buffer.from(pw || '')
  const b = Buffer.from(ADMIN_PASSWORD)
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

export function requireAdmin(req: NextRequest): boolean {
  const token = req.headers.get('x-admin-token')
  if (!token) return false
  const a = Buffer.from(token)
  const b = Buffer.from(adminToken())
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

/** Compute discount % from prices (rounded), null when not applicable */
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
