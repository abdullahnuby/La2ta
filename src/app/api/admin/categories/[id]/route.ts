import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

/** PATCH /api/admin/categories/[id] */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  const { id } = await params
  const categoryId = Number.parseInt(id, 10)
  if (!Number.isFinite(categoryId)) {
    return NextResponse.json({ error: 'التصنيف غير موجود' }, { status: 404 })
  }

  const existing = await db.category.findUnique({ where: { id: categoryId } })
  if (!existing) {
    return NextResponse.json({ error: 'التصنيف غير موجود' }, { status: 404 })
  }

  const body = await req.json().catch(() => ({}))
  const data: Record<string, unknown> = {}

  if (body.name !== undefined) {
    const name = String(body.name).trim()
    if (!name) {
      return NextResponse.json({ error: 'اسم التصنيف مطلوب' }, { status: 400 })
    }
    data.name = name
  }

  if (body.slug !== undefined) {
    let slug = String(body.slug || '').trim().toLowerCase().replace(/[^a-z0-9-]/g, '')
    if (!slug) slug = existing.slug
    if (slug !== existing.slug) {
      const clash = await db.category.findUnique({ where: { slug } })
      if (clash) {
        return NextResponse.json({ error: 'الـslug مستخدم بالفعل' }, { status: 400 })
      }
    }
    data.slug = slug
  }

  if (body.icon !== undefined) data.icon = String(body.icon)
  if (body.sortOrder !== undefined && body.sortOrder !== '') {
    const n = Number(body.sortOrder)
    if (Number.isFinite(n)) data.sortOrder = n
  }
  if (body.isActive !== undefined) data.isActive = Boolean(body.isActive)

  const category = await db.category.update({ where: { id: categoryId }, data })
  return NextResponse.json({ category })
}

/** DELETE /api/admin/categories/[id] — offers keep existing (categoryId → null) */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  const { id } = await params
  const categoryId = Number.parseInt(id, 10)
  if (!Number.isFinite(categoryId)) {
    return NextResponse.json({ error: 'التصنيف غير موجود' }, { status: 404 })
  }

  await db.category.delete({ where: { id: categoryId } }).catch(() => {})
  return NextResponse.json({ ok: true })
}
