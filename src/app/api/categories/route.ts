import { NextResponse } from 'next/server'
import { dbRequest, supabaseError } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const data = await dbRequest<any[]>('categories', {
      query: {
        select: 'id,name,slug,icon,sort_order,is_active',
        is_active: 'eq.true',
        order: 'sort_order.asc,id.asc',
      },
    })

    return NextResponse.json({
      categories: (data ?? []).map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        icon: c.icon,
        sortOrder: c.sort_order,
        isActive: c.is_active,
      })),
    })
  } catch (error) {
    return NextResponse.json({ error: supabaseError(error) }, { status: 500 })
  }
}
