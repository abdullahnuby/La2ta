import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

/** PATCH /api/admin/stores/[id] */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  const { id } = await params
  const storeId = Number.parseInt(id, 10)
  if (!Number.isFinite(storeId)) {
    return NextResponse.json({ error: 'المحل غير موجود' }, { status: 404 })
  }

  const existing = await db.store.findUnique({ where: { id: storeId } })
  if (!existing) {
    return NextResponse.json({ error: 'المحل غير موجود' }, { status: 404 })
  }

  const body = await req.json().catch(() => ({}))
  const data: Record<string, unknown> = {}

  if (body.name !== undefined) {
    const name = String(body.name).trim()
    if (!name) {
      return NextResponse.json({ error: 'اسم المحل مطلوب' }, { status: 400 })
    }
    data.name = name
  }
  if (body.description !== undefined) data.description = String(body.description)
  if (body.phone !== undefined) data.phone = String(body.phone)
  if (body.whatsapp !== undefined) data.whatsapp = String(body.whatsapp)
  if (body.address !== undefined) data.address = String(body.address)

  if (body.latitude !== undefined) {
    const v = body.latitude === null || body.latitude === '' ? null : Number(body.latitude)
    data.latitude = v != null && !isNaN(v) ? v : null
  }
  if (body.longitude !== undefined) {
    const v = body.longitude === null || body.longitude === '' ? null : Number(body.longitude)
    data.longitude = v != null && !isNaN(v) ? v : null
  }
  if (body.isActive !== undefined) data.isActive = Boolean(body.isActive)

  const store = await db.store.update({ where: { id: storeId }, data })
  return NextResponse.json({ store })
}

/** DELETE /api/admin/stores/[id] — cascades to its offers */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  const { id } = await params
  const storeId = Number.parseInt(id, 10)
  if (!Number.isFinite(storeId)) {
    return NextResponse.json({ error: 'المحل غير موجود' }, { status: 404 })
  }

  await db.store.delete({ where: { id: storeId } }).catch(() => {})
  return NextResponse.json({ ok: true })
}
