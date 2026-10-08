import { NextRequest, NextResponse } from 'next/server'
import { dbRequest, supabaseError } from '@/lib/db'
import { getAuthenticatedUserId } from '@/lib/supabase-auth-server'

export const dynamic = 'force-dynamic'

function unauthorized() {
  return NextResponse.json(
    { error: 'لازم تسجل دخولك علشان تستخدم المفضلة.' },
    { status: 401 }
  )
}

function mapOffer(offer: any) {
  const gallery = Array.isArray(offer.image_urls)
    ? offer.image_urls
        .filter((value: unknown): value is string => typeof value === 'string')
        .map((value: string) => value.trim())
        .filter(Boolean)
        .slice(0, 5)
    : []

  const legacy = typeof offer.image_url === 'string' ? offer.image_url.trim() : ''
  const imageUrls = gallery.length > 0 ? gallery : legacy ? [legacy] : []

  return {
    id: offer.id,
    slug: typeof offer.slug === 'string' && offer.slug.trim() ? offer.slug.trim() : `offer-${offer.id}`,
    title: offer.title,
    description: offer.description,
    imageUrl: imageUrls[0] ?? '',
    imageUrls,
    oldPrice: offer.old_price,
    newPrice: offer.new_price,
    discountPercentage: offer.discount_percentage,
    offerType: offer.offer_type,
    isFeatured: offer.is_featured,
    startAt: offer.start_at,
    endAt: offer.end_at,
    category: offer.category ?? null,
  }
}

async function loadFavorites(userId: string) {
  const rows = await dbRequest<Array<{ offer_id: number; created_at: string }>>('user_favorites', {
    query: {
      select: 'offer_id,created_at',
      user_id: `eq.${userId}`,
      order: 'created_at.desc',
      limit: 500,
    },
  })

  const ids = (rows ?? []).map((row) => row.offer_id)
  if (ids.length === 0) return { favoriteOfferIds: [], offers: [] }

  const now = new Date().toISOString()
  const offers = await dbRequest<any[]>('offers', {
    query: {
      select:
        'id,slug,title,description,image_url,image_urls,old_price,new_price,discount_percentage,offer_type,is_featured,start_at,end_at,created_at,category:categories(id,name,slug,icon)',
      id: `in.(${ids.join(',')})`,
      status: 'eq.ACTIVE',
      start_at: `lte.${now}`,
      end_at: `gt.${now}`,
      order: 'created_at.desc',
      limit: 500,
    },
  })

  return {
    favoriteOfferIds: ids,
    offers: (offers ?? []).map(mapOffer),
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request)
    if (!userId) return unauthorized()
    return NextResponse.json(await loadFavorites(userId))
  } catch (error) {
    return NextResponse.json({ error: supabaseError(error) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request)
    if (!userId) return unauthorized()

    const body = (await request.json().catch(() => null)) as { offerId?: unknown } | null
    const offerId = typeof body?.offerId === 'number' ? Math.floor(body.offerId) : Number(body?.offerId)

    if (!Number.isInteger(offerId) || offerId <= 0) {
      return NextResponse.json({ error: 'رقم العرض غير صحيح.' }, { status: 400 })
    }

    const offerRows = await dbRequest<Array<{ id: number }>>('offers', {
      query: {
        select: 'id',
        id: `eq.${offerId}`,
        status: 'eq.ACTIVE',
        limit: 1,
      },
    })

    if (!offerRows?.length) {
      return NextResponse.json({ error: 'العرض ده مش متاح دلوقتي.' }, { status: 404 })
    }

    await dbRequest('user_favorites', {
      method: 'POST',
      body: { user_id: userId, offer_id: offerId },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = supabaseError(error)
    if (/duplicate|unique/i.test(message)) return NextResponse.json({ ok: true })
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request)
    if (!userId) return unauthorized()

    const body = (await request.json().catch(() => null)) as { offerId?: unknown } | null
    const offerId = typeof body?.offerId === 'number' ? Math.floor(body.offerId) : Number(body?.offerId)

    if (!Number.isInteger(offerId) || offerId <= 0) {
      return NextResponse.json({ error: 'رقم العرض غير صحيح.' }, { status: 400 })
    }

    await dbRequest('user_favorites', {
      method: 'DELETE',
      query: {
        user_id: `eq.${userId}`,
        offer_id: `eq.${offerId}`,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: supabaseError(error) }, { status: 500 })
  }
}
