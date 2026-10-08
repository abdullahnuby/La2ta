import { NextRequest, NextResponse } from 'next/server'
import { dbRequest, supabaseError } from '@/lib/db'
import { getAuthenticatedUserId } from '@/lib/supabase-auth-server'

export const dynamic = 'force-dynamic'

function unauthorized() {
  return NextResponse.json(
    { error: 'لازم تسجل دخولك علشان تستخدم التنبيهات.' },
    { status: 401 }
  )
}

function hoursUntil(endAt: string) {
  return (new Date(endAt).getTime() - Date.now()) / 36e5
}

async function getExpiringFavoriteOffers(userId: string) {
  const favorites = await dbRequest<Array<{ offer_id: number }>>('user_favorites', {
    query: {
      select: 'offer_id',
      user_id: `eq.${userId}`,
      limit: 500,
    },
  })

  const ids = (favorites ?? []).map((row) => row.offer_id)
  if (ids.length === 0) return []

  const now = new Date().toISOString()
  const cutoff = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()

  return dbRequest<any[]>('offers', {
    query: {
      select: 'id,slug,title,end_at,status,store:stores(name,is_active)',
      id: `in.(${ids.join(',')})`,
      status: 'eq.ACTIVE',
      start_at: `lte.${now}`,
      end_at: `gt.${now}`,
      limit: 500,
    },
  }).then((offers) =>
    (offers ?? []).filter(
      (offer) =>
        offer.store?.is_active !== false &&
        new Date(offer.end_at).getTime() <= new Date(cutoff).getTime()
    )
  )
}

async function ensureGeneratedNotifications(userId: string, offers: any[]) {
  for (const offer of offers) {
    const storeName = typeof offer.store?.name === 'string' ? offer.store.name.trim() : ''
    const remainingHours = Math.max(1, Math.ceil(hoursUntil(offer.end_at)))
    const body = storeName
      ? `العرض «${offer.title}» من ${storeName} هينتهي خلال ${remainingHours} ساعة.`
      : `العرض «${offer.title}» هينتهي خلال ${remainingHours} ساعة.`

    try {
      await dbRequest('user_notifications', {
        method: 'POST',
        body: {
          user_id: userId,
          notification_key: `favorite-expiring:${offer.id}`,
          type: 'favorite_expiring',
          offer_id: offer.id,
          title: 'عرض مفضل قرب يخلص ⏳',
          body,
          href: `/offer/${encodeURIComponent(offer.slug || `offer-${offer.id}`)}`,
        },
      })
    } catch (error) {
      if (!/duplicate|unique/i.test(supabaseError(error))) throw error
    }
  }
}

async function listNotifications(userId: string) {
  return dbRequest<any[]>('user_notifications', {
    query: {
      select: 'id,type,offer_id,title,body,href,created_at,read_at',
      user_id: `eq.${userId}`,
      order: 'created_at.desc',
      limit: 50,
    },
  })
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request)
    if (!userId) return unauthorized()

    const expiringOffers = await getExpiringFavoriteOffers(userId)
    await ensureGeneratedNotifications(userId, expiringOffers)
    const notifications = await listNotifications(userId)

    return NextResponse.json({
      notifications: notifications ?? [],
      unreadCount: (notifications ?? []).filter((item) => !item.read_at).length,
    })
  } catch (error) {
    return NextResponse.json({ error: supabaseError(error) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request)
    if (!userId) return unauthorized()

    const body = (await request.json().catch(() => null)) as {
      notificationId?: unknown
      all?: boolean
    } | null

    if (body?.all === true) {
      await dbRequest('user_notifications', {
        method: 'PATCH',
        query: {
          user_id: `eq.${userId}`,
          read_at: 'is.null',
        },
        body: { read_at: new Date().toISOString() },
      })
      return NextResponse.json({ ok: true })
    }

    const notificationId = Number(body?.notificationId)
    if (!Number.isInteger(notificationId) || notificationId <= 0) {
      return NextResponse.json({ error: 'رقم التنبيه غير صحيح.' }, { status: 400 })
    }

    await dbRequest('user_notifications', {
      method: 'PATCH',
      query: {
        id: `eq.${notificationId}`,
        user_id: `eq.${userId}`,
      },
      body: { read_at: new Date().toISOString() },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: supabaseError(error) }, { status: 500 })
  }
}
