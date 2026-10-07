import { NextRequest, NextResponse } from 'next/server'
import { dbRequest, supabaseError } from '@/lib/db'

export const dynamic = 'force-dynamic'

function normalize(value: string) {
  return value.trim().toLocaleLowerCase('ar-EG')
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const q = normalize(searchParams.get('q') || '')
    const cat = normalize(searchParams.get('cat') || '')
    const featured = searchParams.get('featured') === '1'
    const now = new Date().toISOString()

    // Lazy expiration keeps the admin dashboard truthful without a cron job.
    await dbRequest('offers', {
      method: 'PATCH',
      query: { status: 'eq.ACTIVE', end_at: `lt.${now}` },
      body: { status: 'EXPIRED' },
    })

    const stores = await dbRequest<any[]>('stores', {
      query: { select: 'id', is_active: 'eq.true' },
    })
    const storeIds = (stores ?? []).map((s) => s.id)
    if (storeIds.length === 0) return NextResponse.json({ offers: [] })

    const data = await dbRequest<any[]>('offers', {
      query: {
        select: 'id,title,description,image_url,old_price,new_price,discount_percentage,offer_type,is_featured,start_at,end_at,created_at,category:categories(id,name,slug,icon)',
        status: 'eq.ACTIVE',
        start_at: `lte.${now}`,
        end_at: `gt.${now}`,
        store_id: `in.(${storeIds.join(',')})`,
        order: 'is_featured.desc,created_at.desc',
        limit: 500,
      },
    })

    const filtered = (data ?? [])
      .filter((o) => !featured || o.is_featured)
      .filter((o) => !cat || normalize(o.category?.slug || '') === cat)
      .filter((o) => {
        if (!q) return true
        const haystack = normalize(`${o.title || ''} ${o.description || ''}`)
        return haystack.includes(q)
      })
      .slice(0, 100)

    return NextResponse.json({
      offers: filtered.map((o) => ({
        id: o.id,
        title: o.title,
        description: o.description,
        imageUrl: o.image_url,
        oldPrice: o.old_price,
        newPrice: o.new_price,
        discountPercentage: o.discount_percentage,
        offerType: o.offer_type,
        isFeatured: o.is_featured,
        startAt: o.start_at,
        endAt: o.end_at,
        category: o.category ?? null,
      })),
    })
  } catch (error) {
    return NextResponse.json({ error: supabaseError(error) }, { status: 500 })
  }
}
