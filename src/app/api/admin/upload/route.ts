import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import crypto from 'crypto'
import { requireAdmin } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

const MAX_SIZE = 5 * 1024 * 1024 // 5MB

/** POST /api/admin/upload — multipart form (file) → { url } saved under /public/uploads */
export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return NextResponse.json({ error: 'ملف غير صحيح' }, { status: 400 })
  }

  const file = form.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'لازم تختار صورة' }, { status: 400 })
  }
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'الملف لازم يكون صورة' }, { status: 400 })
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'الصورة أكبر من 5 ميجا' }, { status: 413 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const extRaw = (file.name.split('.').pop() || 'png').toLowerCase()
  const ext = extRaw.replace(/[^a-z0-9]/g, '').slice(0, 5) || 'png'
  const name = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`

  const dir = path.join(process.cwd(), 'public', 'uploads')
  await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(path.join(dir, name), buffer)

  return NextResponse.json({ url: `/uploads/${name}` })
}
