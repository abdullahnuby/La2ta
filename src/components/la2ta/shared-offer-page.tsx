'use client'

import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import SiteFooter from '@/components/la2ta/site-footer'
import SiteHeader from '@/components/la2ta/site-header'
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
      <div className="relative min-h-dvh">
        <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col bg-background shadow-2xl lg:border-x lg:border-stone-200/80 dark:lg:border-stone-800/60">
          <SiteHeader />

          <main className="flex-1">
            <OfferDetailsView
              id={id}
              onBack={() => {
                window.location.href = '/'
              }}
              onOpenOffer={(offerId) => {
                window.location.href = `/o/${offerId}`
              }}
            />
          </main>

          <SiteFooter />
        </div>
      </div>
    </QueryClientProvider>
  )
}
