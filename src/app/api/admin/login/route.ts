import { NextRequest, NextResponse } from 'next/server'
import { adminToken, checkPassword } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

/** POST /api/admin/login — { password } → { token } */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const password = typeof body?.password === 'string' ? body.password : ''

  if (!checkPassword(password)) {
    return NextResponse.json({ error: 'كلمة المرور غلط' }, { status: 401 })
  }

  return NextResponse.json({ token: adminToken() })
}
