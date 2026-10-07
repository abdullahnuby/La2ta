'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import {
  ArrowRight,
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

  useEffect(() => {
    if (data?.offer) track(id, 'view')
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
  const map = mapsLink(store?.latitude, store?.longitude, store?.address)
  const tel = store ? telLink(store.phone) : null
  const wa = store ? waLink(store.whatsapp || store.phone) : null
  const saved =
    offer.oldPrice != null && offer.newPrice != null && offer.oldPrice > offer.newPrice
      ? offer.oldPrice - offer.newPrice
      : null

  const share = async () => {
    track(id, 'share')
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title: offer.title, url })
        return
      } catch {
        /* user cancelled */
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      toast.success('تم نسخ رابط العرض 🔗')
    } catch {
      toast.error('مش قادرين ننسخ الرابط')
    }
  }

  return (
    <div>
      {/* ---------------- Hero image with floating actions ---------------- */}
      <div className="relative aspect-[4/3] w-full bg-muted">
        {offer.imageUrl ? (
          <Image
            src={offer.imageUrl}
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

        {/* scrim so the floating buttons always read */}
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

        <span className="absolute bottom-3 start-3 rounded-full bg-primary px-3 py-1.5 text-sm font-black text-primary-foreground shadow-lg">
          {offerBadge(offer)}
        </span>
      </div>

      {/* ---------------- Content pulled over the image ---------------- */}
      <div className="relative -mt-6 rounded-t-3xl bg-background px-4 pt-5">
        <div className="space-y-5">
          {/* Title + category */}
          <div className="space-y-2">
            {offer.category && (
              <Badge
                variant="secondary"
                className="gap-1 rounded-full px-3 py-1 text-xs font-bold"
              >
                {offer.category.icon} {offer.category.name}
              </Badge>
            )}
            <h1 className="text-xl font-black leading-snug text-foreground">
              {offer.title}
            </h1>
          </div>

          {/* Price block */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-2xl bg-accent p-4">
            {offer.newPrice != null && (
              <span className="text-3xl font-black tracking-tight text-primary">
                {formatPrice(offer.newPrice)}
              </span>
            )}
            {offer.oldPrice != null && (
              <span className="text-lg font-bold text-muted-foreground line-through">
                {formatPrice(offer.oldPrice)}
              </span>
            )}
            {saved != null && (
              <Badge className="rounded-full bg-primary px-2.5 py-1 text-xs font-black text-primary-foreground hover:bg-primary">
                وفّرت {formatPrice(saved)}
              </Badge>
            )}
          </div>

          {/* Countdown strip */}
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-primary/25 bg-primary/5 p-3.5 text-sm font-bold text-foreground">
            <Hourglass className="size-4.5 shrink-0 text-primary" aria-hidden />
            العرض متاح حتى {formatDate(offer.endAt)}
            <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-black text-primary-foreground">
              {remainingText(offer.endAt)}
            </span>
          </div>

          {offer.description && (
            <p className="whitespace-pre-line text-[15px] font-medium leading-relaxed text-muted-foreground">
              {offer.description}
            </p>
          )}

          {/* Store reveal — PRD §7 (curiosity funnel pays off here) */}
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
            categorySlug={offer.category?.slug}
            excludeId={id}
            onOpenOffer={onOpenOffer}
          />
        </div>
      </div>

      {/* ---------------- Sticky bottom action bar ---------------- */}
      {store && (
        <div className="sticky bottom-0 z-40 mt-6 border-t bg-background/95 px-3 pt-2.5 pb-safe shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.25)] backdrop-blur-md">
          <div className="flex items-center gap-2">
            {map && (
              <a
                href={map}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track(id, 'map')}
                className="flex h-12 flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary text-sm font-black text-primary-foreground shadow-md shadow-primary/25 transition-transform active:scale-95"
              >
                <MapPin className="size-4.5" />
                الموقع
              </a>
            )}
            {tel && (
              <a
                href={tel}
                onClick={() => track(id, 'call')}
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
                onClick={() => track(id, 'whatsapp')}
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
    categorySlug ? { cat: categorySlug } : {},
    !!categorySlug
  )
  const related = (data?.offers ?? [])
    .filter((o) => o.id !== excludeId)
    .slice(0, 6)

  if (!categorySlug || related.length === 0) return null

  return (
    <section aria-label="عروض مشابهة" className="space-y-3 pb-2">
      <h2 className="text-base font-black text-foreground">
        لقطات تانية في نفس القسم 👀
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {related.map((offer) => (
          <OfferCard key={offer.id} offer={offer} onOpen={onOpenOffer} />
        ))}
      </div>
    </section>
  )
}
