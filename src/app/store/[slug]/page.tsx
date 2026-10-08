import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import StorePage, { type StorePageProps } from '@/components/la2ta/store-page'
import { dbRequest } from '@/lib/db'
import { parseStorePath } from '@/lib/store-slug'
import type { OfferType, PublicOffer } from '@/lib/types'

export const dynamic = 'force-dynamic'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://la2ta-silk.vercel.app'

type RawStore = {
  id: number
  name: string
  description: string
  phone: string
  whatsapp: string
  address: string
  latitude: number | null
  longitude: number | null
  is_active: boolean
}

function imageUrlsForOffer(offer: any): string[] {
  const gallery = Array.isArray(offer.image_urls)
    ? offer.image_urls
        .filter((url: unknown): url is string => typeof url === 'string')
        .map((url) => url.trim())
        .filter(Boolean)
        .slice(0, 5)
    : []

  if (gallery.length > 0) return gallery

  const legacy = typeof offer.image_url === 'string' ? offer.image_url.trim() : ''
  return legacy ? [legacy] : []
}

function mapOffer(offer: any): PublicOffer {
  const imageUrls = imageUrlsForOffer(offer)
  return {
    id: offer.id,
    slug: typeof offer.slug === 'string' && offer.slug.trim() ? offer.slug.trim() : `offer-${offer.id}`,
    title: offer.title,
    description: offer.description,
    imageUrl: imageUrls[0] ?? '',
    imageUrls,
    oldPrice: offer.old_price,
    newPrice: offer.new_price,
    discountPercentage: offer.discount_percentage,
    offerType: offer.offer_type as OfferType,
    isFeatured: offer.is_featured,
    startAt: offer.start_at,
    endAt: offer.end_at,
    category: offer.category ?? null,
  }
}

async function getStoreData(id: number) {
  const now = new Date().toISOString()

  const [stores, offers] = await Promise.all([
    dbRequest<RawStore[]>('stores', {
      query: {
        select: 'id,name,description,phone,whatsapp,address,latitude,longitude,is_active',
        id: `eq.${id}`,
        limit: 1,
      },
    }),
    dbRequest<any[]>('offers', {
      query: {
        select: 'id,slug,title,description,image_url,image_urls,old_price,new_price,discount_percentage,offer_type,is_featured,start_at,end_at,created_at,category:categories(id,name,slug,icon)',
        store_id: `eq.${id}`,
        status: 'eq.ACTIVE',
        start_at: `lte.${now}`,
        end_at: `gt.${now}`,
        order: 'is_featured.desc,created_at.desc',
        limit: 100,
      },
    }),
  ])

  const store = stores?.[0]
  if (!store || !store.is_active) return null

  const pageData: StorePageProps = {
    store: {
      id: store.id,
      name: store.name,
      description: store.description,
      phone: store.phone,
      whatsapp: store.whatsapp,
      address: store.address,
      latitude: store.latitude,
      longitude: store.longitude,
    },
    offers: (offers ?? []).map(mapOffer),
  }

  return pageData
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const slug = decodeURIComponent((await params).slug)
  const id = parseStorePath(slug)
  if (!id) return { title: 'المحل غير متاح | لقطة' }

  try {
    const data = await getStoreData(id)
    if (!data) return { title: 'المحل غير متاح | لقطة' }

    const description =
      data.store.description?.trim() ||
      `شوف عروض ${data.store.name} الحالية على لقطة — عروض حقيقية محدودة المدة في الأقصر.`

    const url = `${siteUrl}/store/${encodeURIComponent(slug)}`

    return {
      title: `${data.store.name} | عروض لقطة`,
      description,
      alternates: { canonical: url },
      openGraph: {
        title: `${data.store.name} | عروض لقطة`,
        description,
        type: 'website',
        locale: 'ar_EG',
        url,
        siteName: 'لقطة',
      },
    }
  } catch {
    return { title: 'لقطة | عروض الأقصر' }
  }
}

export default async function StoreRoute({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const slug = decodeURIComponent((await params).slug)
  const id = parseStorePath(slug)
  if (!id) notFound()

  try {
    const data = await getStoreData(id)
    if (!data) notFound()
    return <StorePage {...data} />
  } catch {
    notFound()
  }
}
