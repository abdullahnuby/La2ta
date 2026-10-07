import Image from 'next/image'

export default function BrandLogo({
  size = 'md',
  priority = false,
  className = '',
}: {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  priority?: boolean
  className?: string
}) {
  const sizes = {
    sm: { box: 'size-12', pixels: 48 },
    md: { box: 'size-14', pixels: 56 },
    lg: { box: 'size-20', pixels: 80 },
    xl: { box: 'size-28', pixels: 112 },
  } as const

  const current = sizes[size]

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm dark:border-white/10 ${current.box} ${className}`}
    >
      <Image
        src="/la2ta-logo.png"
        alt="لقطة — عروضك أقرب لك"
        width={current.pixels}
        height={current.pixels}
        priority={priority}
        className="h-full w-full object-contain"
      />
    </span>
  )
}
