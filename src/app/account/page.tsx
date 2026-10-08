import type { Metadata } from 'next'
import AccountPage from '@/components/la2ta/account-page'
import SiteBottomNav from '@/components/la2ta/site-bottom-nav'
import SiteFooter from '@/components/la2ta/site-footer'
import SiteHeader from '@/components/la2ta/site-header'

export const metadata: Metadata = {
  title: 'الحساب | لقطة',
  description: 'سجل دخولك أو اعمل حساب جديد في لقطة.',
}

export default function AccountRoute() {
  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader />
      <AccountPage />
      <SiteFooter />
      <SiteBottomNav active="account" />
    </div>
  )
}
