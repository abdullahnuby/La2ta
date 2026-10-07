import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { computeDiscount, requireAdmin } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

/** GET /api/admin/offers — all offers with store/category names */
export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  // Lazy auto-expire
  await db.offer
    .updateMany({
      where: { status: 'ACTIVE', endAt: { lt: new Date() } },
      data: { status: 'EXPIRED' },
    })
    .catch(() => {})

  const offers = await db.offer.findMany({
    orderBy: [{ createdAt: 'desc' }],
    include: {
      store: { select: { id: true, name: true } },
      category: { select: { id: true, name: true } },
    },
  })

  return NextResponse.json({
    offers: offers.map((o) => ({
      id: o.id,
      storeId: o.storeId,
      storeName: o.store.name,
      categoryId: o.categoryId,
      categoryName: o.category?.name ?? null,
      title: o.title,
      description: o.description,
      imageUrl: o.imageUrl,
      oldPrice: o.oldPrice,
      newPrice: o.newPrice,
      discountPercentage: o.discountPercentage,
      offerType: o.offerType,
      startAt: o.startAt,
      endAt: o.endAt,
      isFeatured: o.isFeatured,
      status: o.status,
      impressions: o.impressions,
      views: o.views,
      mapClicks: o.mapClicks,
      callClicks: o.callClicks,
      whatsappClicks: o.whatsappClicks,
      shares: o.shares,
      category: o.category
        ? { id: o.category.id, name: o.category.name, slug: '', icon: '' }
        : null,
    })),
  })
}

/** POST /api/admin/offers — create offer (PRD §22 form) */
export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: 'بيانات ناقصة' }, { status: 400 })
  }

  const title = String(body.title || '').trim()
  const storeId = Number(body.storeId)
  const startAt = new Date(body.startAt)
  const endAt = new Date(body.endAt)

  if (!title) {
    return NextResponse.json({ error: 'عنوان العرض مطلوب' }, { status: 400 })
  }
  if (!Number.isFinite(storeId)) {
    return NextResponse.json({ error: 'لازم تختار المحل' }, { status: 400 })
  }
  if (isNaN(startAt.getTime()) || isNaN(endAt.getTime()) || endAt <= startAt) {
    return NextResponse.json(
      { error: 'تواريخ العرض غير صحيحة — تاريخ النهاية لازم يكون بعد البداية' },
      { status: 400 }
    )
  }

  const store = await db.store.findUnique({ where: { id: storeId } })
  if (!store) {
    return NextResponse.json({ error: 'المحل غير موجود' }, { status: 400 })
  }

  const oldPrice = body.oldPrice != null && body.oldPrice !== '' ? Number(body.oldPrice) : null
  const newPrice = body.newPrice != null && body.newPrice !== '' ? Number(body.newPrice) : null

  const offer = await db.offer.create({
    data: {
      storeId,
      categoryId: body.categoryId ? Number(body.categoryId) : null,
      title,
      description: String(body.description || ''),
      imageUrl: String(body.imageUrl || ''),
      oldPrice: oldPrice != null && !isNaN(oldPrice) ? oldPrice : null,
      newPrice: newPrice != null && !isNaN(newPrice) ? newPrice : null,
      discountPercentage: computeDiscount(oldPrice, newPrice),
      offerType: String(body.offerType || 'discount'),
      startAt,
      endAt,
      isFeatured: Boolean(body.isFeatured),
      status: ['ACTIVE', 'DRAFT', 'PAUSED'].includes(body.status)
        ? body.status
        : 'ACTIVE',
    },
  })

  return NextResponse.json({ offer }, { status: 201 })
}
