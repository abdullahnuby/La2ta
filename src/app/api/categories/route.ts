import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

/** GET /api/categories — active categories ordered for the homepage chips */
export async function GET() {
  const categories = await db.category.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    select: {
      id: true,
      name: true,
      slug: true,
      icon: true,
      sortOrder: true,
      isActive: true,
    },
  })
  return NextResponse.json({ categories })
}
