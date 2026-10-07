'use client'

import {
  Eye,
  MapPin,
  MessageCircle,
  MousePointerClick,
  Phone,
  Share2,
  Flame,
  Store,
  Tags,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useAdminStats } from '@/hooks/use-la2ta-api'
import { OFFER_STATUS_LABELS, type OfferStatus } from '@/lib/types'

function StatCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  hint?: string
}) {
  return (
    <Card className="rounded-2xl">
      <CardContent className="flex items-center gap-3.5 p-4 sm:p-5">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
          {icon}
        </span>
        <div className="leading-tight">
          <p className="text-2xl font-black text-foreground">
            {typeof value === 'number'
              ? value.toLocaleString('en-US')
              : value}
          </p>
          <p className="text-xs font-bold text-muted-foreground">
            {label}
            {hint ? ` · ${hint}` : ''}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default function OverviewTab() {
  const { data, isLoading } = useAdminStats()

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    )
  }

  const t = data.totals

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard
          icon={<Flame className="size-5.5 text-primary" />}
          label="عروض نشطة دلوقتي"
          value={t.active}
          hint={`من ${t.offers} إجمالي`}
        />
        <StatCard
          icon={<Eye className="size-5.5 text-primary" />}
          label="مشاهدات صفحات العروض"
          value={t.views}
          hint={`${t.impressions.toLocaleString('en-US')} ظهور`}
        />
        <StatCard
          icon={<MousePointerClick className="size-5.5 text-primary" />}
          label="إجمالي الإجراءات"
          value={t.mapClicks + t.callClicks + t.whatsappClicks}
          hint="خرائط + اتصال + واتساب"
        />
        <StatCard
          icon={<MapPin className="size-5.5 text-primary" />}
          label="فتح الموقع على الخرائط"
          value={t.mapClicks}
        />
        <StatCard
          icon={<Phone className="size-5.5 text-primary" />}
          label="مكالمات هاتفية"
          value={t.callClicks}
        />
        <StatCard
          icon={<MessageCircle className="size-5.5 text-primary" />}
          label="رسائل واتساب"
          value={t.whatsappClicks}
          hint={`${t.shares.toLocaleString('en-US')} مشاركة`}
        />
      </div>

      <Card className="overflow-hidden rounded-2xl">
        <CardHeader className="border-b bg-muted/50 py-4">
          <CardTitle className="flex items-center gap-2 text-lg font-black">
            🏆 أعلى العروض مشاهدة
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-96 overflow-auto nice-scroll">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="font-black">العرض</TableHead>
                  <TableHead className="text-center font-black">
                    <Eye className="mx-auto size-4" />
                    <span className="sr-only">مشاهدات</span>
                  </TableHead>
                  <TableHead className="text-center font-black">
                    <MapPin className="mx-auto size-4" />
                    <span className="sr-only">خرائط</span>
                  </TableHead>
                  <TableHead className="text-center font-black">
                    <Phone className="mx-auto size-4" />
                    <span className="sr-only">اتصال</span>
                  </TableHead>
                  <TableHead className="text-center font-black">
                    <MessageCircle className="mx-auto size-4" />
                    <span className="sr-only">واتساب</span>
                  </TableHead>
                  <TableHead className="text-center font-black">
                    <Share2 className="mx-auto size-4" />
                    <span className="sr-only">مشاركات</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.top.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-10 text-center font-bold text-muted-foreground"
                    >
                      لسه مفيش بيانات — أول ما الناس تبدأ تشوف العروض هتظهر الإحصائيات هنا
                    </TableCell>
                  </TableRow>
                ) : (
                  data.top.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell>
                        <p className="font-extrabold text-foreground">{o.title}</p>
                        <p className="text-xs font-semibold text-muted-foreground">
                          {o.storeName} ·{' '}
                          <Badge
                            variant="secondary"
                            className="px-1.5 py-0 text-[10px] font-black"
                          >
                            {OFFER_STATUS_LABELS[o.status as OfferStatus] ?? o.status}
                          </Badge>
                        </p>
                      </TableCell>
                      <TableCell className="text-center font-black text-primary">
                        {o.views.toLocaleString('en-US')}
                      </TableCell>
                      <TableCell className="text-center font-bold">
                        {o.mapClicks}
                      </TableCell>
                      <TableCell className="text-center font-bold">
                        {o.callClicks}
                      </TableCell>
                      <TableCell className="text-center font-bold">
                        {o.whatsappClicks}
                      </TableCell>
                      <TableCell className="text-center font-bold">
                        {o.shares}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<Store className="size-5.5 text-primary" />}
          label="محلات مسجلة"
          value={t.stores}
        />
        <StatCard
          icon={<Tags className="size-5.5 text-primary" />}
          label="تصنيفات"
          value={t.categories}
        />
      </div>
    </div>
  )
}
