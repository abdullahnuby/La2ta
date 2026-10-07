'use client'

import { useTheme } from 'next-themes'
import { Moon, Sun, Flame } from 'lucide-react'
import { Button } from '@/components/ui/button'

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <Button
      variant="outline"
      size="icon"
      className="size-9 rounded-xl border-input bg-card"
      aria-label="تبديل الوضع الليلي"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
    >
      <Sun className="size-4 hidden dark:block" />
      <Moon className="size-4 dark:hidden" />
    </Button>
  )
}

/** Compact sticky app bar — one thumb-reachable row */
export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <div className="flex h-14 items-center justify-between gap-3 px-4">
        <a
          href="#/"
          className="flex items-center gap-2.5 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          aria-label="لقطة — الرئيسية"
        >
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/30">
            <Flame className="size-5" strokeWidth={2.5} />
          </span>
          <span className="leading-none">
            <span className="block text-xl font-black tracking-tight text-foreground">
              لقطة
            </span>
            <span className="mt-1 block text-[10px] font-bold text-muted-foreground">
              عروض الأقصر · LA2TA
            </span>
          </span>
        </a>

        <ThemeToggle />
      </div>
    </header>
  )
}
