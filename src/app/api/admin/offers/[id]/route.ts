import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { computeDiscount, requireAdmin } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

/** PATCH /api/admin/offers/[id] — update fields / status actions */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  const { id } = await params
  const offerId = Number.parseInt(id, 10)
  if (!Number.isFinite(offerId)) {
    return NextResponse.json({ error: 'العرض غير موجود' }, { status: 404 })
  }

  const existing = await db.offer.findUnique({ where: { id: offerId } })
  if (!existing) {
    return NextResponse.json({ error: 'العرض غير موجود' }, { status: 404 })
  }

  const body = await req.json().catch(() => ({}))

  const data: Record<string, unknown> = {}

  if (body.title !== undefined) {
    const title = String(body.title).trim()
    if (!title) {
      return NextResponse.json({ error: 'عنوان العرض مطلوب' }, { status: 400 })
    }
    data.title = title
  }
  if (body.description !== undefined) data.description = String(body.description)
  if (body.imageUrl !== undefined) data.imageUrl = String(body.imageUrl)

  if (body.storeId !== undefined) {
    const storeId = Number(body.storeId)
    const store = await db.store.findUnique({ where: { id: storeId } })
    if (!store) {
      return NextResponse.json({ error: 'المحل غير موجود' }, { status: 400 })
    }
    data.storeId = storeId
  }
  if (body.categoryId !== undefined) {
    data.categoryId = body.categoryId ? Number(body.categoryId) : null
  }

  let oldPrice = existing.oldPrice
  let newPrice = existing.newPrice
  if (body.oldPrice !== undefined) {
    const v = body.oldPrice === null || body.oldPrice === '' ? null : Number(body.oldPrice)
    oldPrice = v != null && !isNaN(v) ? v : null
    data.oldPrice = oldPrice
  }
  if (body.newPrice !== undefined) {
    const v = body.newPrice === null || body.newPrice === '' ? null : Number(body.newPrice)
    newPrice = v != null && !isNaN(v) ? v : null
    data.newPrice = newPrice
  }
  if (body.oldPrice !== undefined || body.newPrice !== undefined || body.recomputeDiscount) {
    data.discountPercentage = computeDiscount(oldPrice, newPrice)
  }

  if (body.offerType !== undefined) data.offerType = String(body.offerType)

  if (body.startAt !== undefined) {
    const d = new Date(body.startAt)
    if (isNaN(d.getTime())) {
      return NextResponse.json({ error: 'تاريخ البداية غير صحيح' }, { status: 400 })
    }
    data.startAt = d
  }
  if (body.endAt !== undefined) {
    const d = new Date(body.endAt)
    if (isNaN(d.getTime())) {
      return NextResponse.json({ error: 'تاريخ النهاية غير صحيح' }, { status: 400 })
    }
    data.endAt = d
  }

  // Keep end > start
  const finalStart = (data.startAt as Date) ?? existing.startAt
  const finalEnd = (data.endAt as Date) ?? existing.endAt
  if (finalEnd <= finalStart) {
    return NextResponse.json(
      { error: 'تاريخ النهاية لازم يكون بعد البداية' },
      { status: 400 }
    )
  }

  if (body.isFeatured !== undefined) data.isFeatured = Boolean(body.isFeatured)

  if (body.status !== undefined) {
    if (!['ACTIVE', 'DRAFT', 'PAUSED', 'EXPIRED'].includes(body.status)) {
      return NextResponse.json({ error: 'حالة غير صحيحة' }, { status: 400 })
    }
    data.status = body.status
  }

  const offer = await db.offer.update({ where: { id: offerId }, data })
  return NextResponse.json({ offer })
}

/** DELETE /api/admin/offers/[id] */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  const { id } = await params
  const offerId = Number.parseInt(id, 10)
  if (!Number.isFinite(offerId)) {
    return NextResponse.json({ error: 'العرض غير موجود' }, { status: 404 })
  }

  await db.offer.delete({ where: { id: offerId } }).catch(() => {})
  return NextResponse.json({ ok: true })
}
