import { NextRequest, NextResponse } from 'next/server'
import { dbRequest, supabaseError } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

function mapCategory(c: any) {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    icon: c.icon,
    sortOrder: c.sort_order,
    isActive: c.is_active,
    offersCount: Number(c.offers?.[0]?.count ?? 0),
  }
}

export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  try {
    const data = await dbRequest<any[]>('categories', {
      query: { select: 'id,name,slug,icon,sort_order,is_active,offers(count)', order: 'sort_order.asc,id.asc' },
    })
    return NextResponse.json({ categories: (data ?? []).map(mapCategory) })
  } catch (error) {
    return NextResponse.json({ error: supabaseError(error) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  try {
    const body = await req.json().catch(() => null)
    const name = String(body?.name || '').trim()
    if (!name) return NextResponse.json({ error: 'اسم التصنيف مطلوب' }, { status: 400 })

    let slug = String(body?.slug || '').trim().toLowerCase().replace(/[^a-z0-9-]/g, '')
    if (!slug) slug = `c${Date.now().toString(36)}`

    const existing = await dbRequest<any[]>('categories', { query: { select: 'id', slug: `eq.${slug}`, limit: 1 } })
    if (existing.length) return NextResponse.json({ error: 'الـslug مستخدم بالفعل — اختار واحد مختلف' }, { status: 400 })

    let sortOrder: number
    if (body?.sortOrder != null && body.sortOrder !== '') sortOrder = Number(body.sortOrder)
    else {
      const maxRows = await dbRequest<any[]>('categories', { query: { select: 'sort_order', order: 'sort_order.desc', limit: 1 } })
      sortOrder = Number(maxRows[0]?.sort_order ?? 0) + 1
    }

    const rows = await dbRequest<any[]>('categories', {
      method: 'POST', query: { select: '*' }, body: {
        name, slug, icon: String(body?.icon || ''), sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
        is_active: body?.isActive === undefined ? true : Boolean(body.isActive),
      }, returnRepresentation: true,
    })
    return NextResponse.json({ category: mapCategory(rows[0]) }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: supabaseError(error) }, { status: 500 })
  }
}
