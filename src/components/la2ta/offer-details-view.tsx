'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Hourglass,
  MapPin,
  MessageCircle,
  Phone,
  Share2,
  Store as StoreIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import EmptyState from '@/components/la2ta/empty-state'
import { OfferCard } from '@/components/la2ta/offer-card'
import { track } from '@/lib/api-client'
import {
  formatDate,
  formatPrice,
  mapsLink,
  offerBadge,
  remainingText,
  telLink,
  waLink,
} from '@/lib/format'
import { useOffer, useOffers } from '@/hooks/use-la2ta-api'

export default function OfferDetailsView({
  id,
  onBack,
  onOpenOffer,
}: {
  id: number
  onBack: () => void
  onOpenOffer: (id: number) => void
}) {
  const { data, isLoading, error } = useOffer(id)
  const [selectedImage, setSelectedImage] =
    useState(0)

  useEffect(() => {
    if (data?.offer) {
      track(id, 'view')
      setSelectedImage(0)
    }
  }, [id, data])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="aspect-[4/3] w-full rounded-b-3xl" />
        <div className="space-y-3 px-4">
          <Skeleton className="h-7 w-2/3" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      </div>
    )
  }

  if (error || !data?.offer) {
    return (
      <div className="px-4 py-10">
        <EmptyState
          icon="⌛"
          title="العرض مش متاح"
          subtitle="العرض ده انتهى أو اتوقف — بس فيه لقطات تانية مستنياك!"
          actionLabel="رجوع للعروض"
          onAction={onBack}
        />
      </div>
    )
  }

  const offer = data.offer
  const store = offer.store

  const images =
    offer.imageUrls?.length > 0
      ? offer.imageUrls
      : offer.imageUrl
        ? [offer.imageUrl]
        : []

  const activeImageIndex =
    Math.min(
      selectedImage,
      Math.max(images.length - 1, 0)
    )

  const map = mapsLink(
    store?.latitude,
    store?.longitude,
    store?.address
  )

  const tel = store
    ? telLink(store.phone)
    : null

  const wa = store
    ? waLink(
        store.whatsapp ||
          store.phone
      )
    : null

  const saved =
    offer.oldPrice != null &&
    offer.newPrice != null &&
    offer.oldPrice >
      offer.newPrice
      ? offer.oldPrice -
        offer.newPrice
      : null

  const share = async () => {
    const slug =
      offer.slug?.trim() ||
      `offer-${offer.id}`

    const url =
      typeof window !== 'undefined'
        ? `${window.location.origin}/offer/${encodeURIComponent(slug)}`
        : `/offer/${encodeURIComponent(slug)}`

    track(id, 'share')

    const text = [
      `🔥 ${offer.title}`,
      offer.newPrice != null
        ? `💰 ${formatPrice(offer.newPrice)}`
        : '',
      store?.name
        ? `📍 ${store.name}`
        : '',
      'شوف العرض على لقطة:',
    ]
      .filter(Boolean)
      .join('\n')

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${offer.title} | لقطة`,
          text,
          url,
        })
        return
      } catch {
        // User cancelled native share.
      }
    }

    try {
      await navigator.clipboard.writeText(
        `${text}\n${url}`
      )
      toast.success(
        'تم نسخ رابط العرض 🔗'
      )
    } catch {
      toast.error(
        'مش قادرين ننسخ الرابط'
      )
    }
  }

  const showPrevious = () => {
    if (images.length <= 1) return

    setSelectedImage(
      activeImageIndex === 0
        ? images.length - 1
        : activeImageIndex - 1
    )
  }

  const showNext = () => {
    if (images.length <= 1) return

    setSelectedImage(
      activeImageIndex ===
        images.length - 1
        ? 0
        : activeImageIndex + 1
    )
  }

  return (
    <div>
      <div className="relative aspect-[4/3] w-full bg-muted">
        {images.length > 0 ? (
          <Image
            src={
              images[
                activeImageIndex
              ]
            }
            alt={offer.title}
            fill
            sizes="(max-width: 480px) 100vw, 480px"
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-primary/25 to-accent text-7xl">
            🔥
          </div>
        )}

        <div
          className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/50 to-transparent"
          aria-hidden
        />

        <button
          type="button"
          onClick={onBack}
          aria-label="رجوع للعروض"
          className="absolute top-3 start-3 grid size-11 place-items-center rounded-full bg-black/45 text-white shadow-lg backdrop-blur-sm transition-transform active:scale-90"
        >
          <ArrowRight className="size-5" />
        </button>

        <button
          type="button"
          onClick={share}
          aria-label="شارك العرض"
          className="absolute top-3 end-3 grid size-11 place-items-center rounded-full bg-black/45 text-white shadow-lg backdrop-blur-sm transition-transform active:scale-90"
        >
          <Share2 className="size-5" />
        </button>

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={showPrevious}
              aria-label="الصورة السابقة"
              className="absolute top-1/2 start-3 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white shadow-lg backdrop-blur-sm transition-transform active:scale-90"
            >
              <ChevronRight className="size-5" />
            </button>

            <button
              type="button"
              onClick={showNext}
              aria-label="الصورة التالية"
              className="absolute top-1/2 end-3 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white shadow-lg backdrop-blur-sm transition-transform active:scale-90"
            >
              <ChevronLeft className="size-5" />
            </button>

            <span className="absolute bottom-3 end-3 rounded-full bg-black/65 px-2.5 py-1 text-xs font-black text-white backdrop-blur-sm">
              {activeImageIndex + 1} / {images.length}
            </span>
          </>
        )}

        <span className="absolute bottom-3 start-3 rounded-full bg-primary px-3 py-1.5 text-sm font-black text-primary-foreground shadow-lg">
          {offerBadge(offer)}
        </span>
      </div>

      {images.length > 1 && (
        <div className="overflow-x-auto px-3 pt-3 scrollbar-hide">
          <div className="flex gap-2">
            {images.map(
              (image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() =>
                    setSelectedImage(
                      index
                    )
                  }
                  className={`relative size-16 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                    activeImageIndex ===
                    index
                      ? 'border-primary shadow-md'
                      : 'border-transparent opacity-70'
                  }`}
                  aria-label={`عرض الصورة ${index + 1}`}
                >
                  <Image
                    src={image}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-cover"
                    unoptimized
                  />
                </button>
              )
            )}
          </div>
        </div>
      )}

      <div className="relative rounded-t-3xl bg-background px-4 pt-5">
        <div className="space-y-5">
          <div className="space-y-2">
            {offer.category && (
              <Badge
                variant="secondary"
                className="gap-1 rounded-full px-3 py-1 text-xs font-bold"
              >
                {offer.category.icon}{' '}
                {offer.category.name}
              </Badge>
            )}

            <h1 className="text-xl font-black leading-snug text-foreground">
              {offer.title}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-2xl bg-accent p-4">
            {offer.newPrice != null && (
              <span className="text-3xl font-black tracking-tight text-primary">
                {formatPrice(
                  offer.newPrice
                )}
              </span>
            )}

            {offer.oldPrice != null && (
              <span className="text-lg font-bold text-muted-foreground line-through">
                {formatPrice(
                  offer.oldPrice
                )}
              </span>
            )}

            {saved != null && (
              <Badge className="rounded-full bg-primary px-2.5 py-1 text-xs font-black text-primary-foreground hover:bg-primary">
                وفّرت{' '}
                {formatPrice(saved)}
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-primary/25 bg-primary/5 p-3.5 text-sm font-bold text-foreground">
            <Hourglass
              className="size-4.5 shrink-0 text-primary"
              aria-hidden
            />
            العرض متاح حتى{' '}
            {formatDate(
              offer.endAt
            )}
            <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-black text-primary-foreground">
              {remainingText(
                offer.endAt
              )}
            </span>
          </div>

          {offer.description && (
            <p className="whitespace-pre-line text-[15px] font-medium leading-relaxed text-muted-foreground">
              {offer.description}
            </p>
          )}

          {store && (
            <section
              aria-label="بيانات المحل"
              className="space-y-3.5 rounded-2xl border-2 border-dashed border-primary/30 bg-secondary/50 p-4"
            >
              <div className="flex items-center gap-2.5">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
                  <StoreIcon className="size-5" />
                </span>

                <div className="leading-tight">
                  <p className="text-base font-black text-foreground">
                    {store.name}
                  </p>
                  <p className="text-[11px] font-bold text-muted-foreground">
                    العرض متاح عند المحل
                  </p>
                </div>
              </div>

              {store.description && (
                <p className="text-sm font-medium leading-relaxed text-muted-foreground">
                  {store.description}
                </p>
              )}

              {store.address && (
                <p className="flex items-start gap-2 text-sm font-semibold text-foreground">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                  {store.address}
                </p>
              )}
            </section>
          )}

          <p className="text-center text-[11px] font-medium leading-relaxed text-muted-foreground">
            العرض ساري لحد تاريخ الانتهاء أو لحين نفاد الكمية عند المحل 🤝
          </p>

          <RelatedOffers
            categorySlug={
              offer.category?.slug
            }
            excludeId={id}
            onOpenOffer={
              onOpenOffer
            }
          />
        </div>
      </div>

      {store && (
        <div className="sticky bottom-0 z-40 mt-6 border-t bg-background/95 px-3 pt-2.5 pb-safe shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.25)] backdrop-blur-md">
          <div className="flex items-center gap-2">
            {map && (
              <a
                href={map}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  track(id, 'map')
                }
                className="flex h-12 flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary text-sm font-black text-primary-foreground shadow-md shadow-primary/25 transition-transform active:scale-95"
              >
                <MapPin className="size-4.5" />
                الموقع
              </a>
            )}

            {tel && (
              <a
                href={tel}
                onClick={() =>
                  track(id, 'call')
                }
                className="flex h-12 flex-1 items-center justify-center gap-1.5 rounded-xl border border-input bg-card text-sm font-black text-foreground transition-transform active:scale-95"
              >
                <Phone className="size-4.5" />
                اتصل
              </a>
            )}

            {wa && (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  track(id, 'whatsapp')
                }
                className="flex h-12 flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#22c55e] text-sm font-black text-white shadow-md shadow-green-600/25 transition-transform active:scale-95"
              >
                <MessageCircle className="size-4.5" />
                واتساب
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function RelatedOffers({
  categorySlug,
  excludeId,
  onOpenOffer,
}: {
  categorySlug?: string
  excludeId: number
  onOpenOffer: (id: number) => void
}) {
  const { data } = useOffers(
    categorySlug
      ? { cat: categorySlug }
      : {},
    !!categorySlug
  )

  const related = (data?.offers ?? [])
    .filter(
      (o) => o.id !== excludeId
    )
    .slice(0, 6)

  if (
    !categorySlug ||
    related.length === 0
  ) {
    return null
  }

  return (
    <section
      aria-label="عروض مشابهة"
      className="space-y-3 pb-2"
    >
      <h2 className="text-base font-black text-foreground">
        لقطات تانية في نفس القسم 👀
      </h2>

      <div className="grid grid-cols-2 gap-3">
        {related.map((offer) => (
          <OfferCard
            key={offer.id}
            offer={offer}
            onOpen={onOpenOffer}
          />
        ))}
      </div>
    </section>
  )
}
