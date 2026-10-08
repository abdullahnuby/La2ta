'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Hourglass, Flame } from 'lucide-react'
import { track } from '@/lib/api-client'
import {
  daysLeft,
  formatPrice,
  offerBadge,
  remainingText,
} from '@/lib/format'
import type { PublicOffer } from '@/lib/types'

function useImpression(offerId: number) {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const ob = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          track(offerId, 'impression', true)
          ob.disconnect()
        }
      },
      { threshold: 0.35 }
    )
    ob.observe(el)
    return () => ob.disconnect()
  }, [offerId])
  return ref
}

export function OfferCard({
  offer,
  onOpen,
  featured = false,
  compact = false,
  priority = false,
  className = '',
}: {
  offer: PublicOffer
  onOpen: (id: number) => void
  featured?: boolean
  compact?: boolean
  priority?: boolean
  className?: string
}) {
  const ref = useImpression(offer.id)
  const urgent = daysLeft(offer.endAt) <= 1

  const imageAspect = compact
    ? 'aspect-[16/10]'
    : featured
      ? 'aspect-[4/3]'
      : 'aspect-[4/5]'

  return (
    <motion.article
      ref={ref}
      whileTap={{ scale: compact ? 0.985 : 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 ${className}`}
    >
      <button
        type="button"
        onClick={() => onOpen(offer.id)}
        className="flex w-full flex-1 flex-col text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label={`شوف تفاصيل عرض: ${offer.title}`}
      >
        <div className={`relative w-full overflow-hidden bg-muted ${imageAspect}`}>
          {offer.imageUrl ? (
            <Image
              src={offer.imageUrl}
              alt={offer.title}
              fill
              sizes={compact ? '250px' : featured ? '80vw' : '50vw'}
              priority={priority}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-primary/15 to-accent text-5xl">
              🔥
            </div>
          )}

          <span className={`absolute start-2 top-2 rounded-full bg-primary text-primary-foreground shadow-md ${compact ? 'px-2 py-1 text-[10px]' : 'px-2.5 py-1 text-[11px]'} font-black`}>
            {offerBadge(offer)}
          </span>

          {offer.isFeatured && !compact && (
            <span className="absolute end-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
              <Flame className="size-3" /> مميز
            </span>
          )}

          {urgent && (
            <span className="absolute bottom-2 end-2 rounded-full bg-destructive px-2 py-0.5 text-[10px] font-black text-white shadow-md">
              آخر يوم 🔥
            </span>
          )}
        </div>

        <div className={`flex flex-1 flex-col ${compact ? 'gap-1 p-2.5' : 'gap-1 p-2.5'}`}>
          <h3
            className={`font-extrabold leading-snug text-foreground transition-colors group-hover:text-primary ${
              compact
                ? 'line-clamp-2 text-[13px]'
                : featured
                  ? 'line-clamp-1 text-lg'
                  : 'line-clamp-2 text-[13px]'
            }`}
          >
            {offer.title}
          </h3>

          <div className="mt-auto flex flex-wrap items-baseline gap-x-2 gap-y-0.5 pt-0.5">
            {offer.newPrice != null && (
              <span
                className={`font-black tracking-tight text-primary ${
                  compact ? 'text-base' : featured ? 'text-2xl' : 'text-lg'
                }`}
              >
                {formatPrice(offer.newPrice, 'short')}
              </span>
            )}
            {offer.oldPrice != null && (
              <span className="text-[10px] font-semibold text-muted-foreground line-through">
                {formatPrice(offer.oldPrice, 'short')}
              </span>
            )}
          </div>

          <p className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
            <Hourglass className="size-3 shrink-0" aria-hidden />
            {remainingText(offer.endAt)}
          </p>
        </div>
      </button>
    </motion.article>
  )
}
