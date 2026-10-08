'use client'

import { useTheme } from 'next-themes'
import { Moon, Sun, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import BrandLogo from '@/components/la2ta/brand-logo'
import { useAuth } from '@/components/la2ta/auth-provider'

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <Button
      variant="outline"
      size="icon"
      className="size-9 rounded-xl border-input bg-card shadow-sm"
      aria-label="تبديل الوضع الليلي"
      onClick={() =>
        setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
      }
    >
      <Sun className="hidden size-4 dark:block" />
      <Moon className="size-4 dark:hidden" />
    </Button>
  )
}

export default function SiteHeader() {
  const { user } = useAuth()

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 shadow-[0_8px_24px_-18px_rgba(0,0,0,0.3)] backdrop-blur-xl supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex h-[68px] w-full max-w-7xl items-center justify-between gap-4 px-3 sm:px-6 lg:px-8">
        <a
          href="/"
          className="flex min-w-0 items-center gap-2.5 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          aria-label="لقطة — الرئيسية"
        >
          <BrandLogo size="sm" priority />
          <span className="hidden min-w-0 leading-none sm:block">
            <span className="block truncate text-xl font-black tracking-tight text-foreground lg:text-2xl">
              لقطة
            </span>
            <span className="mt-1 block truncate text-[10px] font-bold text-muted-foreground lg:text-xs">
              عروضك أقرب لك
            </span>
          </span>
        </a>

        <nav
          aria-label="التنقل الرئيسي"
          className="hidden items-center gap-1 rounded-2xl border border-border/70 bg-card/70 p-1 shadow-sm md:flex"
        >
          <a
            href="/#/"
            className="rounded-xl px-4 py-2 text-sm font-black text-foreground transition-colors hover:bg-accent hover:text-primary"
          >
            الرئيسية
          </a>
          <a
            href="/#/offers"
            className="rounded-xl px-4 py-2 text-sm font-black text-foreground transition-colors hover:bg-accent hover:text-primary"
          >
            كل العروض
          </a>
          <a
            href="/#categories"
            className="rounded-xl px-4 py-2 text-sm font-black text-foreground transition-colors hover:bg-accent hover:text-primary"
          >
            الأقسام
          </a>
          <a
            href="/#latest-offers"
            className="rounded-xl px-4 py-2 text-sm font-black text-foreground transition-colors hover:bg-accent hover:text-primary"
          >
            أحدث اللقطات
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="/account"
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-input bg-card px-2.5 text-xs font-black text-foreground shadow-sm transition-colors hover:border-primary/40 hover:bg-accent sm:h-10 sm:px-3"
            aria-label={user ? 'حسابي' : 'تسجيل الدخول'}
          >
            <UserRound className="size-4" />
            <span className="hidden sm:inline">
              {user ? 'حسابي' : 'دخول'}
            </span>
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
