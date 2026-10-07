import BrandLogo from '@/components/la2ta/brand-logo'

export default function SiteFooter() {
  return (
    <footer className="mt-auto border-t bg-card pt-5 pb-safe">
      <div className="flex flex-col items-center px-4 text-center">
        <BrandLogo size="md" />
        <p className="mt-2 text-sm font-black text-foreground">
          عروضك أقرب لك
        </p>
        <div className="mt-2.5 flex items-center justify-center gap-3 text-xs text-muted-foreground">
          <a
            href="#/admin"
            className="font-bold transition-colors hover:text-primary"
          >
            لوحة التحكم
          </a>
          <span className="h-3 w-px bg-border" aria-hidden />
          <span>© {new Date().getFullYear()} لقطة</span>
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
          عروض حقيقية محدودة المدة — العرض بيسري بمجرد انتهاء مدته أو نفاد الكمية
          عند المحل.
        </p>
      </div>
    </footer>
  )
}
