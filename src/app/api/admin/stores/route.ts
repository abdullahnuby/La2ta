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
    offersCount: Number(s.offers?.[0]?.count ?? 0),
  }
}

export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  try {
    const data = await dbRequest<any[]>('stores', {
      query: { select: 'id,name,description,phone,whatsapp,address,latitude,longitude,is_active,offers(count)', order: 'id.asc' },
    })
    return NextResponse.json({ stores: (data ?? []).map(mapStore) })
  } catch (error) {
    return NextResponse.json({ error: supabaseError(error) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  try {
    const body = await req.json().catch(() => null)
    const name = String(body?.name || '').trim()
    if (!name) return NextResponse.json({ error: 'اسم المحل مطلوب' }, { status: 400 })

    const lat = body?.latitude != null && body.latitude !== '' ? Number(body.latitude) : null
    const lng = body?.longitude != null && body.longitude !== '' ? Number(body.longitude) : null
    const rows = await dbRequest<any[]>('stores', {
      method: 'POST',
      query: { select: '*' },
      body: {
        name,
        description: String(body?.description || ''),
        phone: String(body?.phone || ''),
        whatsapp: String(body?.whatsapp || ''),
        address: String(body?.address || ''),
        latitude: lat != null && Number.isFinite(lat) ? lat : null,
        longitude: lng != null && Number.isFinite(lng) ? lng : null,
        is_active: body?.isActive === undefined ? true : Boolean(body.isActive),
      },
      returnRepresentation: true,
    })
    return NextResponse.json({ store: mapStore(rows[0]) }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: supabaseError(error) }, { status: 500 })
  }
}
