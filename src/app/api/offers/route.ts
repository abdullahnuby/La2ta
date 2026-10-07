import { NextRequest, NextResponse } from 'next/server'
import { dbRequest, supabaseError } from '@/lib/db'

export const dynamic = 'force-dynamic'

function normalize(value: string) {
  return value.trim().toLocaleLowerCase('ar-EG')
}

function imageUrlsForOffer(offer: any): string[] {
  const fromGallery = Array.isArray(offer.image_urls)
    ? offer.image_urls
        .filter((url: unknown): url is string => typeof url === 'string')
        .map((url) => url.trim())
        .filter(Boolean)
        .slice(0, 5)
    : []

  if (fromGallery.length > 0) return fromGallery

  const legacy = typeof offer.image_url === 'string'
    ? offer.image_url.trim()
    : ''

  return legacy ? [legacy] : []
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const q = normalize(searchParams.get('q') || '')
    const cat = normalize(searchParams.get('cat') || '')
    const featured = searchParams.get('featured') === '1'

    const requestedPage = Number(searchParams.get('page') || '')
    const requestedLimit = Number(searchParams.get('limit') || '')

    const isPaginated =
      Number.isFinite(requestedPage) &&
      requestedPage >= 1 &&
      Number.isFinite(requestedLimit) &&
      requestedLimit >= 1

    const page = isPaginated ? Math.floor(requestedPage) : 1
    const limit = isPaginated
      ? Math.min(Math.floor(requestedLimit), 50)
      : 100

    const now = new Date().toISOString()

    await dbRequest('offers', {
      method: 'PATCH',
      query: {
        status: 'eq.ACTIVE',
        end_at: `lt.${now}`,
      },
      body: { status: 'EXPIRED' },
    })

    const stores = await dbRequest<any[]>('stores', {
      query: {
        select: 'id',
        is_active: 'eq.true',
      },
    })

    const storeIds = (stores ?? []).map((s) => s.id)

    if (storeIds.length === 0) {
      return NextResponse.json({
        offers: [],
        page,
        limit,
        hasMore: false,
      })
    }

    const data = await dbRequest<any[]>('offers', {
      query: {
        select:
          'id,title,description,image_url,image_urls,old_price,new_price,discount_percentage,offer_type,is_featured,start_at,end_at,created_at,category:categories(id,name,slug,icon)',
        status: 'eq.ACTIVE',
        start_at: `lte.${now}`,
        end_at: `gt.${now}`,
        store_id: `in.(${storeIds.join(',')})`,
        order: 'is_featured.desc,created_at.desc',
        offset: isPaginated ? (page - 1) * limit : 0,
        limit: isPaginated ? limit : 100,
      },
    })

    const filtered = (data ?? [])
      .filter((o) => !featured || o.is_featured)
      .filter(
        (o) => !cat || normalize(o.category?.slug || '') === cat
      )
      .filter((o) => {
        if (!q) return true

        const haystack = normalize(
          `${o.title || ''} ${o.description || ''}`
        )

        return haystack.includes(q)
      })

    const offers = isPaginated ? filtered : filtered.slice(0, 100)

    return NextResponse.json({
      offers: offers.map((o) => {
        const imageUrls = imageUrlsForOffer(o)

        return {
          id: o.id,
          title: o.title,
          description: o.description,
          imageUrl: imageUrls[0] ?? '',
          imageUrls,
          oldPrice: o.old_price,
          newPrice: o.new_price,
          discountPercentage: o.discount_percentage,
          offerType: o.offer_type,
          isFeatured: o.is_featured,
          startAt: o.start_at,
          endAt: o.end_at,
          category: o.category ?? null,
        }
      }),
      page,
      limit,
      hasMore: isPaginated && filtered.length === limit,
    })
  } catch (error) {
    return NextResponse.json(
      { error: supabaseError(error) },
      { status: 500 }
    )
  }
}
