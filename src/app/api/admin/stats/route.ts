import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

/** GET /api/admin/stats — dashboard overview numbers + top offers */
export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  // Lazy auto-expire so the dashboard reflects reality
  await db.offer
    .updateMany({
      where: { status: 'ACTIVE', endAt: { lt: new Date() } },
      data: { status: 'EXPIRED' },
    })
    .catch(() => {})

  const now = new Date()
  const [offers, stores, categories, sums] = await Promise.all([
    db.offer.findMany({
      select: { status: true, startAt: true, endAt: true },
    }),
    db.store.count(),
    db.category.count(),
    db.offer.aggregate({
      _sum: {
        impressions: true,
        views: true,
        mapClicks: true,
        callClicks: true,
        whatsappClicks: true,
        shares: true,
      },
    }),
  ])

  const top = await db.offer.findMany({
    orderBy: { views: 'desc' },
    take: 8,
    select: {
      id: true,
      title: true,
      status: true,
      views: true,
      mapClicks: true,
      callClicks: true,
      whatsappClicks: true,
      shares: true,
      store: { select: { name: true } },
    },
  })

  const s = sums._sum
  return NextResponse.json({
    totals: {
      offers: offers.length,
      active: offers.filter(
        (o) => o.status === 'ACTIVE' && o.startAt <= now && o.endAt > now
      ).length,
      stores,
      categories,
      impressions: s.impressions ?? 0,
      views: s.views ?? 0,
      mapClicks: s.mapClicks ?? 0,
      callClicks: s.callClicks ?? 0,
      whatsappClicks: s.whatsappClicks ?? 0,
      shares: s.shares ?? 0,
    },
    top: top.map((o) => ({
      id: o.id,
      title: o.title,
      storeName: o.store.name,
      status: o.status,
      views: o.views,
      mapClicks: o.mapClicks,
      callClicks: o.callClicks,
      whatsappClicks: o.whatsappClicks,
      shares: o.shares,
    })),
  })
}
