'use client'

import { useMemo, useState } from 'react'
import { MapPin, Search, Store as StoreIcon, X } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api-client'
import EmptyState from '@/components/la2ta/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import type { StoreInfo } from '@/lib/types'
import { storePath } from '@/lib/store-slug'

interface DirectoryStore extends StoreInfo {
  offersCount: number
}

export default function StoresDirectory() {
  const [query, setQuery] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['stores-directory'],
    queryFn: () => api<{ stores: DirectoryStore[] }>('/api/stores'),
    staleTime: 60_000,
  })

  const stores = data?.stores ?? []
  const normalizedQuery = query.trim().toLocaleLowerCase('ar-EG')
  const filtered = useMemo(
    () =>
      normalizedQuery
        ? stores.filter((store) =>
            `${store.name} ${store.description} ${store.address}`
              .toLocaleLowerCase('ar-EG')
              .includes(normalizedQuery)
          )
        : stores,
    [normalizedQuery, stores]
  )

  return (
    <main className="mx-auto w-full max-w-7xl px-3 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-9">
      <section className="overflow-hidden rounded-[2rem] border border-primary/10 bg-[linear-gradient(135deg,#fff7ed_0%,#ffedd5_58%,#ffffff_100%)] px-5 py-6 shadow-sm sm:px-8 sm:py-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black text-primary">دليل المحلات</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl lg:text-4xl">
              المحلات على لقطة 🏪
            </h1>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-7 text-slate-700 sm:text-base">
              اكتشف المحلات اللي بتنزل عروضها على لقطة، وافتح صفحة أي محل علشان تشوف كل عروضه الحالية.
            </p>
          </div>

          <div className="shrink-0 rounded-2xl border border-white/80 bg-white/75 px-4 py-3 shadow-sm backdrop-blur">
            <div className="text-2xl font-black text-primary">{stores.length}</div>
            <div className="text-[11px] font-bold text-slate-600">محل متاح</div>
          </div>
        </div>

        <div className="relative mt-5 max-w-3xl">
          <Search className="pointer-events-none absolute start-3.5 top-1/2 size-4.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ابحث باسم المحل أو المنطقة..."
            aria-label="البحث في المحلات"
            className="h-12 w-full rounded-xl border border-white/90 bg-white/90 ps-11 pe-11 text-sm font-semibold text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="مسح البحث"
              className="absolute end-3 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-primary/10 hover:text-primary"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </section>

      {isLoading ? (
        <section className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-52 rounded-[1.5rem]" />
          ))}
        </section>
      ) : filtered.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon="🏪"
            title="مفيش محلات مطابقة"
            subtitle="جرّب اسم محل مختلف أو امسح البحث وشوف كل المحلات."
            actionLabel="شوف كل المحلات"
            onAction={() => setQuery('')}
          />
        </div>
      ) : (
        <section className="mt-7">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black text-primary">اختار محل</p>
              <h2 className="mt-0.5 text-lg font-black text-foreground sm:text-xl">
                {normalizedQuery ? 'نتائج البحث' : 'كل المحلات'}
              </h2>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1.5 text-[11px] font-black text-primary">
              {filtered.length} نتيجة
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((store) => (
              <a
                key={store.id}
                href={`/store/${storePath(store.id, store.name)}`}
                className="group rounded-[1.5rem] border border-border/80 bg-card p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <div className="flex items-start gap-3">
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/15 transition-transform duration-300 group-hover:scale-105">
                    <StoreIcon className="size-6" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-black text-foreground transition-colors group-hover:text-primary">
                      {store.name}
                    </h3>
                    <span className="mt-1 inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-black text-primary">
                      {store.offersCount} {store.offersCount === 1 ? 'عرض متاح' : 'عروض متاحة'}
                    </span>
                  </div>
                </div>

                {store.description && (
                  <p className="mt-4 line-clamp-2 text-xs font-semibold leading-6 text-muted-foreground">
                    {store.description}
                  </p>
                )}

                {store.address && (
                  <p className="mt-3 flex items-start gap-1.5 text-[11px] font-bold leading-5 text-muted-foreground">
                    <MapPin className="mt-0.5 size-3.5 shrink-0 text-primary" />
                    <span className="line-clamp-2">{store.address}</span>
                  </p>
                )}

                <div className="mt-4 text-xs font-black text-primary">
                  شوف عروض المحل ←
                </div>
              </a>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
