import type { Metadata } from 'next'
import SiteHeader from '@/components/la2ta/site-header'
import SiteFooter from '@/components/la2ta/site-footer'
import SiteBottomNav from '@/components/la2ta/site-bottom-nav'
import NotificationsPage from '@/components/la2ta/notifications-page'

export const metadata: Metadata = {
  title: 'تنبيهات العروض | لقطة',
  description: 'تابع تنبيهات العروض المحفوظة في لقطة.',
}

export default function NotificationsRoute() {
  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader />
      <main className="pb-24 md:pb-0">
        <NotificationsPage />
      </main>
      <SiteFooter />
      <SiteBottomNav active="account" />
    </div>
  )
}
