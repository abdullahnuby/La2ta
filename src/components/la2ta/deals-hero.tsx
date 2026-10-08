'use client'

import { ArrowLeft, Flame, ShoppingBag, Sparkles, Tag } from 'lucide-react'

export default function DealsHero({
  onBrowse,
}: {
  onBrowse: () => void
}) {
  return (
    <section
      aria-label="لقطة — العروض والخصومات"
      className="relative isolate overflow-hidden rounded-[2rem] border border-primary/15 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.78),transparent_30%),linear-gradient(135deg,#fff8ef_0%,#ffedd8_48%,#fed7aa_100%)] px-5 py-6 shadow-[0_24px_70px_-34px_rgba(234,88,12,0.4)] sm:px-8 sm:py-8 lg:px-12 lg:py-10"
    >
      <div aria-hidden className="absolute -start-12 -top-12 size-32 rounded-full bg-primary/10 blur-sm" />
      <div aria-hidden className="absolute -end-16 bottom-0 size-48 rounded-full bg-white/50 blur-3xl" />
      <div aria-hidden className="absolute end-[24%] top-6 hidden size-3 rounded-full bg-primary/70 sm:block" />
      <div aria-hidden className="absolute end-[29%] top-14 hidden size-2 rounded-full bg-amber-400/80 sm:block" />

      <div className="relative flex min-h-[205px] items-center justify-between gap-5 sm:min-h-[230px] lg:min-h-[250px]">
        <div className="max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-white/80 px-3 py-1.5 text-[11px] font-black text-primary shadow-sm">
            <Flame className="size-3.5" />
            كل العروض في مكان واحد
          </div>

          <h1 className="text-3xl font-black leading-[1.16] tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
            لقطة
            <span className="mt-1 block text-primary">
              عروضك أقرب لك 🔥
            </span>
          </h1>

          <p className="mt-3 max-w-xl text-sm font-semibold leading-7 text-slate-700 sm:text-base">
            اكتشف أحسن الأسعار والخصومات من محلات الأقصر — قبل ما تنزل وتشتري.
          </p>

          <button
            type="button"
            onClick={onBrowse}
            className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-black text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:-translate-y-0.5 active:translate-y-0"
          >
            شوف أحدث العروض
            <ArrowLeft className="size-4" />
          </button>
        </div>

        <div aria-hidden className="relative hidden shrink-0 sm:block">
          <div className="grid size-36 rotate-3 place-items-center rounded-[2.1rem] border border-white/80 bg-primary text-primary-foreground shadow-[0_25px_45px_-20px_rgba(234,88,12,0.65)] lg:size-44">
            <ShoppingBag className="size-20 lg:size-24" strokeWidth={1.5} />
            <span className="absolute end-3 top-3 grid size-11 place-items-center rounded-full bg-white text-primary shadow-lg">
              <Tag className="size-5" />
            </span>
          </div>
          <Sparkles className="absolute -start-4 -top-5 size-8 text-primary" />
          <div className="absolute -bottom-5 -end-5 rounded-2xl border border-white/80 bg-white/90 px-3 py-2 text-center shadow-lg backdrop-blur">
            <div className="text-[10px] font-black text-muted-foreground">
              عروض وخصومات
            </div>
            <div className="text-xl font-black text-primary">
              🔥 خصومات
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
