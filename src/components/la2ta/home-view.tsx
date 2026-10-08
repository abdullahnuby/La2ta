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

const grid =
  'grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'

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
    const t = setTimeout(
      () => setDebounced(query.trim()),
      350
    )
    return () => clearTimeout(t)
  }, [query])

  const isFiltering =
    debounced.length > 0 ||
    category !== null

  const {
    data: categoriesData,
    isLoading: categoriesLoading,
  } = useCategories()

  const {
    data: feedData,
    isLoading: feedLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteOffers({}, !isFiltering)

  const {
    data: filteredData,
    isFetching: filtering,
  } = useOffers(
    {
      q: debounced || undefined,
      cat: category ?? undefined,
    },
    isFiltering
  )

  const allOffers = useMemo(
    () =>
      feedData?.pages.flatMap(
        (page) => page.offers
      ) ?? [],
    [feedData]
  )

  const featured = useMemo(
    () =>
      allOffers.filter(
        (offer) => offer.isFeatured
      ),
    [allOffers]
  )

  const results =
    filteredData?.offers ?? []

  const selectedCategoryName = useMemo(() => {
    if (!category) return null

    const selected = (
      categoriesData?.categories ?? []
    ).find((item) => item.slug === category)

    return selected
      ? `${selected.icon ? `${selected.icon} ` : ''}${selected.name}`
      : category
  }, [category, categoriesData])

  useEffect(() => {
    const sentinel = loadMoreRef.current

    if (
      !sentinel ||
      isFiltering ||
      !hasNextPage
    ) {
      return
    }

    const observer =
      new IntersectionObserver(
        (entries) => {
          if (
            entries.some(
              (entry) =>
                entry.isIntersecting
            ) &&
            !isFetchingNextPage
          ) {
            void fetchNextPage()
          }
        },
        { rootMargin: '700px 0px' }
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

  const emptyFilterLabel =
    debounced ||
    selectedCategoryName ||
    'الاختيار الحالي'

  return (
    <div className="mx-auto w-full max-w-7xl space-y-7 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
      <section
        aria-label="البحث في العروض"
        className="mx-auto w-full max-w-4xl"
      >
        <SearchBar
          value={query}
          onChange={setQuery}
        />
      </section>

      <section
        aria-label="تصنيفات العروض"
        className="w-full"
      >
        <CategoryChips
          categories={
            categoriesData?.categories ?? []
          }
          active={category}
          onSelect={(slug) =>
            setCategory(slug)
          }
          isLoading={
            categoriesLoading
          }
        />
      </section>

      {isFiltering ? (
        <section
          aria-label="نتائج البحث"
          className="space-y-4"
        >
          <div className="flex items-center justify-between gap-2">
            <h2 className="flex items-center gap-1.5 text-lg font-black text-foreground">
              {filtering && (
                <Loader2 className="size-4 animate-spin text-primary" />
              )}
              النتائج
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-black text-primary">
                {results.length}
              </span>
            </h2>

            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-9 gap-1 rounded-xl px-2.5 text-xs font-bold text-muted-foreground hover:text-foreground"
            >
              <XCircle className="size-3.5" />
              مسح الفلاتر
            </Button>
          </div>

          {filtering && results.length === 0 ? (
            <div className={grid}>
              {Array.from({ length: 10 }).map(
                (_, i) => (
                  <Skeleton
                    key={i}
                    className="aspect-[4/5] rounded-2xl"
                  />
                )
              )}
            </div>
          ) : results.length === 0 ? (
            <EmptyState
              icon="🔍"
              title="مفيش لقطات على اختيارك"
              subtitle={`مفيش عروض حاليًا على «${emptyFilterLabel}» — جرّب كلمة تانية أو شوف كل العروض.`}
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
          {feedLoading ? (
            <section
              aria-label="لقطة اليوم"
              className="space-y-4"
            >
              <Skeleton className="h-8 w-44" />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map(
                  (_, i) => (
                    <Skeleton
                      key={i}
                      className="aspect-[4/3] rounded-2xl"
                    />
                  )
                )}
              </div>
            </section>
          ) : featured.length > 0 ? (
            <section
              aria-label="لقطة اليوم"
              className="space-y-4"
            >
              <h2 className="flex items-center gap-1.5 text-lg font-black text-foreground">
                <Flame
                  className="size-5 text-primary"
                  strokeWidth={2.5}
                />
                لقطة اليوم
              </h2>

              <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-0 pb-1 scrollbar-hide lg:grid lg:grid-cols-3 lg:gap-4 lg:overflow-visible">
                {featured.map(
                  (offer, index) => (
                    <OfferCard
                      key={offer.id}
                      offer={offer}
                      onOpen={onOpenOffer}
                      featured
                      priority={index === 0}
                      className="w-[82%] shrink-0 snap-start lg:w-auto"
                    />
                  )
                )}
              </div>
            </section>
          ) : null}

          <section
            aria-label="أحدث العروض"
            className="space-y-4"
          >
            <div className="flex items-center gap-1.5">
              <h2 className="flex items-center gap-1.5 text-lg font-black text-foreground">
                <Sparkles className="size-4.5 text-primary" />
                أحدث العروض
              </h2>

              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-black text-primary">
                {allOffers.length}
              </span>
            </div>

            {feedLoading ? (
              <div className={grid}>
                {Array.from({ length: 10 }).map(
                  (_, i) => (
                    <Skeleton
                      key={i}
                      className="aspect-[4/5] rounded-2xl"
                    />
                  )
                )}
              </div>
            ) : allOffers.length === 0 ? (
              <EmptyState
                icon="🔥"
                title="لسه مفيش لقطات"
                subtitle="العروض جاية قريب — احنا بنجمع لك أقوى عروض الأقصر في مكان واحد."
              />
            ) : (
              <>
                <div className={grid}>
                  {allOffers.map((offer) => (
                    <OfferCard
                      key={offer.id}
                      offer={offer}
                      onOpen={onOpenOffer}
                    />
                  ))}
                </div>

                <div
                  ref={loadMoreRef}
                  aria-hidden="true"
                  className="flex min-h-16 items-center justify-center pt-3"
                >
                  {isFetchingNextPage && (
                    <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                      <Loader2 className="size-4 animate-spin text-primary" />
                      بنجيب لقطات جديدة...
                    </div>
                  )}
                </div>

                {!hasNextPage &&
                  allOffers.length > 0 && (
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
