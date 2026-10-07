'use client'

import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'

export default function SearchBar({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute start-3.5 top-1/2 size-4.5 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        type="search"
        inputMode="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="بتدور على إيه؟ 🔍"
        aria-label="ابحث في العروض"
        className="h-12 rounded-xl border-input bg-card ps-11 pe-11 text-[15px] font-semibold shadow-sm placeholder:font-medium focus-visible:ring-primary/40"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute end-3 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          aria-label="مسح البحث"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  )
}
