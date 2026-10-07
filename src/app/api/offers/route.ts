import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import type { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'

/**
 * GET /api/offers — current, valid offers.
 * ⚠️ Store fields are intentionally EXCLUDED here: the card must not reveal
 * the store name (curiosity funnel — see PRD §7/§8).
 * Query params: q (search), cat (category slug), featured=1
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = (searchParams.get('q') || '').trim()
  const cat = (searchParams.get('cat') || '').trim()
  const featured = searchParams.get('featured') === '1'

  // Lazy auto-expire: ACTIVE offers past end_at become EXPIRED (PRD §14)
  await db.offer
    .updateMany({
      where: { status: 'ACTIVE', endAt: { lt: new Date() } },
      data: { status: 'EXPIRED' },
    })
    .catch(() => {})

  const now = new Date()
  const where: Prisma.OfferWhereInput = {
    status: 'ACTIVE',
    startAt: { lte: now },
    endAt: { gt: now },
    store: { isActive: true },
  }
  if (cat) where.category = { slug: cat }
  if (featured) where.isFeatured = true
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { description: { contains: q } },
    ]
  }

  const offers = await db.offer.findMany({
    where,
    orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
    select: {
      id: true,
      title: true,
      description: true,
      imageUrl: true,
      oldPrice: true,
      newPrice: true,
      discountPercentage: true,
      offerType: true,
      isFeatured: true,
      startAt: true,
      endAt: true,
      category: { select: { id: true, name: true, slug: true, icon: true } },
    },
    take: 100,
  })

  return NextResponse.json({ offers })
}
