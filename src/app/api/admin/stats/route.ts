import { NextRequest, NextResponse } from 'next/server'
import { dbRequest, supabaseError } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  try {
    const now = new Date().toISOString()
    await dbRequest('offers', { method: 'PATCH', query: { status: 'eq.ACTIVE', end_at: `lt.${now}` }, body: { status: 'EXPIRED' } })

    const [offers, stores, categories, top] = await Promise.all([
      dbRequest<any[]>('offers', { query: { select: 'status,start_at,end_at,impressions,views,map_clicks,call_clicks,whatsapp_clicks,shares' } }),
      dbRequest<any[]>('stores', { query: { select: 'id' } }),
      dbRequest<any[]>('categories', { query: { select: 'id' } }),
      dbRequest<any[]>('offers', { query: { select: 'id,title,status,views,map_clicks,call_clicks,whatsapp_clicks,shares,store:stores(name)', order: 'views.desc', limit: 8 } }),
    ])

    const totals = (offers ?? []).reduce((acc, o) => {
      acc.impressions += Number(o.impressions ?? 0)
      acc.views += Number(o.views ?? 0)
      acc.mapClicks += Number(o.map_clicks ?? 0)
      acc.callClicks += Number(o.call_clicks ?? 0)
      acc.whatsappClicks += Number(o.whatsapp_clicks ?? 0)
      acc.shares += Number(o.shares ?? 0)
      return acc
    }, { impressions: 0, views: 0, mapClicks: 0, callClicks: 0, whatsappClicks: 0, shares: 0 })

    return NextResponse.json({
      totals: {
        offers: offers?.length ?? 0,
        active: (offers ?? []).filter((o) => o.status === 'ACTIVE' && o.start_at <= now && o.end_at > now).length,
        stores: stores?.length ?? 0,
        categories: categories?.length ?? 0,
        ...totals,
      },
      top: (top ?? []).map((o) => ({
        id: o.id,
        title: o.title,
        storeName: o.store?.name ?? '',
        status: o.status,
        views: o.views,
        mapClicks: o.map_clicks,
        callClicks: o.call_clicks,
        whatsappClicks: o.whatsapp_clicks,
        shares: o.shares,
      })),
    })
  } catch (error) {
    return NextResponse.json({ error: supabaseError(error) }, { status: 500 })
  }
}
