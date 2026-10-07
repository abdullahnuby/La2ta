```ts
import { NextRequest, NextResponse } from 'next/server'
import { dbRequest, supabaseError } from '@/lib/db'
import { computeDiscount, requireAdmin } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  const offerId = Number.parseInt((await params).id, 10)
  if (!Number.isFinite(offerId)) return NextResponse.json({ error: 'العرض غير موجود' }, { status: 404 })

  try {
    const rows = await dbRequest<any[]>('offers', { query: { select: '*', id: `eq.${offerId}`, limit: 1 } })
    const existing = rows[0]
    if (!existing) return NextResponse.json({ error: 'العرض غير موجود' }, { status: 404 })

    const body = await req.json().catch(() => ({}))
    const data: { [key: string]: string | number | boolean | null } = {}

    if (body.title !== undefined) {
      const title = String(body.title).trim()
      if (!title) return NextResponse.json({ error: 'عنوان العرض مطلوب' }, { status: 400 })
      data.title = title
    }

    if (body.description !== undefined) data.description = String(body.description)
    if (body.imageUrl !== undefined) data.image_url = String(body.imageUrl)

    if (body.storeId !== undefined) {
      const storeId = Number(body.storeId)
      if (!Number.isFinite(storeId)) {
        return NextResponse.json({ error: 'المحل غير موجود' }, { status: 400 })
      }

      const store = await dbRequest<any[]>('stores', {
        query: { select: 'id', id: `eq.${storeId}`, limit: 1 },
      })

      if (!store[0]) {
        return NextResponse.json({ error: 'المحل غير موجود' }, { status: 400 })
      }

      data.store_id = storeId
    }

    if (body.categoryId !== undefined) {
      const categoryId = body.categoryId ? Number(body.categoryId) : null

      if (categoryId != null) {
        const category = await dbRequest<any[]>('categories', {
          query: { select: 'id', id: `eq.${categoryId}`, limit: 1 },
        })

        if (!category[0]) {
          return NextResponse.json({ error: 'التصنيف غير موجود' }, { status: 400 })
        }
      }

      data.category_id = categoryId
    }

    let oldPrice = existing.old_price as number | null
    let newPrice = existing.new_price as number | null

    if (body.oldPrice !== undefined) {
      const v = body.oldPrice === null || body.oldPrice === '' ? null : Number(body.oldPrice)
      oldPrice = v != null && Number.isFinite(v) ? v : null
      data.old_price = oldPrice
    }

    if (body.newPrice !== undefined) {
      const v = body.newPrice === null || body.newPrice === '' ? null : Number(body.newPrice)
      newPrice = v != null && Number.isFinite(v) ? v : null
      data.new_price = newPrice
    }

    if (body.oldPrice !== undefined || body.newPrice !== undefined || body.recomputeDiscount) {
      data.discount_percentage = computeDiscount(oldPrice, newPrice)
    }

    if (body.offerType !== undefined) data.offer_type = String(body.offerType)

    const finalStart =
      body.startAt !== undefined ? new Date(body.startAt) : new Date(existing.start_at)

    const finalEnd =
      body.endAt !== undefined ? new Date(body.endAt) : new Date(existing.end_at)

    if (Number.isNaN(finalStart.getTime())) {
      return NextResponse.json({ error: 'تاريخ البداية غير صحيح' }, { status: 400 })
    }

    if (Number.isNaN(finalEnd.getTime())) {
      return NextResponse.json({ error: 'تاريخ النهاية غير صحيح' }, { status: 400 })
    }

    if (finalEnd <= finalStart) {
      return NextResponse.json(
        { error: 'تاريخ النهاية لازم يكون بعد البداية' },
        { status: 400 }
      )
    }

    if (body.startAt !== undefined) data.start_at = finalStart.toISOString()
    if (body.endAt !== undefined) data.end_at = finalEnd.toISOString()

    if (body.isFeatured !== undefined) data.is_featured = Boolean(body.isFeatured)

    if (body.status !== undefined) {
      if (!['ACTIVE', 'DRAFT', 'PAUSED', 'EXPIRED'].includes(body.status)) {
        return NextResponse.json({ error: 'حالة غير صحيحة' }, { status: 400 })
      }

      data.status = body.status
    }

    const updated = await dbRequest<any[]>('offers', {
      method: 'PATCH',
      query: { id: `eq.${offerId}`, select: '*' },
      body: data,
      returnRepresentation: true,
    })

    return NextResponse.json({ offer: updated[0] })
  } catch (error) {
    return NextResponse.json({ error: supabaseError(error) }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  const offerId = Number.parseInt((await params).id, 10)
  if (!Number.isFinite(offerId)) {
    return NextResponse.json({ error: 'العرض غير موجود' }, { status: 404 })
  }

  try {
    await dbRequest('offers', {
      method: 'DELETE',
      query: { id: `eq.${offerId}` },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: supabaseError(error) }, { status: 500 })
  }
}
```
