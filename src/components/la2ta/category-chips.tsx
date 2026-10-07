'use client'

import { Skeleton } from '@/components/ui/skeleton'
import type { Category } from '@/lib/types'

export default function CategoryChips({
  categories,
  active,
  onSelect,
  isLoading,
}: {
  categories: Category[]
  active: string | null
  onSelect: (slug: string | null) => void
  isLoading?: boolean
}) {
  if (isLoading) {
    return (
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-11 w-24 shrink-0 rounded-full" />
        ))}
      </div>
    )
  }

  const chip = (label: string, slug: string | null) => {
    const isActive = active === slug
    return (
      <button
        key={slug ?? 'all'}
        type="button"
        onClick={() => onSelect(slug)}
        aria-pressed={isActive}
        className={`inline-flex h-11 shrink-0 items-center rounded-full border px-4 text-[13px] font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          isActive
            ? 'border-primary bg-primary text-primary-foreground shadow-md shadow-primary/30'
            : 'border-input bg-card text-foreground hover:border-primary/40 hover:bg-accent hover:text-accent-foreground'
        }`}
      >
        {label}
      </button>
    )
  }

  return (
    <div
      className="-mx-4 flex gap-2 overflow-x-auto px-4 scrollbar-hide"
      role="tablist"
      aria-label="تصنيفات العروض"
    >
      {chip('الكل', null)}
      {categories.map((c) => chip(`${c.icon ? `${c.icon} ` : ''}${c.name}`, c.slug))}
    </div>
  )
}
