type Json = string | number | boolean | null | Json[] | { [key: string]: Json }

let baseUrl: string | null = null
let secretKey: string | null = null

function config() {
  baseUrl ??= (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '')
  secretKey ??= process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  if (!baseUrl) throw new Error('SUPABASE_URL is not configured')
  if (!secretKey) throw new Error('SUPABASE_SECRET_KEY is not configured')
  return { baseUrl, secretKey }
}

export class SupabaseRequestError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'SupabaseRequestError'
    this.status = status
  }
}

export async function dbRequest<T = unknown>(
  table: string,
  options: {
    method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
    query?: Record<string, string | number | boolean | undefined>
    body?: Json | Json[]
    returnRepresentation?: boolean
  } = {}
): Promise<T> {
  const { baseUrl: url, secretKey: key } = config()
  const endpoint = new URL(`${url}/rest/v1/${table}`)
  for (const [name, value] of Object.entries(options.query ?? {})) {
    if (value !== undefined) endpoint.searchParams.set(name, String(value))
  }

  const headers: Record<string, string> = {
    apikey: key,
  }
  if (options.body !== undefined) headers['Content-Type'] = 'application/json'
  if (options.returnRepresentation) headers.Prefer = 'return=representation'

  const response = await fetch(endpoint, {
    method: options.method ?? 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    cache: 'no-store',
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    let message = text || `Supabase request failed (${response.status})`
    try {
      const parsed = JSON.parse(text) as { message?: string; details?: string; hint?: string }
      message = parsed.message || parsed.details || parsed.hint || message
    } catch {}
    throw new SupabaseRequestError(response.status, message)
  }

  if (response.status === 204) return undefined as T
  const text = await response.text()
  return (text ? JSON.parse(text) : undefined) as T
}

export function supabaseError(error: unknown): string {
  if (error instanceof SupabaseRequestError) return error.message
  if (error instanceof Error) return error.message
  return 'حدث خطأ غير متوقع'
}

export async function storageUpload(
  path: string,
  body: ArrayBuffer | Uint8Array,
  contentType: string
): Promise<void> {
  const { baseUrl: url, secretKey: key } = config()
  const response = await fetch(`${url}/storage/v1/object/offer-images/${path}`, {
    method: 'POST',
    headers: {
      apikey: key,
      'Content-Type': contentType,
      'Cache-Control': '31536000',
      'x-upsert': 'false',
    },
    body: body as BodyInit,
    cache: 'no-store',
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new SupabaseRequestError(response.status, text || `Upload failed (${response.status})`)
  }
}

export function storagePublicUrl(path: string): string {
  const { baseUrl: url } = config()
  return `${url}/storage/v1/object/public/offer-images/${path.split('/').map(encodeURIComponent).join('/')}`
}
