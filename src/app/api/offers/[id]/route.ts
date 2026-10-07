import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * GET /api/offers/[id] — offer details + store reveal (PRD §7).
 * Only visible while: ACTIVE + inside its date window + store active.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const offerId = Number.parseInt(id, 10)
  if (!Number.isFinite(offerId)) {
    return NextResponse.json({ error: 'العرض غير موجود' }, { status: 404 })
  }

  const now = new Date()
  const offer = await db.offer.findFirst({
    where: {
      id: offerId,
      status: 'ACTIVE',
      startAt: { lte: now },
      endAt: { gt: now },
      store: { isActive: true },
    },
    include: { store: true, category: true },
  })

  if (!offer) {
    return NextResponse.json(
      { error: 'العرض مش متاح أو انتهى' },
      { status: 404 }
    )
  }

  const { store, category, ...rest } = offer

  return NextResponse.json({
    offer: {
      ...rest,
      category: category
        ? {
            id: category.id,
            name: category.name,
            slug: category.slug,
            icon: category.icon,
          }
        : null,
      store: store
        ? {
            id: store.id,
            name: store.name,
            description: store.description,
            phone: store.phone,
            whatsapp: store.whatsapp,
            address: store.address,
            latitude: store.latitude,
            longitude: store.longitude,
          }
        : null,
    },
  })
}
