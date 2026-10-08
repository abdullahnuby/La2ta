import { NextRequest, NextResponse } from 'next/server'
import { dbRequest, supabaseError } from '@/lib/db'

export const dynamic = 'force-dynamic'

function normalize(value: string) {
  return value.trim().toLocaleLowerCase('ar-EG')
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const q = normalize(searchParams.get('q') || '')
    const now = new Date().toISOString()

    const [stores, offers] = await Promise.all([
      dbRequest<any[]>('stores', {
        query: {
          select: 'id,name,description,phone,whatsapp,address,latitude,longitude,is_active',
          is_active: 'eq.true',
          order: 'name.asc',
        },
      }),
      dbRequest<any[]>('offers', {
        query: {
          select: 'store_id',
          status: 'eq.ACTIVE',
          start_at: `lte.${now}`,
          end_at: `gt.${now}`,
        },
      }),
    ])

    const offerCounts = new Map<number, number>()
    for (const offer of offers ?? []) {
      const storeId = Number(offer.store_id)
      if (!Number.isSafeInteger(storeId)) continue
      offerCounts.set(storeId, (offerCounts.get(storeId) ?? 0) + 1)
    }

    const filtered = (stores ?? []).filter((store) => {
      if (!q) return true
      const haystack = normalize(
        `${store.name || ''} ${store.description || ''} ${store.address || ''}`
      )
      return haystack.includes(q)
    })

    return NextResponse.json({
      stores: filtered.map((store) => ({
        id: store.id,
        name: store.name,
        description: store.description || '',
        phone: store.phone || '',
        whatsapp: store.whatsapp || '',
        address: store.address || '',
        latitude: store.latitude ?? null,
        longitude: store.longitude ?? null,
        offersCount: offerCounts.get(store.id) ?? 0,
      })),
    })
  } catch (error) {
    return NextResponse.json(
      { error: supabaseError(error) },
      { status: 500 }
    )
  }
}
