import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

/** GET /api/admin/categories — all categories (including hidden) ordered */
export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  const categories = await db.category.findMany({
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    include: { _count: { select: { offers: true } } },
  })

  return NextResponse.json({
    categories: categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      icon: c.icon,
      sortOrder: c.sortOrder,
      isActive: c.isActive,
      offersCount: c._count.offers,
    })),
  })
}

/** POST /api/admin/categories */
export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const name = String(body?.name || '').trim()
  if (!name) {
    return NextResponse.json({ error: 'اسم التصنيف مطلوب' }, { status: 400 })
  }

  let slug = String(body?.slug || '').trim().toLowerCase().replace(/[^a-z0-9-]/g, '')
  if (!slug) slug = `c${Date.now().toString(36)}`

  const clash = await db.category.findUnique({ where: { slug } })
  if (clash) {
    return NextResponse.json({ error: 'الـslug مستخدم بالفعل — اختار واحد مختلف' }, { status: 400 })
  }

  const maxOrder = await db.category.aggregate({ _max: { sortOrder: true } })
  const sortOrder =
    body?.sortOrder != null && body.sortOrder !== ''
      ? Number(body.sortOrder)
      : (maxOrder._max.sortOrder ?? 0) + 1

  const category = await db.category.create({
    data: {
      name,
      slug,
      icon: String(body?.icon || ''),
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
      isActive: body?.isActive === undefined ? true : Boolean(body.isActive),
    },
  })

  return NextResponse.json({ category }, { status: 201 })
}
