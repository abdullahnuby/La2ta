import { NextRequest, NextResponse } from 'next/server'
import { dbRequest, supabaseError } from '@/lib/db'
import { computeDiscount, requireAdmin } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

function sanitizeImageUrls(value: unknown): string[] {
  const values = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? (() => {
          const trimmed = value.trim()
          if (!trimmed) return []

          try {
            const parsed = JSON.parse(trimmed)
            return Array.isArray(parsed) ? parsed : [trimmed]
          } catch {
            return [trimmed]
          }
        })()
      : []

  return values
    .filter((url): url is string => typeof url === 'string')
    .map((url) => url.trim())
    .filter(Boolean)
    .slice(0, 5)
}

function mapOffer(o: any) {
  const imageUrls = sanitizeImageUrls(o.image_urls)

  const normalizedImageUrls =
    imageUrls.length > 0
      ? imageUrls
      : typeof o.image_url === 'string' && o.image_url.trim()
        ? [o.image_url.trim()]
        : []

  return {
    id: o.id,
    storeId: o.store_id,
    storeName: o.store?.name ?? '',
    categoryId: o.category_id,
    categoryName: o.category?.name ?? null,
    title: o.title,
    description: o.description,
    imageUrl: normalizedImageUrls[0] ?? '',
    imageUrls: normalizedImageUrls,
    oldPrice: o.old_price,
    newPrice: o.new_price,
    discountPercentage: o.discount_percentage,
    offerType: o.offer_type,
    startAt: o.start_at,
    endAt: o.end_at,
    isFeatured: o.is_featured,
    status: o.status,
    impressions: o.impressions,
    views: o.views,
    mapClicks: o.map_clicks,
    callClicks: o.call_clicks,
    whatsappClicks: o.whatsapp_clicks,
    shares: o.shares,
    category: o.category
      ? {
          id: o.category.id,
          name: o.category.name,
          slug: o.category.slug,
          icon: o.category.icon,
        }
      : null,
  }
}

export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json(
      { error: 'غير مصرح' },
      { status: 401 }
    )
  }

  try {
    const now = new Date().toISOString()

    await dbRequest('offers', {
      method: 'PATCH',
      query: {
        status: 'eq.ACTIVE',
        end_at: `lt.${now}`,
      },
      body: { status: 'EXPIRED' },
    })

    const data = await dbRequest<any[]>('offers', {
      query: {
        select:
          'id,store_id,category_id,title,description,image_url,image_urls,old_price,new_price,discount_percentage,offer_type,start_at,end_at,is_featured,status,impressions,views,map_clicks,call_clicks,whatsapp_clicks,shares,store:stores(id,name),category:categories(id,name,slug,icon)',
        order: 'created_at.desc',
      },
    })

    return NextResponse.json({
      offers: (data ?? []).map(mapOffer),
    })
  } catch (error) {
    return NextResponse.json(
      { error: supabaseError(error) },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json(
      { error: 'غير مصرح' },
      { status: 401 }
    )
  }

  try {
    const body = await req.json().catch(() => null)

    if (!body) {
      return NextResponse.json(
        { error: 'بيانات ناقصة' },
        { status: 400 }
      )
    }

    const title = String(body.title || '').trim()
    const storeId = Number(body.storeId)
    const categoryId = body.categoryId
      ? Number(body.categoryId)
      : null
    const startAt = new Date(body.startAt)
    const endAt = new Date(body.endAt)

    if (!title) {
      return NextResponse.json(
        { error: 'عنوان العرض مطلوب' },
        { status: 400 }
      )
    }

    if (!Number.isFinite(storeId)) {
      return NextResponse.json(
        { error: 'لازم تختار المحل' },
        { status: 400 }
      )
    }

    if (
      Number.isNaN(startAt.getTime()) ||
      Number.isNaN(endAt.getTime()) ||
      endAt <= startAt
    ) {
      return NextResponse.json(
        {
          error:
            'تواريخ العرض غير صحيحة — تاريخ النهاية لازم يكون بعد البداية',
        },
        { status: 400 }
      )
    }

    const store = await dbRequest<any[]>('stores', {
      query: {
        select: 'id',
        id: `eq.${storeId}`,
        limit: 1,
      },
    })

    if (!store[0]) {
      return NextResponse.json(
        { error: 'المحل غير موجود' },
        { status: 400 }
      )
    }

    if (categoryId != null) {
      const category = await dbRequest<any[]>('categories', {
        query: {
          select: 'id',
          id: `eq.${categoryId}`,
          limit: 1,
        },
      })

      if (!category[0]) {
        return NextResponse.json(
          { error: 'التصنيف غير موجود' },
          { status: 400 }
        )
      }
    }

    const imageUrls = sanitizeImageUrls(
      body.imageUrls !== undefined
        ? body.imageUrls
        : body.imageUrl
    )

    const oldPrice =
      body.oldPrice != null && body.oldPrice !== ''
        ? Number(body.oldPrice)
        : null

    const newPrice =
      body.newPrice != null && body.newPrice !== ''
        ? Number(body.newPrice)
        : null

    const status = ['ACTIVE', 'DRAFT', 'PAUSED'].includes(body.status)
      ? body.status
      : 'ACTIVE'

    const rows = await dbRequest<any[]>('offers', {
      method: 'POST',
      query: { select: '*' },
      returnRepresentation: true,
      body: {
        store_id: storeId,
        category_id: categoryId,
        title,
        description: String(body.description || ''),
        image_url: imageUrls[0] ?? '',
        image_urls: imageUrls,
        old_price:
          oldPrice != null && Number.isFinite(oldPrice)
            ? oldPrice
            : null,
        new_price:
          newPrice != null && Number.isFinite(newPrice)
            ? newPrice
            : null,
        discount_percentage: computeDiscount(
          oldPrice,
          newPrice
        ),
        offer_type: String(body.offerType || 'discount'),
        start_at: startAt.toISOString(),
        end_at: endAt.toISOString(),
        is_featured: Boolean(body.isFeatured),
        status,
      },
    })

    return NextResponse.json(
      { offer: mapOffer(rows[0]) },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: supabaseError(error) },
      { status: 500 }
    )
  }
}
