import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { requireAdmin } from '@/lib/admin-auth'
import { storagePublicUrl, storageUpload, supabaseError } from '@/lib/db'

export const dynamic = 'force-dynamic'

const MAX_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
])

export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  try {
    const form = await req.formData()
    const file = form.get('file')
    if (!(file instanceof File)) return NextResponse.json({ error: 'لازم تختار صورة' }, { status: 400 })

    const ext = ALLOWED_TYPES.get(file.type)
    if (!ext) return NextResponse.json({ error: 'الصورة لازم تكون JPG أو PNG أو WebP' }, { status: 400 })
    if (file.size > MAX_SIZE) return NextResponse.json({ error: 'الصورة أكبر من 5 ميجا' }, { status: 413 })

    const path = `offers/${crypto.randomUUID()}.${ext}`
    await storageUpload(path, await file.arrayBuffer(), file.type)
    return NextResponse.json({ url: storagePublicUrl(path) })
  } catch (error) {
    return NextResponse.json({ error: supabaseError(error) }, { status: 500 })
  }
}
