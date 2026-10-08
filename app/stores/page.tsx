import type { Metadata } from 'next'
import SiteHeader from '@/components/la2ta/site-header'
import SiteFooter from '@/components/la2ta/site-footer'
import SiteBottomNav from '@/components/la2ta/site-bottom-nav'
import StoresDirectory from '@/components/la2ta/stores-directory'

export const metadata: Metadata = {
  title: 'المحلات | لقطة',
  description: 'دليل المحلات اللي بتنزل عروضها وخصوماتها على لقطة في الأقصر.',
}

export default function StoresRoute() {
  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader />
      <StoresDirectory />
      <SiteFooter />
      <SiteBottomNav active="offers" />
    </div>
  )
}
