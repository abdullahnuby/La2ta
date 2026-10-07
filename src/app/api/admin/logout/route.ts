import { NextRequest, NextResponse } from 'next/server'
import { clearAdminCookie } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export async function POST(_req: NextRequest) {
  const response = NextResponse.json({ ok: true })
  clearAdminCookie(response)
  return response
}
