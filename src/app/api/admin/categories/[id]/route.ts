import { NextRequest, NextResponse } from 'next/server'
import { dbRequest, supabaseError } from '@/lib/db'
import { requireAdmin } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

function mapCategory(c: any) {
  return { id: c.id, name: c.name, slug: c.slug, icon: c.icon, sortOrder: c.sort_order, isActive: c.is_active }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  const categoryId = Number.parseInt((await params).id, 10)
  if (!Number.isFinite(categoryId)) return NextResponse.json({ error: 'التصنيف غير موجود' }, { status: 404 })

  try {
    const current = await dbRequest<any[]>('categories', { query: { select: '*', id: `eq.${categoryId}`, limit: 1 } })
    const existing = current[0]
    if (!existing) return NextResponse.json({ error: 'التصنيف غير موجود' }, { status: 404 })

    const body = await req.json().catch(() => ({}))
    const data: { [key: string]: string | number | boolean | null } = {}
    if (body.name !== undefined) {
      const name = String(body.name).trim()
      if (!name) return NextResponse.json({ error: 'اسم التصنيف مطلوب' }, { status: 400 })
      data.name = name
    }
    if (body.slug !== undefined) {
      let slug = String(body.slug || '').trim().toLowerCase().replace(/[^a-z0-9-]/g, '')
      if (!slug) slug = existing.slug
      if (slug !== existing.slug) {
        const clash = await dbRequest<any[]>('categories', { query: { select: 'id', slug: `eq.${slug}`, limit: 1 } })
        if (clash.length) return NextResponse.json({ error: 'الـslug مستخدم بالفعل' }, { status: 400 })
      }
      data.slug = slug
    }
    if (body.icon !== undefined) data.icon = String(body.icon)
    if (body.sortOrder !== undefined && body.sortOrder !== '') {
      const n = Number(body.sortOrder)
      if (Number.isFinite(n)) data.sort_order = n
    }
    if (body.isActive !== undefined) data.is_active = Boolean(body.isActive)

    const rows = await dbRequest<any[]>('categories', {
      method: 'PATCH', query: { id: `eq.${categoryId}`, select: '*' }, body: data, returnRepresentation: true,
    })
    return NextResponse.json({ category: mapCategory(rows[0]) })
  } catch (error) {
    return NextResponse.json({ error: supabaseError(error) }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  const categoryId = Number.parseInt((await params).id, 10)
  if (!Number.isFinite(categoryId)) return NextResponse.json({ error: 'التصنيف غير موجود' }, { status: 404 })

  try {
    await dbRequest('categories', { method: 'DELETE', query: { id: `eq.${categoryId}` } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: supabaseError(error) }, { status: 500 })
  }
}
