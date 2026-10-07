'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Flame, Loader2, Sparkles, XCircle } from 'lucide-react'
import SearchBar from '@/components/la2ta/search-bar'
import CategoryChips from '@/components/la2ta/category-chips'
import { OfferCard } from '@/components/la2ta/offer-card'
import EmptyState from '@/components/la2ta/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  useCategories,
  useInfiniteOffers,
  useOffers,
} from '@/hooks/use-la2ta-api'

/** Mobile-first: 2 compact columns — like real deals apps */
const grid = 'grid grid-cols-2 gap-3'

export default function HomeView({
  onOpenOffer,
}: {
  onOpenOffer: (id: number) => void
}) {
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')
  const [category, setCategory] = useState<string | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 350)
    return () => clearTimeout(t)
  }, [query])

  const isFiltering = debounced.length > 0 || category !== null

  const { data: categoriesData, isLoading: categoriesLoading } =
    useCategories()

  const {
    data: feedData,
    isLoading: feedLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteOffers({}, !isFiltering)

  const { data: filteredData, isFetching: filtering } = useOffers(
    {
      q: debounced || undefined,
      cat: category ?? undefined,
    },
    isFiltering
  )

  const allOffers = useMemo(
    () => feedData?.pages.flatMap((page) => page.offers) ?? [],
    [feedData]
  )

  const featured = useMemo(
    () => allOffers.filter((o) => o.isFeatured),
    [allOffers]
  )

  // The homepage feed contains ALL current offers, including featured ones.
  const latest = allOffers
  const results = filteredData?.offers ?? []

  useEffect(() => {
    const sentinel = loadMoreRef.current
    if (!sentinel || isFiltering || !hasNextPage) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries.some((entry) => entry.isIntersecting) &&
          !isFetchingNextPage
        ) {
          void fetchNextPage()
        }
      },
      {
        rootMargin: '700px 0px',
      }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [
    isFiltering,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  ])

  const clearFilters = () => {
    setQuery('')
    setCategory(null)
  }

  return (
    <div className="space-y-6 px-4 py-4">
      {/* Search */}
      <section aria-label="البحث في العروض">
        <SearchBar value={query} onChange={setQuery} />
      </section>

      {/* Categories */}
      <section aria-label="تصنيفات العروض">
        <CategoryChips
          categories={categoriesData?.categories ?? []}
          active={category}
          onSelect={(slug) => setCategory(slug)}
          isLoading={categoriesLoading}
        />
      </section>

      {isFiltering ? (
        /* ---------------- Search / filter results ---------------- */
        <section aria-label="نتائج البحث" className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="flex items-center gap-1.5 text-base font-black text-foreground">
              {filtering && (
                <Loader2 className="size-4 animate-spin text-primary" />
              )}
              النتائج
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-black text-primary">
                {results.length}
              </span>
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-9 gap-1 rounded-xl px-2.5 text-xs font-bold text-muted-foreground hover:text-foreground"
            >
              <XCircle className="size-3.5" /> مسح الفلاتر
            </Button>
          </div>

          {filtering && results.length === 0 ? (
            <div className={grid}>
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="aspect-[4/5] rounded-2xl"
                />
              ))}
            </div>
          ) : results.length === 0 ? (
            <EmptyState
              icon="🔍"
              title="مفيش لقطات على بحثك"
              subtitle={`مفيش عروض حاليًا على «${debounced || category}» — جرّب كلمة تانية أو شوف كل العروض.`}
              actionLabel="شوف كل العروض"
              onAction={clearFilters}
            />
          ) : (
            <div className={grid}>
              {results.map((offer) => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  onOpen={onOpenOffer}
                />
              ))}
            </div>
          )}
        </section>
      ) : (
        <>
          {/* ---------------- Featured: لقطة اليوم ---------------- */}
          {feedLoading ? (
            <section aria-label="لقطة اليوم" className="space-y-3">
              <Skeleton className="h-7 w-40" />
              <div className="flex gap-3 overflow-hidden">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className="aspect-[4/3] w-[78%] shrink-0 rounded-2xl"
                  />
                ))}
              </div>
            </section>
          ) : featured.length > 0 ? (
            <section aria-label="لقطة اليوم" className="space-y-3">
              <h2 className="flex items-center gap-1.5 text-base font-black text-foreground">
                <Flame
                  className="size-5 text-primary"
                  strokeWidth={2.5}
                />
                لقطة اليوم
              </h2>
              <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 scrollbar-hide">
                {featured.map((offer, i) => (
                  <OfferCard
                    key={offer.id}
                    offer={offer}
                    onOpen={onOpenOffer}
                    featured
                    priority={i === 0}
                    className="w-[78%] shrink-0 snap-start"
                  />
                ))}
              </div>
            </section>
          ) : null}

          {/* ---------------- Latest offers ---------------- */}
          <section aria-label="أحدث العروض" className="space-y-3">
            <h2 className="flex items-center gap-1.5 text-base font-black text-foreground">
              <Sparkles className="size-4.5 text-primary" />
              أحدث العروض
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-black text-primary">
                {latest.length}
              </span>
            </h2>

            {feedLoading ? (
              <div className={grid}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className="aspect-[4/5] rounded-2xl"
                  />
                ))}
              </div>
            ) : latest.length === 0 ? (
              <EmptyState
                icon="🔥"
                title="لسه مفيش لقطات"
                subtitle="العروض جاية قريب — احنا بنجمع لك أقوى عروض الأقصر في مكان واحد."
              />
            ) : (
              <>
                <div className={grid}>
                  {latest.map((offer) => (
                    <OfferCard
                      key={offer.id}
                      offer={offer}
                      onOpen={onOpenOffer}
                    />
                  ))}
                </div>

                {/* Infinite-scroll sentinel */}
                <div
                  ref={loadMoreRef}
                  aria-hidden="true"
                  className="flex min-h-14 items-center justify-center pt-2"
                >
                  {isFetchingNextPage && (
                    <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                      <Loader2 className="size-4 animate-spin text-primary" />
                      بنجيب لقطات جديدة...
                    </div>
                  )}
                </div>

                {!hasNextPage && latest.length > 0 && (
                  <p className="pt-1 text-center text-xs font-semibold text-muted-foreground">
                    خلصت كل اللقطات المتاحة 🔥
                  </p>
                )}
              </>
            )}
          </section>
        </>
      )}
    </div>
  )
}
