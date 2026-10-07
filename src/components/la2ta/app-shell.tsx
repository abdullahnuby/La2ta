'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useHashRoute } from '@/hooks/use-hash-route'
import SiteHeader from '@/components/la2ta/site-header'
import SiteFooter from '@/components/la2ta/site-footer'
import HomeView from '@/components/la2ta/home-view'
import OfferDetailsView from '@/components/la2ta/offer-details-view'
import AdminPanel from '@/components/la2ta/admin/admin-panel'

const pageMotion = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.25, ease: 'easeOut' as const },
}

/**
 * Desktop-only ambient branding around the app column.
 * On phones the app is full-bleed — this layer never renders (lg+).
 */
function DesktopAmbient() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 hidden lg:block">
      {/* warm deal-y gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-orange-100/80 via-amber-50/50 to-orange-100/80 dark:from-stone-900 dark:via-stone-950 dark:to-stone-900" />
      {/* soft glow blobs */}
      <div className="absolute -top-24 start-1/4 size-[420px] rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-0 end-1/5 size-[380px] rounded-full bg-amber-400/10 blur-3xl" />

      {/* brand slogans on the sides (xl+ where there is real room) */}
      <div className="absolute start-10 top-1/2 hidden -translate-y-1/2 text-center xl:block">
        <span className="block text-6xl leading-none">🔥</span>
        <p className="mt-4 text-3xl font-black leading-relaxed text-orange-950/20 dark:text-orange-100/10">
          خليني أشوف
          <br />
          لقطة
          <br />
          قبل ما أشتري
        </p>
      </div>
      <div className="absolute end-10 top-1/2 hidden -translate-y-1/2 text-center xl:block">
        <p className="text-2xl font-black text-orange-950/20 dark:text-orange-100/10">لقطة</p>
        <p className="mt-2 text-lg font-bold leading-relaxed text-orange-950/15 dark:text-orange-100/5">
          عروض حقيقية
          <br />
          محدودة المدة
          <br />
          الأقصر · LA2TA
        </p>
        <span className="mt-4 block text-4xl leading-none">👀</span>
      </div>
    </div>
  )
}

export default function AppShell() {
  const [route, navigate] = useHashRoute()

  // Admin = back-office, full width on its own (it has its own containers/header)
  if (route.name === 'admin') {
    return <AdminPanel />
  }

  return (
    <div className="relative min-h-dvh">
      <DesktopAmbient />

      {/* Mobile-first app column: full-bleed on phones, phone-like on desktop */}
      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-[480px] flex-col bg-background shadow-2xl shadow-orange-950/10 lg:border-x lg:border-stone-200/80 dark:lg:border-stone-800/60">
        <SiteHeader />

        <main className="flex-1">
          <AnimatePresence mode="wait">
            {route.name === 'home' && (
              <motion.div key="home" {...pageMotion}>
                <HomeView onOpenOffer={(id) => navigate({ name: 'offer', id })} />
              </motion.div>
            )}

            {route.name === 'offer' && (
              <motion.div key={`offer-${route.id}`} {...pageMotion}>
                <OfferDetailsView
                  id={route.id}
                  onBack={() => navigate({ name: 'home' })}
                  onOpenOffer={(id) => navigate({ name: 'offer', id })}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <SiteFooter />
      </div>
    </div>
  )
}
