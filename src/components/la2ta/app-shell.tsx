'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useHashRoute } from '@/hooks/use-hash-route'
import SiteHeader from '@/components/la2ta/site-header'
import SiteFooter from '@/components/la2ta/site-footer'
import SiteBottomNav from '@/components/la2ta/site-bottom-nav'
import HomeView from '@/components/la2ta/home-view'
import OfferDetailsView from '@/components/la2ta/offer-details-view'
import AdminPanel from '@/components/la2ta/admin/admin-panel'

const pageMotion = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.25, ease: 'easeOut' as const },
}

export default function AppShell() {
  const [route, navigate] = useHashRoute()

  if (route.name === 'admin') {
    return <AdminPanel />
  }

  return (
    <div className="min-h-dvh bg-background">
      <div className="flex min-h-dvh w-full flex-col bg-background">
        <SiteHeader />

        <main className="flex-1 pb-24 md:pb-0">
          <AnimatePresence mode="wait">
            {(route.name === 'home' || route.name === 'offers') && (
              <motion.div
                key={route.name}
                {...pageMotion}
              >
                <HomeView
                  mode={route.name}
                  onOpenOffer={(id) =>
                    navigate({ name: 'offer', id })
                  }
                />
              </motion.div>
            )}

            {route.name === 'offer' && (
              <motion.div
                key={`offer-${route.id}`}
                {...pageMotion}
              >
                <OfferDetailsView
                  id={route.id}
                  onBack={() => navigate({ name: 'home' })}
                  onOpenOffer={(id) =>
                    navigate({ name: 'offer', id })
                  }
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <SiteFooter />
        <SiteBottomNav
          active={route.name === 'offers' || route.name === 'offer' ? 'offers' : 'home'}
        />
      </div>
    </div>
  )
}
