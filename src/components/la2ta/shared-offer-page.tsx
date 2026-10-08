'use client'

import { useState } from 'react'
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import SiteFooter from '@/components/la2ta/site-footer'
import SiteHeader from '@/components/la2ta/site-header'
import SiteBottomNav from '@/components/la2ta/site-bottom-nav'
import OfferDetailsView from '@/components/la2ta/offer-details-view'

export default function SharedOfferPageClient({
  id,
}: {
  id: number
}) {
  const [queryClient] = useState(
    () => new QueryClient()
  )

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-dvh bg-background">
        <SiteHeader />

        <main className="flex-1 pb-24 md:pb-0">
          <OfferDetailsView
            id={id}
            onBack={() => {
              window.location.href = '/'
            }}
            onOpenOffer={(offerId) => {
              window.location.href = `/offer/${offerId}`
            }}
          />
        </main>

        <SiteFooter />
        <SiteBottomNav active="offers" />
      </div>
    </QueryClientProvider>
  )
}
