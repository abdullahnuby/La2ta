import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

export function isSupabaseAuthConfigured() {
  return Boolean(
    (
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      ''
    ).trim()
  )
}

export function getSupabaseBrowserClient() {
  if (!isSupabaseAuthConfigured()) {
    throw new Error('إعدادات تسجيل الدخول غير مكتملة')
  }

  if (client) return client

  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    'https://kkytfnksvqclxxphkqfg.supabase.co'

  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    ''

  client = createClient(url, key, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  })

  return client
}
