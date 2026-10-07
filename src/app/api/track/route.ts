import { NextRequest, NextResponse } from 'next/server'
import { dbRequest, supabaseError } from '@/lib/db'

export const dynamic = 'force-dynamic'

const EVENT_COLUMNS: Record<string, string> = {
  impression: 'impressions',
  view: 'views',
  map: 'map_clicks',
  call: 'call_clicks',
  whatsapp: 'whatsapp_clicks',
  share: 'shares',
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const offerId = Number(body?.offerId)
  const column = EVENT_COLUMNS[body?.event as string]

  if (!Number.isFinite(offerId) || !column) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  try {
    const current = await dbRequest<any[]>('offers', {
      query: { select: `id,${column}`, id: `eq.${offerId}`, limit: 1 },
    })
    if (!current?.[0]) return NextResponse.json({ ok: true })

    await dbRequest('offers', {
      method: 'PATCH',
      query: { id: `eq.${offerId}` },
      body: { [column]: Number(current[0][column] ?? 0) + 1 },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: supabaseError(error) }, { status: 500 })
  }
}
