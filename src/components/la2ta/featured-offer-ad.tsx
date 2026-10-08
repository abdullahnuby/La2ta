'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Flame, Hourglass, Sparkles } from 'lucide-react'
import { daysLeft, formatPrice, offerBadge, remainingText } from '@/lib/format'
import type { PublicOffer } from '@/lib/types'

const SLIDE_MS = 6500

export default function FeaturedOfferAd({
  offers,
}: {
  offers: PublicOffer[]
}) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  const slides = useMemo(() => offers.slice(0, 8), [offers])
  const activeOffer = slides[activeIndex] ?? slides[0]

  useEffect(() => {
    if (slides.length < 2 || paused) return

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length)
    }, SLIDE_MS)

    return () => window.clearInterval(timer)
  }, [paused, slides.length])

  if (!activeOffer) return null

  const discount =
    activeOffer.discountPercentage != null && activeOffer.discountPercentage > 0
      ? Math.round(activeOffer.discountPercentage)
      : activeOffer.oldPrice != null &&
          activeOffer.newPrice != null &&
          activeOffer.oldPrice > activeOffer.newPrice
        ? Math.round(
            ((activeOffer.oldPrice - activeOffer.newPrice) / activeOffer.oldPrice) * 100
          )
        : null

  const urgent = daysLeft(activeOffer.endAt) <= 1
  const slideKey = `${activeOffer.id}-${activeIndex}`

  return (
    <section
      aria-label="العروض المميزة"
      className="mt-8 space-y-3.5"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-black text-primary">إعلانك المفضل ممكن يكون هنا</p>
          <h2 className="mt-0.5 flex items-center gap-1.5 text-lg font-black text-foreground sm:text-xl">
            <Flame className="size-5 text-primary" strokeWidth={2.5} />
            العروض المميزة
          </h2>
        </div>
        <span className="hidden rounded-full border border-primary/10 bg-primary/5 px-3 py-1.5 text-[11px] font-black text-primary sm:inline-flex">
          مختارة للفت نظرك 🔥
        </span>
      </div>

      <div className="relative isolate overflow-hidden rounded-[2rem] border border-orange-300/30 bg-[#1f130d] shadow-[0_26px_70px_-34px_rgba(234,88,12,0.75)]">
        <div
          aria-hidden
          className="pointer-events-none absolute -start-16 -top-20 size-56 rounded-full bg-orange-400/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -end-16 -bottom-20 size-64 rounded-full bg-amber-300/15 blur-3xl"
        />
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={slideKey}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.32, ease: 'easeOut' }}
            className="relative grid min-h-[410px] lg:min-h-[340px] lg:grid-cols-[1.05fr_0.95fr]"
          >
            <div className="relative order-1 min-h-[215px] overflow-hidden lg:order-2 lg:min-h-[340px]">
              {activeOffer.imageUrl ? (
                <Image
                  src={activeOffer.imageUrl}
                  alt={activeOffer.title}
                  fill
                  priority={activeIndex === 0}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_center,#fb923c_0%,#7c2d12_60%,#1f130d_100%)] text-7xl">
                  🔥
                </div>
              )}

              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(31,19,13,0.08)_15%,rgba(31,19,13,0.3)_100%)] lg:bg-[linear-gradient(90deg,rgba(31,19,13,0.16),transparent_45%,rgba(31,19,13,0.05))]" />

              <div className="absolute start-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-black/40 px-3 py-1.5 text-[10px] font-black text-white shadow-lg backdrop-blur-md">
                <Sparkles className="size-3.5 text-amber-200" />
                عرض مميز
              </div>

              {discount != null && (
                <div className="absolute end-4 top-4 grid size-20 place-items-center rounded-full border-4 border-white/80 bg-primary text-center text-primary-foreground shadow-[0_18px_35px_-16px_rgba(0,0,0,0.75)] rotate-[-8deg]">
                  <div>
                    <div className="text-[10px] font-black leading-none">خصم</div>
                    <div className="mt-0.5 text-2xl font-black leading-none">{discount}%</div>
                  </div>
                </div>
              )}

              <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
                <span className="rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-black text-primary shadow-lg backdrop-blur">
                  {offerBadge(activeOffer)}
                </span>
                <span
                  className={`rounded-full px-3 py-1.5 text-[10px] font-black text-white shadow-lg backdrop-blur ${
                    urgent ? 'bg-red-600/85' : 'bg-black/55'
                  }`}
                >
                  {urgent ? 'الحق العرض 🔥' : remainingText(activeOffer.endAt)}
                </span>
              </div>
            </div>

            <div className="order-2 flex flex-col justify-between px-5 py-5 text-right text-white sm:px-7 sm:py-7 lg:order-1 lg:px-9 lg:py-8">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-200/15 bg-white/8 px-3 py-1.5 text-[10px] font-black text-orange-100">
                  <Flame className="size-3.5 text-orange-300" />
                  عرض يستاهل تتفرج عليه
                </div>

                <h3 className="max-w-xl text-2xl font-black leading-[1.22] tracking-tight sm:text-3xl lg:text-[2.2rem]">
                  {activeOffer.title}
                </h3>

                {activeOffer.description && (
                  <p className="mt-2.5 line-clamp-2 max-w-xl text-xs font-semibold leading-6 text-orange-50/75 sm:text-sm">
                    {activeOffer.description}
                  </p>
                )}
              </div>

              <div className="mt-6">
                <div className="flex flex-wrap items-end gap-x-3 gap-y-1.5">
                  {activeOffer.newPrice != null && (
                    <span className="text-3xl font-black tracking-tight text-orange-300 sm:text-4xl">
                      {formatPrice(activeOffer.newPrice, 'short')}
                    </span>
                  )}
                  {activeOffer.oldPrice != null && (
                    <span className="text-sm font-bold text-white/45 line-through sm:text-base">
                      {formatPrice(activeOffer.oldPrice, 'short')}
                    </span>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-bold text-white/65">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/7 px-2.5 py-1.5">
                    <Hourglass className="size-3.5" />
                    {remainingText(activeOffer.endAt)}
                  </span>
                  {activeOffer.category?.name && (
                    <span className="rounded-full bg-white/7 px-2.5 py-1.5">
                      {activeOffer.category.icon ? `${activeOffer.category.icon} ` : ''}
                      {activeOffer.category.name}
                    </span>
                  )}
                </div>

                <a
                  href={`/offer/${encodeURIComponent(activeOffer.slug || `offer-${activeOffer.id}`)}`}
                  className="mt-4 inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-xs font-black text-primary shadow-xl shadow-black/20 transition-all hover:-translate-y-0.5 hover:bg-orange-50 active:translate-y-0 sm:h-12 sm:px-6 sm:text-sm"
                >
                  شوف تفاصيل العرض
                  <ArrowLeft className="size-4" />
                </a>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {slides.length > 1 && (
          <div className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-between gap-4 px-4 pb-3 sm:px-6">
            <div className="flex gap-1.5" role="tablist" aria-label="اختيار العرض المميز">
              {slides.map((offer, index) => (
                <button
                  key={offer.id}
                  type="button"
                  role="tab"
                  aria-selected={index === activeIndex}
                  aria-label={`العرض المميز ${index + 1}`}
                  onClick={() => setActiveIndex(index)}
                  className={`h-1.5 rounded-full transition-all ${
                    index === activeIndex ? 'w-9 bg-white' : 'w-2.5 bg-white/35 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>

            <span className="hidden rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold text-white/60 sm:inline-flex">
              {paused ? 'متوقف' : 'يتحرك تلقائيًا'}
            </span>
          </div>
        )}
      </div>
    </section>
  )
}
