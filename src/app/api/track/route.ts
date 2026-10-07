import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

const EVENT_COLUMNS: Record<string, string> = {
  impression: 'impressions',
  view: 'views',
  map: 'mapClicks',
  call: 'callClicks',
  whatsapp: 'whatsappClicks',
  share: 'shares',
}

/**
 * POST /api/track — lightweight built-in analytics (PRD §27)
 * body: { offerId: number, event: 'impression'|'view'|'map'|'call'|'whatsapp'|'share' }
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const offerId = Number(body?.offerId)
  const column = EVENT_COLUMNS[body?.event as string]

  if (!Number.isFinite(offerId) || !column) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  await db.offer
    .update({
      where: { id: offerId },
      data: { [column]: { increment: 1 } } as Record<string, never>,
    })
    .catch(() => {})

  return NextResponse.json({ ok: true })
}
