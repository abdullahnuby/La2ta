'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Clock3,
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
import { storePath } from '@/lib/store-slug'

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
  const [selectedImage, setSelectedImage] = useState(0)

  useEffect(() => {
    if (!data?.offer) return
    track(id, 'view')
    setSelectedImage(0)
  }, [id, data])

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <Skeleton className="h-10 w-32 rounded-xl" />
        <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
          <Skeleton className="aspect-[4/3] w-full rounded-[2rem]" />
          <div className="space-y-4">
            <Skeleton className="h-9 w-4/5 rounded-xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !data?.offer) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
        <EmptyState
          icon="⌛"
          title="العرض مش متاح"
          subtitle="العرض ده انتهى أو اتوقف — شوف باقي العروض المتاحة."
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

  const activeImageIndex = Math.min(
    selectedImage,
    Math.max(images.length - 1, 0)
  )

  const map = mapsLink(
    store?.latitude,
    store?.longitude,
    store?.address
  )
  const tel = store ? telLink(store.phone) : null
  const wa = store ? waLink(store.whatsapp || store.phone) : null

  const saved =
    offer.oldPrice != null &&
    offer.newPrice != null &&
    offer.oldPrice > offer.newPrice
      ? offer.oldPrice - offer.newPrice
      : null

  const publicUrl = () => {
    const slug = offer.slug?.trim() || `offer-${offer.id}`
    return `/offer/${encodeURIComponent(slug)}`
  }

  const share = async () => {
    const relativeUrl = publicUrl()
    const url =
      typeof window !== 'undefined'
        ? `${window.location.origin}${relativeUrl}`
        : relativeUrl

    track(id, 'share')

    const text = [
      `🔥 ${offer.title}`,
      offer.newPrice != null ? `💰 ${formatPrice(offer.newPrice)}` : '',
      store?.name ? `📍 ${store.name}` : '',
      'شوف العرض على لقطة:',
    ]
      .filter(Boolean)
      .join('\n')

    if (typeof navigator !== 'undefined' && navigator.share) {
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
      await navigator.clipboard.writeText(`${text}\n${url}`)
      toast.success('تم نسخ رابط العرض 🔗')
    } catch {
      toast.error('مش قادرين ننسخ الرابط')
    }
  }

  const openRelatedOffer = (relatedId: number) => {
    onOpenOffer(relatedId)
  }

  const showPrevious = () => {
    if (images.length <= 1) return
    setSelectedImage(
      activeImageIndex === 0 ? images.length - 1 : activeImageIndex - 1
    )
  }

  const showNext = () => {
    if (images.length <= 1) return
    setSelectedImage(
      activeImageIndex === images.length - 1 ? 0 : activeImageIndex + 1
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8 lg:py-8">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-3.5 text-sm font-black text-foreground shadow-sm transition hover:border-primary/30 hover:bg-accent active:scale-[0.98]"
        >
          <ArrowRight className="size-4" />
          رجوع للعروض
        </button>

        <button
          type="button"
          onClick={share}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-3.5 text-sm font-black text-primary-foreground shadow-md shadow-primary/20 transition hover:-translate-y-0.5 active:translate-y-0"
        >
          <Share2 className="size-4" />
          مشاركة العرض
        </button>
      </div>

      <div className="mt-5 grid items-start gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)] lg:gap-8">
        <section aria-label="صور العرض" className="min-w-0">
          <div className="relative overflow-hidden rounded-[2rem] border bg-card shadow-xl shadow-black/5">
            <div className="relative aspect-[4/3] w-full bg-muted sm:aspect-[16/10]">
              {images.length > 0 ? (
                <Image
                  src={images[activeImageIndex]}
                  alt={offer.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 68vw"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-primary/25 to-accent text-7xl">
                  🔥
                </div>
              )}

              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/40 to-transparent"
                aria-hidden
              />

              <span className="absolute bottom-4 start-4 rounded-full bg-primary px-3.5 py-1.5 text-sm font-black text-primary-foreground shadow-lg">
                {offerBadge(offer)}
              </span>

              {offer.isFeatured && (
                <span className="absolute bottom-4 end-4 rounded-full bg-white/92 px-3 py-1.5 text-xs font-black text-primary shadow-lg backdrop-blur">
                  ⭐ عرض مميز
                </span>
              )}

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={showPrevious}
                    aria-label="الصورة السابقة"
                    className="absolute top-1/2 start-4 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white shadow-lg backdrop-blur-sm transition active:scale-90"
                  >
                    <ChevronRight className="size-5" />
                  </button>
                  <button
                    type="button"
                    onClick={showNext}
                    aria-label="الصورة التالية"
                    className="absolute top-1/2 end-4 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white shadow-lg backdrop-blur-sm transition active:scale-90"
                  >
                    <ChevronLeft className="size-5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setSelectedImage(index)}
                  className={`relative size-20 shrink-0 overflow-hidden rounded-xl border-2 transition sm:size-24 ${
                    activeImageIndex === index
                      ? 'border-primary shadow-md'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                  aria-label={`عرض الصورة ${index + 1}`}
                >
                  <Image
                    src={image}
                    alt=""
                    fill
                    sizes="96px"
                    className="object-cover"
                    unoptimized
                  />
                </button>
              ))}
            </div>
          )}

          <div className="mt-4 hidden rounded-2xl border bg-card p-4 text-sm font-semibold text-muted-foreground lg:block">
            <div className="flex items-center gap-2 text-foreground">
              <Clock3 className="size-4 text-primary" />
              العرض ساري حتى {formatDate(offer.endAt)}
            </div>
            <p className="mt-2 leading-6">
              اتأكد من توافر العرض عند المحل قبل الزيارة، خصوصًا لو العرض محدود الكمية.
            </p>
          </div>
        </section>

        <section
          aria-label="تفاصيل العرض"
          className="min-w-0 rounded-[2rem] border bg-card p-4 shadow-xl shadow-black/5 sm:p-6 lg:sticky lg:top-24"
        >
          <div className="space-y-5">
            <div className="space-y-2.5">
              {offer.category && (
                <Badge
                  variant="secondary"
                  className="gap-1 rounded-full px-3 py-1 text-xs font-bold"
                >
                  {offer.category.icon} {offer.category.name}
                </Badge>
              )}

              <h1 className="text-2xl font-black leading-snug tracking-tight text-foreground sm:text-3xl">
                {offer.title}
              </h1>
            </div>

            <div className="rounded-2xl bg-accent p-4 sm:p-5">
              <div className="flex flex-wrap items-end gap-x-3 gap-y-1.5">
                {offer.newPrice != null && (
                  <span className="text-3xl font-black tracking-tight text-primary sm:text-4xl">
                    {formatPrice(offer.newPrice)}
                  </span>
                )}
                {offer.oldPrice != null && (
                  <span className="text-base font-bold text-muted-foreground line-through sm:text-lg">
                    {formatPrice(offer.oldPrice)}
                  </span>
                )}
                {saved != null && (
                  <Badge className="rounded-full bg-primary px-2.5 py-1 text-xs font-black text-primary-foreground hover:bg-primary">
                    وفّرت {formatPrice(saved)}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-2xl border border-primary/20 bg-primary/5 p-3.5 text-sm font-bold text-foreground">
              <Hourglass className="size-4.5 shrink-0 text-primary" aria-hidden />
              <span>
                العرض متاح {remainingText(offer.endAt)} — حتى {formatDate(offer.endAt)}
              </span>
            </div>

            {offer.description && (
              <p className="whitespace-pre-line text-[15px] font-medium leading-7 text-muted-foreground">
                {offer.description}
              </p>
            )}

            {store && (
              <section
                aria-label="بيانات المحل"
                className="space-y-3.5 rounded-2xl border border-primary/20 bg-secondary/45 p-4"
              >
                <a
                  href={`/store/${storePath(store.id, store.name)}`}
                  className="flex items-center gap-2.5 rounded-xl p-1.5 -m-1.5 transition-colors hover:bg-background/70"
                  aria-label={`شوف عروض ${store.name}`}
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
                    <StoreIcon className="size-5" />
                  </span>
                  <div className="leading-tight">
                    <p className="text-base font-black text-foreground">{store.name}</p>
                    <p className="mt-0.5 text-[11px] font-bold text-muted-foreground">
                      شوف كل عروض المحل
                    </p>
                  </div>
                </a>

                {store.description && (
                  <p className="text-sm font-medium leading-6 text-muted-foreground">
                    {store.description}
                  </p>
                )}

                {store.address && (
                  <p className="flex items-start gap-2 text-sm font-semibold leading-6 text-foreground">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                    {store.address}
                  </p>
                )}
              </section>
            )}

            {store && (
              <div className="hidden gap-2.5 lg:flex">
                {map && (
                  <a
                    href={map}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => track(id, 'map')}
                    className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-black text-primary-foreground shadow-md shadow-primary/20 transition hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <MapPin className="size-4.5" />
                    الموقع
                  </a>
                )}
                {tel && (
                  <a
                    href={tel}
                    onClick={() => track(id, 'call')}
                    className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-input bg-background text-sm font-black text-foreground transition hover:border-primary/30 hover:bg-accent active:scale-[0.99]"
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
                    onClick={() => track(id, 'whatsapp')}
                    className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#22c55e] text-sm font-black text-white shadow-md shadow-green-600/20 transition hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <MessageCircle className="size-4.5" />
                    واتساب
                  </a>
                )}
              </div>
            )}

            <p className="text-center text-[11px] font-medium leading-6 text-muted-foreground">
              العرض ساري لحد تاريخ الانتهاء أو لحين نفاد الكمية عند المحل 🤝
            </p>
          </div>
        </section>
      </div>

      {store && (
        <div className="sticky bottom-0 z-40 mt-6 border-t bg-background/95 px-1 pt-2.5 pb-safe shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.25)] backdrop-blur-md lg:hidden">
          <div className="flex items-center gap-2">
            {map && (
              <a
                href={map}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track(id, 'map')}
                className="flex h-12 flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary text-sm font-black text-primary-foreground shadow-md shadow-primary/25 active:scale-95"
              >
                <MapPin className="size-4.5" />
                الموقع
              </a>
            )}
            {tel && (
              <a
                href={tel}
                onClick={() => track(id, 'call')}
                className="flex h-12 flex-1 items-center justify-center gap-1.5 rounded-xl border border-input bg-card text-sm font-black text-foreground active:scale-95"
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
                onClick={() => track(id, 'whatsapp')}
                className="flex h-12 flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#22c55e] text-sm font-black text-white shadow-md shadow-green-600/25 active:scale-95"
              >
                <MessageCircle className="size-4.5" />
                واتساب
              </a>
            )}
          </div>
        </div>
      )}

      <RelatedOffers
        categorySlug={offer.category?.slug}
        excludeId={id}
        onOpenOffer={openRelatedOffer}
      />
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
  const { data } = useOffers(categorySlug ? { cat: categorySlug } : {}, !!categorySlug)
  const related = (data?.offers ?? []).filter((offer) => offer.id !== excludeId).slice(0, 6)

  if (!categorySlug || related.length === 0) return null

  return (
    <section aria-label="عروض مشابهة" className="mt-8 space-y-3.5 border-t pt-7">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-black text-primary">ممكن يعجبك كمان</p>
          <h2 className="mt-0.5 text-lg font-black text-foreground sm:text-xl">
            عروض مشابهة
          </h2>
        </div>
        <span className="text-xs font-bold text-muted-foreground">من نفس القسم</span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {related.map((offer) => (
          <OfferCard key={offer.id} offer={offer} onOpen={onOpenOffer} />
        ))}
      </div>
    </section>
  )
}
