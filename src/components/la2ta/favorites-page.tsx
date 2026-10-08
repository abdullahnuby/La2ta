'use client'

import { Heart, LogIn, Sparkles } from 'lucide-react'
import EmptyState from '@/components/la2ta/empty-state'
import { OfferCard } from '@/components/la2ta/offer-card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/la2ta/auth-provider'
import { useFavorites } from '@/components/la2ta/favorites-provider'

const grid = 'grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'

export default function FavoritesPage() {
  const { user, loading: authLoading } = useAuth()
  const { favoriteOffers, loading } = useFavorites()

  if (authLoading) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="h-24 w-full rounded-[1.75rem]" />
        <div className={`${grid} mt-6`}>
          {Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="aspect-[4/5] rounded-2xl" />)}
        </div>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="mx-auto flex min-h-[65vh] w-full max-w-3xl items-center px-4 py-10 sm:px-6">
        <section className="w-full overflow-hidden rounded-[2rem] border bg-card shadow-xl shadow-primary/5">
          <div className="bg-[linear-gradient(135deg,#fff7ed_0%,#ffedd5_55%,#ffffff_100%)] px-6 py-10 text-center sm:px-10">
            <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <Heart className="size-8 fill-current" />
            </div>
            <p className="mt-5 text-xs font-black text-primary">المفضلة</p>
            <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">احفظ العروض اللي عجبتك</h1>
            <p className="mx-auto mt-3 max-w-lg text-sm font-semibold leading-7 text-slate-600">
              اعمل حساب مجاني، واضغط على القلب فوق أي عرض علشان تلاقيه هنا بسهولة.
            </p>
            <Button asChild className="mt-6 h-11 rounded-xl px-5 font-black shadow-lg shadow-primary/20">
              <a href="/account"><LogIn className="size-4" />سجل دخولك أو اعمل حساب</a>
            </Button>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-3 py-6 sm:px-6 lg:px-8 lg:py-8">
      <section className="rounded-[1.75rem] border border-primary/10 bg-[linear-gradient(135deg,#fff7ed_0%,#ffedd5_60%,#ffffff_100%)] px-5 py-6 shadow-sm sm:px-7">
        <div className="flex items-center gap-3">
          <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/15">
            <Heart className="size-6 fill-current" />
          </div>
          <div>
            <p className="text-xs font-black text-primary">محفوظاتك</p>
            <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">العروض المفضلة</h1>
            <p className="mt-1 text-xs font-semibold text-slate-600 sm:text-sm">العروض اللي اخترتها علشان ترجع لها بسهولة.</p>
          </div>
        </div>
      </section>

      {loading ? (
        <div className={`${grid} mt-6`}>
          {Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="aspect-[4/5] rounded-2xl" />)}
        </div>
      ) : favoriteOffers.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon="♡"
            title="لسه مفيش عروض محفوظة"
            subtitle="لما يعجبك عرض، اضغط على القلب واحفظه هنا."
            actionLabel="شوف العروض"
            onAction={() => { window.location.href = '/#/offers' }}
          />
        </div>
      ) : (
        <section className="mt-7 space-y-4">
          <div className="flex items-center gap-2 text-sm font-black text-foreground">
            <Sparkles className="size-4 text-primary" />
            عندك {favoriteOffers.length} عروض محفوظة
          </div>
          <div className={grid}>
            {favoriteOffers.map((offer) => <OfferCard key={offer.id} offer={offer} />)}
          </div>
        </section>
      )}
    </main>
  )
}
