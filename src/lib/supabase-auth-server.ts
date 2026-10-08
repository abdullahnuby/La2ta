import { createClient } from '@supabase/supabase-js'
import type { NextRequest } from 'next/server'

export async function getAuthenticatedUserId(
  request: NextRequest
): Promise<string | null> {
  const authorization = request.headers.get('authorization') || ''
  const match = authorization.match(/^Bearer\s+(.+)$/i)
  if (!match) return null

  const url = (
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    'https://kkytfnksvqclxxphkqfg.supabase.co'
  ).replace(/\/$/, '')

  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    ''

  if (!key) return null

  const supabase = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })

  const { data, error } = await supabase.auth.getUser(match[1])
  if (error || !data.user) return null

  return data.user.id
}
