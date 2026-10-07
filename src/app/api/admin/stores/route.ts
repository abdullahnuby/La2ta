import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

/** GET /api/admin/stores */
export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  const stores = await db.store.findMany({
    orderBy: { id: 'asc' },
    include: { _count: { select: { offers: true } } },
  })

  return NextResponse.json({
    stores: stores.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      phone: s.phone,
      whatsapp: s.whatsapp,
      address: s.address,
      latitude: s.latitude,
      longitude: s.longitude,
      isActive: s.isActive,
      offersCount: s._count.offers,
    })),
  })
}

/** POST /api/admin/stores */
export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const name = String(body?.name || '').trim()
  if (!name) {
    return NextResponse.json({ error: 'اسم المحل مطلوب' }, { status: 400 })
  }

  const lat = body?.latitude != null && body.latitude !== '' ? Number(body.latitude) : null
  const lng = body?.longitude != null && body.longitude !== '' ? Number(body.longitude) : null

  const store = await db.store.create({
    data: {
      name,
      description: String(body?.description || ''),
      phone: String(body?.phone || ''),
      whatsapp: String(body?.whatsapp || ''),
      address: String(body?.address || ''),
      latitude: lat != null && !isNaN(lat) ? lat : null,
      longitude: lng != null && !isNaN(lng) ? lng : null,
      isActive: body?.isActive === undefined ? true : Boolean(body.isActive),
    },
  })

  return NextResponse.json({ store }, { status: 201 })
}
