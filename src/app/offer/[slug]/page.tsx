import type { Metadata } from 'next'
import SharedOfferPageClient from '@/components/la2ta/shared-offer-page'
import { dbRequest } from '@/lib/db'

export const dynamic = 'force-dynamic'

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://la2ta-silk.vercel.app'

function imageUrlsForOffer(
  offer: any
): string[] {
  const gallery = Array.isArray(
    offer.image_urls
  )
    ? offer.image_urls
        .filter(
          (url: unknown): url is string =>
            typeof url === 'string'
        )
        .map((url) => url.trim())
        .filter(Boolean)
        .slice(0, 5)
    : []

  if (gallery.length > 0) {
    return gallery
  }

  const legacy =
    typeof offer.image_url === 'string'
      ? offer.image_url.trim()
      : ''

  return legacy ? [legacy] : []
}

async function getOfferBySlug(slug: string) {
  const now =
    new Date().toISOString()

  const rows =
    await dbRequest<any[]>(
      'offers',
      {
        query: {
          select:
            'id,slug,title,description,image_url,image_urls,old_price,new_price,start_at,end_at,status,store:stores(id,name,is_active)',
          slug: `eq.${slug}`,
          status:
            'eq.ACTIVE',
          start_at:
            `lte.${now}`,
          end_at:
            `gt.${now}`,
          limit: 1,
        },
      }
    )

  const offer = rows?.[0]

  if (
    !offer ||
    !offer.store?.is_active
  ) {
    return null
  }

  return offer
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const slug =
    decodeURIComponent(
      (await params).slug
    )

  try {
    const offer =
      await getOfferBySlug(slug)

    if (!offer) {
      return {
        title:
          'العرض غير متاح | لقطة',
      }
    }

    const images =
      imageUrlsForOffer(
        offer
      )

    const description =
      offer.description?.trim() ||
      `اكتشف ${offer.title} على لقطة — عروض حقيقية محدودة المدة في الأقصر.`

    const url =
      `${siteUrl}/offer/${encodeURIComponent(slug)}`

    return {
      title:
        `${offer.title} | لقطة`,
      description,
      alternates: {
        canonical: url,
      },
      openGraph: {
        title:
          `${offer.title} | لقطة`,
        description,
        type: 'website',
        locale: 'ar_EG',
        url,
        siteName: 'لقطة',
        images: images.map(
          (image) => ({
            url: image,
            alt:
              offer.title,
          })
        ),
      },
      twitter: {
        card:
          'summary_large_image',
        title:
          `${offer.title} | لقطة`,
        description,
        images:
          images.slice(0, 1),
      },
    }
  } catch {
    return {
      title:
        'لقطة | عروض الأقصر',
    }
  }
}

export default async function OfferSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const slug =
    decodeURIComponent(
      (await params).slug
    )

  try {
    const offer =
      await getOfferBySlug(slug)

    if (!offer) {
      return (
        <div className="p-8 text-center">
          العرض غير موجود
        </div>
      )
    }

    return (
      <SharedOfferPageClient
        id={offer.id}
      />
    )
  } catch {
    return (
      <div className="p-8 text-center">
        حصل خطأ — جرّب تاني
      </div>
    )
  }
}
