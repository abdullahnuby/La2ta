import { notFound, redirect } from 'next/navigation'
import { dbRequest } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function LegacyOfferPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const id = Number.parseInt(
    (await params).id,
    10
  )

  if (!Number.isFinite(id)) {
    notFound()
  }

  const rows =
    await dbRequest<Array<{
      id: number
      slug: string | null
    }>>(
      'offers',
      {
        query: {
          select: 'id,slug',
          id: `eq.${id}`,
          limit: 1,
        },
      }
    )

  const offer = rows?.[0]

  if (!offer) {
    notFound()
  }

  redirect(
    `/offer/${
      encodeURIComponent(
        offer.slug ||
          `offer-${offer.id}`
      )
    }`
  )
}
