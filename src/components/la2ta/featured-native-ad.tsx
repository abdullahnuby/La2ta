'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { ArrowLeft, BadgePercent, Clock3, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import type { PublicOffer } from '@/lib/types'
import { daysLeft, formatPrice, remainingText } from '@/lib/format'

function getDiscount(offer: PublicOffer) {
  if (offer.discountPercentage != null) return Math.round(offer.discountPercentage)
  if (offer.oldPrice != null && offer.newPrice != null && offer.oldPrice > offer.newPrice) {
    return Math.round(((offer.oldPrice - offer.newPrice) / offer.oldPrice) * 100)
  }
  return null
}

export default function FeaturedNativeAd({
  offers,
}: {
  offers: PublicOffer[]
}) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (offers.length < 2 || paused) return
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % offers.length)
    }, 6500)
    return () => window.clearInterval(timer)
  }, [offers.length, paused])

  const offer = offers.length > 0 ? offers[activeIndex % offers.length] : null
  const discount = useMemo(() => (offer ? getDiscount(offer) : null), [offer])
  const urgent = offer ? daysLeft(offer.endAt) <= 1 : false

  if (!offer) return null

  return (
    <motion.article
      initial={{ opacity: 0, y: 16, scale: 0.985 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      className="group relative col-span-2 min-h-[255px] overflow-hidden rounded-[1.65rem] border border-white/15 bg-slate-950 shadow-[0_24px_70px_-30px_rgba(15,23,42,0.65)] md:col-span-3 lg:col-span-4 xl:col-span-5"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <a
        href={`/offer/${encodeURIComponent(offer.slug || `offer-${offer.id}`)}`}
        className="relative block min-h-[255px] overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-label={`شوف العرض المميز: ${offer.title}`}
      >
        {offer.imageUrl ? (
          <Image
            src={offer.imageUrl}
            alt=""
            fill
            sizes="(min-width: 1280px) 1100px, 100vw"
            priority={activeIndex === 0}
            className="object-cover transition-transform duration-[1800ms] ease-out group-hover:scale-[1.035]"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,rgba(251,146,60,0.65),transparent_36%),linear-gradient(135deg,#431407_0%,#0f172a_70%)]" />
        )}

        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.18)_0%,rgba(2,6,23,0.24)_28%,rgba(2,6,23,0.72)_58%,rgba(2,6,23,0.96)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_15%,rgba(249,115,22,0.28),transparent_34%)]" />

        <div className="absolute inset-0 flex items-center">
          <div className="flex w-full items-center justify-between gap-5 px-5 py-6 sm:px-8 sm:py-8 lg:px-10">
            <div className="hidden max-w-[38%] shrink-0 md:block">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[1.4rem] border border-white/15 bg-white/10 shadow-2xl backdrop-blur-sm">
                {offer.imageUrl && (
                  <Image
                    src={offer.imageUrl}
                    alt=""
                    fill
                    sizes="360px"
                    className="object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
              </div>
            </div>

            <div className="ms-auto max-w-xl text-right text-white">
              <div className="flex flex-wrap items-center justify-end gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-black backdrop-blur-md">
                  <Sparkles className="size-3" />
                  اختيار لقطة
                </span>
                {offer.category?.name && (
                  <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-[10px] font-bold text-white/80 backdrop-blur-md">
                    {offer.category.icon ? `${offer.category.icon} ` : ''}{offer.category.name}
                  </span>
                )}
              </div>

              <h3 className="mt-3 line-clamp-2 text-2xl font-black leading-tight tracking-tight sm:text-3xl lg:text-4xl">
                {offer.title}
              </h3>

              <div className="mt-3 flex flex-wrap items-center justify-end gap-x-3 gap-y-2">
                {offer.newPrice != null && (
                  <span className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                    {formatPrice(offer.newPrice, 'short')}
                  </span>
                )}
                {offer.oldPrice != null && (
                  <span className="text-sm font-bold text-white/55 line-through">
                    {formatPrice(offer.oldPrice, 'short')}
                  </span>
                )}
                {discount != null && discount > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-2xl bg-primary px-3 py-2 text-sm font-black text-primary-foreground shadow-[0_12px_30px_-12px_rgba(249,115,22,0.9)]">
                    <BadgePercent className="size-4" />
                    خصم {discount}٪
                  </span>
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-end gap-3 text-[11px] font-bold text-white/75">
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="size-3.5" />
                  {remainingText(offer.endAt)}
                </span>
                {urgent && (
                  <span className="rounded-full bg-red-500/90 px-2.5 py-1 font-black text-white">
                    آخر فرصة
                  </span>
                )}
              </div>

              <div className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-black text-slate-950 shadow-lg transition-transform duration-300 group-hover:-translate-x-1">
                شوف العرض
                <ArrowLeft className="size-4" />
              </div>
            </div>
          </div>
        </div>

        {offers.length > 1 && (
          <div className="absolute bottom-4 start-5 flex items-center gap-1.5 sm:start-8 lg:start-10" aria-hidden>
            {offers.slice(0, Math.min(5, offers.length)).map((item, index) => (
              <span
                key={item.id}
                className={`h-1.5 rounded-full transition-all duration-300 ${index === activeIndex % Math.min(5, offers.length) ? 'w-7 bg-white' : 'w-2 bg-white/35'}`}
              />
            ))}
          </div>
        )}
      </a>
    </motion.article>
  )
}
