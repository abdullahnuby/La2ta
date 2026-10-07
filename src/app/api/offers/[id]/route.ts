import { NextRequest, NextResponse } from 'next/server'
import { dbRequest, supabaseError } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const offerId = Number.parseInt((await params).id, 10)
  if (!Number.isFinite(offerId)) return NextResponse.json({ error: 'العرض غير موجود' }, { status: 404 })

  try {
    const now = new Date().toISOString()
    const rows = await dbRequest<any[]>('offers', {
      query: {
        select: 'id,store_id,category_id,title,description,image_url,old_price,new_price,discount_percentage,offer_type,is_featured,start_at,end_at,status,views,created_at,updated_at,category:categories(id,name,slug,icon),store:stores(id,name,description,phone,whatsapp,address,latitude,longitude,is_active)',
        id: `eq.${offerId}`,
        status: 'eq.ACTIVE',
        start_at: `lte.${now}`,
        end_at: `gt.${now}`,
        limit: 1,
      },
    })

    const data = rows?.[0]
    if (!data || !data.store?.is_active) {
      return NextResponse.json({ error: 'العرض مش متاح أو انتهى' }, { status: 404 })
    }

    return NextResponse.json({
      offer: {
        id: data.id,
        storeId: data.store_id,
        categoryId: data.category_id,
        title: data.title,
        description: data.description,
        imageUrl: data.image_url,
        oldPrice: data.old_price,
        newPrice: data.new_price,
        discountPercentage: data.discount_percentage,
        offerType: data.offer_type,
        isFeatured: data.is_featured,
        startAt: data.start_at,
        endAt: data.end_at,
        status: data.status,
        views: data.views,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        category: data.category ?? null,
        store: {
          id: data.store.id,
          name: data.store.name,
          description: data.store.description,
          phone: data.store.phone,
          whatsapp: data.store.whatsapp,
          address: data.store.address,
          latitude: data.store.latitude,
          longitude: data.store.longitude,
        },
      },
    })
  } catch (error) {
    return NextResponse.json({ error: supabaseError(error) }, { status: 500 })
  }
}
