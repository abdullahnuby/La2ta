'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Loader2, Sparkles, XCircle } from 'lucide-react'
import SearchBar from '@/components/la2ta/search-bar'
import CategoryChips from '@/components/la2ta/category-chips'
import DealsHero from '@/components/la2ta/deals-hero'
import FeaturedOfferAd from '@/components/la2ta/featured-offer-ad'
import { OfferCard } from '@/components/la2ta/offer-card'
import EmptyState from '@/components/la2ta/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { useCategories, useInfiniteOffers, useOffers } from '@/hooks/use-la2ta-api'

const grid =
  'grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'

export default function HomeView({
  onOpenOffer,
  mode = 'home',
}: {
  onOpenOffer: (id: number) => void
  mode?: 'home' | 'offers'
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

  const { data: categoriesData, isLoading: categoriesLoading } = useCategories()
  const {
    data: feedData,
    isLoading: feedLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteOffers({}, !isFiltering)
  const { data: filteredData, isFetching: filtering } = useOffers(
    { q: debounced || undefined, cat: category ?? undefined },
    isFiltering
  )

  const allOffers = useMemo(
    () => feedData?.pages.flatMap((page) => page.offers) ?? [],
    [feedData]
  )
  const featured = useMemo(
    () => allOffers.filter((offer) => offer.isFeatured),
    [allOffers]
  )
  const results = filteredData?.offers ?? []

  const selectedCategoryName = useMemo(() => {
    if (!category) return null
    const selected = (categoriesData?.categories ?? []).find(
      (item) => item.slug === category
    )
    return selected
      ? `${selected.icon ? `${selected.icon} ` : ''}${selected.name}`
      : category
  }, [category, categoriesData])

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
      { rootMargin: '700px 0px' }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [isFiltering, hasNextPage, isFetchingNextPage, fetchNextPage])

  const clearFilters = () => {
    setQuery('')
    setCategory(null)
  }

  const scrollToOffers = () => {
    document.getElementById('latest-offers')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  const emptyFilterLabel =
    debounced || selectedCategoryName || 'الاختيار الحالي'

  return (
    <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-7">
      {mode === 'home' ? (
        <DealsHero onBrowse={scrollToOffers} />
      ) : (
        <section className="rounded-[1.75rem] border border-primary/10 bg-[linear-gradient(135deg,#fff7ed_0%,#ffedd5_65%,#ffffff_100%)] px-5 py-5 shadow-sm sm:px-7 sm:py-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-black text-primary">أهلاً بيك في قسم العروض</p>
              <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                كل العروض 🔥
              </h1>
              <p className="mt-1 text-xs font-semibold text-slate-600 sm:text-sm">
                أحدث العروض والخصومات في الأقصر، متجددة باستمرار.
              </p>
            </div>
            <span className="rounded-full bg-white/80 px-3 py-1.5 text-[11px] font-black text-primary shadow-sm">
              شوف العرض في ثانية
            </span>
          </div>
        </section>
      )}

      <section aria-label="البحث في العروض" className="mx-auto mt-5 w-full max-w-4xl sm:mt-6">
        <SearchBar value={query} onChange={setQuery} />
      </section>

      <section id="categories" aria-label="تصنيفات العروض" className="mt-5 w-full sm:mt-6">
        <div className="mb-2.5 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-black text-primary">اختار اللي يهمك</p>
            <h2 className="mt-0.5 text-base font-black text-foreground sm:text-lg">
              اتفرج حسب القسم
            </h2>
          </div>
        </div>
        <CategoryChips
          categories={categoriesData?.categories ?? []}
          active={category}
          onSelect={(slug) => setCategory(slug)}
          isLoading={categoriesLoading}
        />
      </section>

      {isFiltering ? (
        <section aria-label="نتائج البحث" className="mt-7 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="flex items-center gap-1.5 text-lg font-black text-foreground">
              {filtering && <Loader2 className="size-4 animate-spin text-primary" />}
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
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[4/5] rounded-2xl" />
              ))}
            </div>
          ) : results.length === 0 ? (
            <EmptyState
              icon="🔍"
              title="مفيش عروض على اختيارك"
              subtitle={`مفيش عروض حاليًا على «${emptyFilterLabel}» — جرّب كلمة تانية أو شوف كل العروض.`}
              actionLabel="شوف كل العروض"
              onAction={clearFilters}
            />
          ) : (
            <div className={grid}>
              {results.map((offer) => (
                <OfferCard key={offer.id} offer={offer} onOpen={onOpenOffer} />
              ))}
            </div>
          )}
        </section>
      ) : (
        <>
          {mode === 'home' && featured.length > 0 && (
            <FeaturedOfferAd offers={featured} />
          )}

          <section
            id="latest-offers"
            aria-label="أحدث العروض"
            className="mt-9 scroll-mt-24 space-y-4"
          >
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-black text-primary">متجدد باستمرار</p>
                <h2 className="flex items-center gap-1.5 text-lg font-black text-foreground sm:text-xl">
                  <Sparkles className="size-4.5 text-primary" />
                  أحدث العروض
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-black text-primary">
                    {allOffers.length}
                  </span>
                </h2>
              </div>
              <span className="hidden rounded-full bg-muted px-3 py-1 text-[11px] font-black text-muted-foreground sm:inline-flex">
                عروض جديدة كل فترة 🔥
              </span>
            </div>

            {feedLoading ? (
              <div className={grid}>
                {Array.from({ length: 10 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-[4/5] rounded-2xl" />
                ))}
              </div>
            ) : allOffers.length === 0 ? (
              <EmptyState
                icon="🔥"
                title="لسه مفيش عروض"
                subtitle="العروض جاية قريب — احنا بنجمع لك أقوى عروض الأقصر في مكان واحد."
              />
            ) : (
              <>
                <div className={grid}>
                  {allOffers.map((offer) => (
                    <OfferCard key={offer.id} offer={offer} onOpen={onOpenOffer} />
                  ))}
                </div>
                <div ref={loadMoreRef} aria-hidden="true" className="flex min-h-16 items-center justify-center pt-3">
                  {isFetchingNextPage && (
                    <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                      <Loader2 className="size-4 animate-spin text-primary" />
                      بنجيب عروض جديدة...
                    </div>
                  )}
                </div>
                {!hasNextPage && allOffers.length > 0 && (
                  <p className="pt-1 text-center text-xs font-semibold text-muted-foreground">
                    خلصت كل العروض المتاحة 🔥
                  </p>
                )}
              </>
            )}
          </section>
        </>
      )}

      <section className="mt-10 overflow-hidden rounded-2xl border border-primary/10 bg-[linear-gradient(135deg,#fff7ed_0%,#ffedd5_70%,#fff_100%)] px-5 py-5 shadow-sm sm:flex sm:items-center sm:justify-between sm:gap-5 sm:px-7">
        <div>
          <p className="text-sm font-black text-slate-950">
            خلّي العروض توصلك بدل ما تدور عليها 👀
          </p>
          <p className="mt-1 text-xs font-semibold text-slate-600">
            الحساب اختياري، وهنبني عليه المفضلة والتنبيهات بعد كده.
          </p>
        </div>
        <a
          href="/account"
          className="mt-4 inline-flex h-10 shrink-0 items-center justify-center rounded-xl bg-primary px-4 text-xs font-black text-primary-foreground shadow-md shadow-primary/20 sm:mt-0"
        >
          اعمل حسابك
        </a>
      </section>
    </div>
  )
}
