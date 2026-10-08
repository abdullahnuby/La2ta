'use client'

import { Home, Percent, UserRound } from 'lucide-react'

export default function SiteBottomNav({
  active = 'home',
}: {
  active?: 'home' | 'account' | 'offers'
}) {
  const itemClass = (isActive: boolean) =>
    [
      'flex min-w-0 flex-1 flex-col items-center justify-center gap-1 text-[10px] font-black transition-colors',
      isActive
        ? 'text-primary'
        : 'text-muted-foreground hover:text-foreground',
    ].join(' ')

  return (
    <nav
      aria-label="التنقل السريع"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto flex max-w-md items-end rounded-2xl border border-border/80 bg-card/95 px-3 py-2 shadow-[0_16px_45px_-20px_rgba(0,0,0,0.45)] backdrop-blur-xl md:hidden"
    >
      <a
        href="/#/"
        className={itemClass(active === 'home')}
        aria-label="الرئيسية"
      >
        <Home className="size-5" strokeWidth={active === 'home' ? 2.5 : 2} />
        <span>الرئيسية</span>
      </a>

      <a
        href="/#/offers"
        className="relative -mt-7 flex min-w-0 flex-1 flex-col items-center justify-center gap-1 text-[10px] font-black text-primary"
        aria-current={active === 'offers' ? 'page' : undefined}
        aria-label="كل العروض"
      >
        <span
          className={`grid size-14 place-items-center rounded-full border-4 border-background bg-primary text-primary-foreground shadow-xl shadow-primary/25 transition-transform ${active === 'offers' ? 'scale-105' : ''}`}
        >
          <Percent className="size-7" strokeWidth={2.5} />
        </span>
        <span>اللقطات</span>
      </a>

      <a
        href="/account"
        className={itemClass(active === 'account')}
        aria-label="حسابي"
      >
        <UserRound
          className="size-5"
          strokeWidth={active === 'account' ? 2.5 : 2}
        />
        <span>حسابي</span>
      </a>
    </nav>
  )
}
