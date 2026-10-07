'use client'

import { Button } from '@/components/ui/button'

export default function EmptyState({
  title,
  subtitle,
  icon = '🤷',
  actionLabel,
  onAction,
}: {
  title: string
  subtitle?: string
  icon?: string
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed bg-card/60 px-6 py-16 text-center">
      <span className="text-5xl" aria-hidden>
        {icon}
      </span>
      <h3 className="text-lg font-black text-foreground">{title}</h3>
      {subtitle && (
        <p className="max-w-sm text-sm font-medium text-muted-foreground">
          {subtitle}
        </p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-2 rounded-2xl font-bold">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
