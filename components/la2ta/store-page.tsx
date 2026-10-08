'use client'

import { useState } from 'react'
import {
  ArrowRight,
  MapPin,
  MessageCircle,
  Phone,
  Share2,
  Sparkles,
  Store as StoreIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import EmptyState from '@/components/la2ta/empty-state'
import { OfferCard } from '@/components/la2ta/offer-card'
import SiteBottomNav from '@/components/la2ta/site-bottom-nav'
import SiteFooter from '@/components/la2ta/site-footer'
import SiteHeader from '@/components/la2ta/site-header'
import type { PublicOffer, StoreInfo } from '@/lib/types'
import { mapsLink, telLink, waLink } from '@/lib/format'
import { storePath } from '@/lib/store-slug'

export type StorePageProps = {
  store: StoreInfo
  offers: PublicOffer[]
}

export default function StorePage({ store, offers }: StorePageProps) {
  const [sharing, setSharing] = useState(false)

  const map = mapsLink(store.latitude, store.longitude, store.address)
  const tel = telLink(store.phone)
  const wa = waLink(store.whatsapp || store.phone)
  const canonicalPath = `/store/${storePath(store.id, store.name)}`

  const shareStore = async () => {
    if (sharing) return
    setSharing(true)

    const url = `${window.location.origin}${canonicalPath}`
    const text = [
      `🏪 ${store.name}`,
      offers.length > 0 ? `🔥 عنده ${offers.length} عروض متاحة على لقطة` : '',
      store.address ? `📍 ${store.address}` : '',
      'شوف العروض والمعلومات على لقطة:',
    ]
      .filter(Boolean)
      .join('\n')

    try {
      if (navigator.share) {
        await navigator.share({ title: `${store.name} | لقطة`, text, url })
      } else {
        await navigator.clipboard.writeText(`${text}\n${url}`)
        toast.success('تم نسخ رابط المحل 🔗')
      }
    } catch {
      // User cancelled native sharing.
    } finally {
      setSharing(false)
    }
  }

  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader />

      <main className="pb-24 md:pb-0">
        <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          <div className="mb-4 flex items-center justify-between gap-3 sm:mb-6">
            <a
              href="/#/offers"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-3.5 text-sm font-black text-foreground shadow-sm transition hover:border-primary/30 hover:bg-accent active:scale-[0.98]"
            >
              <ArrowRight className="size-4" />
              رجوع للعروض
            </a>

            <button
              type="button"
              onClick={shareStore}
              disabled={sharing}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-3.5 text-sm font-black text-primary-foreground shadow-md shadow-primary/20 transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-70"
            >
              <Share2 className="size-4" />
              مشاركة المحل
            </button>
          </div>

          <section className="overflow-hidden rounded-[2rem] border border-primary/10 bg-card shadow-xl shadow-primary/5">
            <div className="relative overflow-hidden bg-[linear-gradient(135deg,#fff7ed_0%,#ffedd5_58%,#ffffff_100%)] px-5 py-7 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
              <div aria-hidden className="absolute -end-14 -top-14 size-44 rounded-full bg-primary/10 blur-3xl" />
              <div aria-hidden className="absolute -start-10 bottom-0 size-28 rounded-full bg-white/65 blur-2xl" />

              <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
                <div className="flex items-start gap-4">
                  <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 sm:size-20 sm:rounded-[1.5rem]">
                    <StoreIcon className="size-8 sm:size-10" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-primary">المحل</p>
                    <h1 className="mt-1 text-2xl font-black leading-tight tracking-tight text-slate-950 sm:text-3xl lg:text-4xl">
                      {store.name}
                    </h1>
                    {store.description && (
                      <p className="mt-2 max-w-2xl text-sm font-semibold leading-7 text-slate-700 sm:text-base">
                        {store.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-white/75 px-3 py-1.5 text-xs font-black text-primary shadow-sm">
                    <Sparkles className="size-3.5" />
                    {offers.length} {offers.length === 1 ? 'عرض متاح' : 'عروض متاحة'}
                  </span>
                </div>
              </div>

              {(store.address || store.phone || store.whatsapp) && (
                <div className="relative mt-6 flex flex-wrap gap-2">
                  {store.address && (
                    <span className="inline-flex items-start gap-1.5 rounded-xl border border-white/80 bg-white/70 px-3 py-2 text-xs font-bold text-slate-700 shadow-sm backdrop-blur">
                      <MapPin className="mt-0.5 size-3.5 shrink-0 text-primary" />
                      {store.address}
                    </span>
                  )}
                  {store.phone && (
                    <a
                      href={tel ?? undefined}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-white/80 bg-white/70 px-3 py-2 text-xs font-bold text-slate-700 shadow-sm backdrop-blur transition hover:border-primary/30 hover:text-primary"
                    >
                      <Phone className="size-3.5 text-primary" />
                      اتصال
                    </a>
                  )}
                  {wa && (
                    <a
                      href={wa}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-white/80 bg-white/70 px-3 py-2 text-xs font-bold text-slate-700 shadow-sm backdrop-blur transition hover:border-primary/30 hover:text-primary"
                    >
                      <MessageCircle className="size-3.5 text-[#22c55e]" />
                      واتساب
                    </a>
                  )}
                </div>
              )}
            </div>

            <div className="border-t bg-background/60 px-4 py-5 sm:px-7 sm:py-7">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-black text-primary">متجدد باستمرار</p>
                  <h2 className="mt-0.5 text-xl font-black tracking-tight text-foreground sm:text-2xl">
                    عروض {store.name}
                  </h2>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1.5 text-[11px] font-black text-primary">
                  {offers.length} {offers.length === 1 ? 'عرض' : 'عروض'}
                </span>
              </div>

              {offers.length === 0 ? (
                <div className="py-7">
                  <EmptyState
                    icon="🏪"
                    title="مفيش عروض متاحة حاليًا"
                    subtitle="المحل موجود على لقطة، وأول ما ينزل عرض جديد هتلاقيه هنا."
                    actionLabel="شوف كل العروض"
                    onAction={() => { window.location.href = '/#/offers' }}
                  />
                </div>
              ) : (
                <div className="mt-5 grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {offers.map((offer) => (
                    <OfferCard key={offer.id} offer={offer} />
                  ))}
                </div>
              )}

              {map && (
                <div className="mt-6 flex justify-end">
                  <a
                    href={map}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-11 items-center gap-2 rounded-xl border border-primary/20 bg-card px-4 text-sm font-black text-foreground shadow-sm transition hover:border-primary/40 hover:bg-accent"
                  >
                    <MapPin className="size-4 text-primary" />
                    افتح موقع المحل
                  </a>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
      <SiteBottomNav active="offers" />
    </div>
  )
}
