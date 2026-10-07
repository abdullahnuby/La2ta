import { NextRequest, NextResponse } from 'next/server'
import { checkPassword, setAdminCookie } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

/** POST /api/admin/login — { password } → authenticated session cookie */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const password = typeof body?.password === 'string' ? body.password : ''

  if (!checkPassword(password)) {
    return NextResponse.json({ error: 'كلمة المرور غلط' }, { status: 401 })
  }

  const response = NextResponse.json({ authenticated: true })
  setAdminCookie(response)
  return response
}
