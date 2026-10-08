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
      className="size-9 rounded-xl border-input bg-card"
      aria-label="تبديل الوضع الليلي"
      onClick={() =>
        setTheme(
          resolvedTheme === 'dark' ? 'light' : 'dark'
        )
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
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <a
          href="/"
          className="flex min-w-0 items-center gap-2.5 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          aria-label="لقطة — الرئيسية"
        >
          <BrandLogo size="sm" priority />
          <span className="min-w-0 leading-none">
            <span className="block truncate text-xl font-black tracking-tight text-foreground sm:text-2xl">
              لقطة
            </span>
            <span className="mt-1 block truncate text-[10px] font-bold text-muted-foreground sm:text-xs">
              عروضك أقرب لك
            </span>
          </span>
        </a>

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
