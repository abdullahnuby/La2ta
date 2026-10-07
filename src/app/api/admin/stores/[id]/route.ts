import { NextRequest, NextResponse } from 'next/server'
import { dbRequest, supabaseError } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

function mapStore(s: any) {
  return {
    id: s.id,
    name: s.name,
    description: s.description,
    phone: s.phone,
    whatsapp: s.whatsapp,
    address: s.address,
    latitude: s.latitude,
    longitude: s.longitude,
    isActive: s.is_active,
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  const storeId = Number.parseInt((await params).id, 10)
  if (!Number.isFinite(storeId)) return NextResponse.json({ error: 'المحل غير موجود' }, { status: 404 })

  try {
    const rows = await dbRequest<any[]>('stores', { query: { select: '*', id: `eq.${storeId}`, limit: 1 } })
    const existing = rows[0]
    if (!existing) return NextResponse.json({ error: 'المحل غير موجود' }, { status: 404 })

    const body = await req.json().catch(() => ({}))
    const data: { [key: string]: string | number | boolean | null } = {}
    if (body.name !== undefined) {
      const name = String(body.name).trim()
      if (!name) return NextResponse.json({ error: 'اسم المحل مطلوب' }, { status: 400 })
      data.name = name
    }
    if (body.description !== undefined) data.description = String(body.description)
    if (body.phone !== undefined) data.phone = String(body.phone)
    if (body.whatsapp !== undefined) data.whatsapp = String(body.whatsapp)
    if (body.address !== undefined) data.address = String(body.address)
    if (body.latitude !== undefined) {
      const v = body.latitude === null || body.latitude === '' ? null : Number(body.latitude)
      data.latitude = v != null && Number.isFinite(v) ? v : null
    }
    if (body.longitude !== undefined) {
      const v = body.longitude === null || body.longitude === '' ? null : Number(body.longitude)
      data.longitude = v != null && Number.isFinite(v) ? v : null
    }
    if (body.isActive !== undefined) data.is_active = Boolean(body.isActive)

    const updated = await dbRequest<any[]>('stores', {
      method: 'PATCH', query: { id: `eq.${storeId}`, select: '*' }, body: data, returnRepresentation: true,
    })
    return NextResponse.json({ store: mapStore(updated[0]) })
  } catch (error) {
    return NextResponse.json({ error: supabaseError(error) }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  const storeId = Number.parseInt((await params).id, 10)
  if (!Number.isFinite(storeId)) return NextResponse.json({ error: 'المحل غير موجود' }, { status: 404 })

  try {
    await dbRequest('stores', { method: 'DELETE', query: { id: `eq.${storeId}` } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: supabaseError(error) }, { status: 500 })
  }
}
