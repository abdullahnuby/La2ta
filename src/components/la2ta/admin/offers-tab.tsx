'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import {
  Eye,
  EyeOff,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import EmptyState from '@/components/la2ta/empty-state'
import ImageUpload from '@/components/la2ta/admin/image-upload'
import {
  useAdminCategories,
  useAdminOffers,
  useAdminStores,
  useDeleteOffer,
  useSaveOffer,
  useUpdateOffer,
} from '@/hooks/use-la2ta-api'
import { formatDate, formatPrice, toDateTimeLocal } from '@/lib/format'
import {
  OFFER_STATUS_LABELS,
  OFFER_TYPE_LABELS,
  type AdminOffer,
  type OfferStatus,
  type OfferType,
} from '@/lib/types'

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  DRAFT: 'bg-muted text-muted-foreground',
  PAUSED: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  EXPIRED: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
}

interface FormState {
  id?: number
  storeId: string
  categoryId: string
  title: string
  description: string
  oldPrice: string
  newPrice: string
  offerType: OfferType
  imageUrl: string
  startAt: string
  endAt: string
  isFeatured: boolean
  status: OfferStatus
}

function emptyForm(): FormState {
  const now = new Date()
  const end = new Date(now.getTime() + 7 * 86_400_000)
  return {
    storeId: '',
    categoryId: 'none',
    title: '',
    description: '',
    oldPrice: '',
    newPrice: '',
    offerType: 'discount',
    imageUrl: '',
    startAt: toDateTimeLocal(now),
    endAt: toDateTimeLocal(end),
    isFeatured: false,
    status: 'ACTIVE',
  }
}

function toForm(o: AdminOffer): FormState {
  return {
    id: o.id,
    storeId: String(o.storeId),
    categoryId: o.categoryId ? String(o.categoryId) : 'none',
    title: o.title,
    description: o.description,
    oldPrice: o.oldPrice != null ? String(o.oldPrice) : '',
    newPrice: o.newPrice != null ? String(o.newPrice) : '',
    offerType: (o.offerType as OfferType) || 'discount',
    imageUrl: o.imageUrl,
    startAt: toDateTimeLocal(o.startAt),
    endAt: toDateTimeLocal(o.endAt),
    isFeatured: o.isFeatured,
    status: o.status,
  }
}

export default function OffersTab() {
  const { data, isLoading } = useAdminOffers()
  const { data: storesData } = useAdminStores()
  const { data: categoriesData } = useAdminCategories()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [form, setForm] = useState<FormState | null>(null)
  const [deleting, setDeleting] = useState<AdminOffer | null>(null)

  const saveOffer = useSaveOffer()
  const updateOffer = useUpdateOffer()
  const deleteOffer = useDeleteOffer()

  const offers = data?.offers ?? []
  const filtered = useMemo(() => {
    const q = search.trim()
    return offers.filter((o) => {
      if (statusFilter !== 'ALL' && o.status !== statusFilter) return false
      if (q && !`${o.title} ${o.storeName}`.includes(q)) return false
      return true
    })
  }, [offers, search, statusFilter])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form) return
    if (!form.storeId) return toast.error('لازم تختار المحل')
    if (!form.title.trim()) return toast.error('اكتب عنوان العرض')
    if (!form.startAt || !form.endAt)
      return toast.error('حدد تاريخ البداية والنهاية')

    try {
      await saveOffer.mutateAsync({
        id: form.id,
        storeId: Number(form.storeId),
        categoryId: form.categoryId === 'none' ? null : Number(form.categoryId),
        title: form.title.trim(),
        description: form.description.trim(),
        imageUrl: form.imageUrl.trim(),
        oldPrice: form.oldPrice === '' ? null : Number(form.oldPrice),
        newPrice: form.newPrice === '' ? null : Number(form.newPrice),
        offerType: form.offerType,
        startAt: new Date(form.startAt).toISOString(),
        endAt: new Date(form.endAt).toISOString(),
        isFeatured: form.isFeatured,
        status: form.status,
      })
      toast.success(form.id ? 'تم تعديل العرض ✅' : 'تم إضافة العرض 🔥')
      setForm(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'حصل خطأ')
    }
  }

  const quickStatus = async (o: AdminOffer, status: OfferStatus) => {
    try {
      await updateOffer.mutateAsync({ id: o.id, status })
      toast.success(
        status === 'ACTIVE'
          ? 'تم نشر العرض 🔥'
          : status === 'PAUSED'
            ? 'تم إيقاف العرض مؤقتًا'
            : 'تم تحويل العرض لمسودة'
      )
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'حصل خطأ')
    }
  }

  const toggleFeatured = async (o: AdminOffer) => {
    try {
      await updateOffer.mutateAsync({ id: o.id, isFeatured: !o.isFeatured })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'حصل خطأ')
    }
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-44 flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="دوّر في العروض..."
            className="h-10 rounded-xl ps-9 font-semibold"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-10 w-36 rounded-xl font-bold">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">كل الحالات</SelectItem>
            <SelectItem value="ACTIVE">نشط</SelectItem>
            <SelectItem value="DRAFT">مسودة</SelectItem>
            <SelectItem value="PAUSED">متوقف</SelectItem>
            <SelectItem value="EXPIRED">منتهي</SelectItem>
          </SelectContent>
        </Select>
        <Button
          onClick={() => setForm(emptyForm())}
          className="h-10 gap-1.5 rounded-xl font-bold"
        >
          <Plus className="size-4.5" />
          إضافة عرض
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="🔥"
          title="مفيش عروض هنا"
          subtitle={
            offers.length === 0
              ? 'ابدأ بإضافة أول عرض — اضغط «إضافة عرض» فوق.'
              : 'مفيش نتائج على البحث أو الفلتر الحالي.'
          }
          actionLabel={offers.length === 0 ? 'إضافة أول عرض' : undefined}
          onAction={offers.length === 0 ? () => setForm(emptyForm()) : undefined}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-card">
          <div className="max-h-[70vh] overflow-auto nice-scroll">
            <Table>
              <TableHeader>
                <TableRow className="sticky top-0 z-10 bg-muted/95 backdrop-blur-sm hover:bg-muted/95">
                  <TableHead className="font-black">العرض</TableHead>
                  <TableHead className="font-black">السعر</TableHead>
                  <TableHead className="text-center font-black">مميز</TableHead>
                  <TableHead className="text-center font-black">الحالة</TableHead>
                  <TableHead className="font-black">الينتهي</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-muted">
                          {o.imageUrl ? (
                            <Image
                              src={o.imageUrl}
                              alt=""
                              fill
                              sizes="48px"
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <span className="grid h-full place-items-center text-lg">
                              🔥
                            </span>
                          )}
                        </div>
                        <div className="leading-tight">
                          <p className="line-clamp-1 font-extrabold text-foreground">
                            {o.title}
                          </p>
                          <p className="text-xs font-semibold text-muted-foreground">
                            🏪 {o.storeName}
                            {o.categoryName ? ` · ${o.categoryName}` : ''}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {o.newPrice != null ? (
                        <div className="leading-tight">
                          <p className="font-black text-primary">
                            {formatPrice(o.newPrice)}
                          </p>
                          {o.oldPrice != null && (
                            <p className="text-xs font-semibold text-muted-foreground line-through">
                              {formatPrice(o.oldPrice)}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <button
                        type="button"
                        onClick={() => toggleFeatured(o)}
                        disabled={updateOffer.isPending}
                        className="transition-transform hover:scale-125"
                        aria-label={
                          o.isFeatured ? 'إلغاء التمييز' : 'تمييز العرض في لقطة اليوم'
                        }
                        title={o.isFeatured ? 'مميز 🔥' : 'عادي'}
                      >
                        <Star
                          className={`size-5.5 ${
                            o.isFeatured
                              ? 'fill-primary text-primary'
                              : 'text-muted-foreground'
                          }`}
                        />
                      </button>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        className={`border-0 font-black ${STATUS_STYLES[o.status] ?? ''}`}
                      >
                        {OFFER_STATUS_LABELS[o.status as OfferStatus] ?? o.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm font-bold text-muted-foreground">
                      {formatDate(o.endAt)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-9 rounded-lg"
                            aria-label="إجراءات"
                          >
                            <MoreHorizontal className="size-4.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={() => setForm(toForm(o))}
                            className="gap-2 font-bold"
                          >
                            <Pencil className="size-4" /> تعديل
                          </DropdownMenuItem>
                          {o.status !== 'ACTIVE' && (
                            <DropdownMenuItem
                              onClick={() => quickStatus(o, 'ACTIVE')}
                              className="gap-2 font-bold"
                            >
                              <Eye className="size-4" /> نشر
                            </DropdownMenuItem>
                          )}
                          {o.status === 'ACTIVE' && (
                            <DropdownMenuItem
                              onClick={() => quickStatus(o, 'PAUSED')}
                              className="gap-2 font-bold"
                            >
                              <EyeOff className="size-4" /> إيقاف مؤقت
                            </DropdownMenuItem>
                          )}
                          {o.status !== 'DRAFT' && (
                            <DropdownMenuItem
                              onClick={() => quickStatus(o, 'DRAFT')}
                              className="gap-2 font-bold"
                            >
                              📝 تحويل لمسودة
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setDeleting(o)}
                            className="gap-2 font-bold text-destructive focus:text-destructive"
                          >
                            <Trash2 className="size-4" /> حذف
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Offer form dialog (PRD §22) */}
      <Dialog open={form !== null} onOpenChange={(open) => !open && setForm(null)}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto nice-scroll rounded-3xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">
              {form?.id ? 'تعديل العرض' : 'إضافة عرض جديد 🔥'}
            </DialogTitle>
            <DialogDescription className="font-medium">
              املأ بيانات العرض — الحقول المهمة معمولة بعلامة *
            </DialogDescription>
          </DialogHeader>

          {form && (
            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="font-bold">المحل *</Label>
                  <Select
                    value={form.storeId}
                    onValueChange={(v) => setForm({ ...form, storeId: v })}
                  >
                    <SelectTrigger className="w-full rounded-xl font-semibold">
                      <SelectValue placeholder="اختار المحل" />
                    </SelectTrigger>
                    <SelectContent>
                      {(storesData?.stores ?? []).map((s) => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="font-bold">التصنيف</Label>
                  <Select
                    value={form.categoryId}
                    onValueChange={(v) => setForm({ ...form, categoryId: v })}
                  >
                    <SelectTrigger className="w-full rounded-xl font-semibold">
                      <SelectValue placeholder="اختار التصنيف" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">بدون تصنيف</SelectItem>
                      {(categoriesData?.categories ?? []).map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.icon} {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="title" className="font-bold">
                  العنوان *
                </Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="مثال: 3 شرابات بـ100 جنيه"
                  className="rounded-xl font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description" className="font-bold">
                  الوصف
                </Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="تفاصيل العرض — اختياري"
                  rows={2}
                  className="rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="oldPrice" className="font-bold">
                    السعر القديم
                  </Label>
                  <Input
                    id="oldPrice"
                    type="number"
                    min="0"
                    inputMode="decimal"
                    value={form.oldPrice}
                    onChange={(e) =>
                      setForm({ ...form, oldPrice: e.target.value })
                    }
                    placeholder="120"
                    className="rounded-xl font-semibold"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="newPrice" className="font-bold">
                    السعر الجديد
                  </Label>
                  <Input
                    id="newPrice"
                    type="number"
                    min="0"
                    inputMode="decimal"
                    value={form.newPrice}
                    onChange={(e) =>
                      setForm({ ...form, newPrice: e.target.value })
                    }
                    placeholder="100"
                    className="rounded-xl font-semibold"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="font-bold">نوع العرض</Label>
                  <Select
                    value={form.offerType}
                    onValueChange={(v) =>
                      setForm({ ...form, offerType: v as OfferType })
                    }
                  >
                    <SelectTrigger className="w-full rounded-xl font-semibold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(
                        Object.entries(OFFER_TYPE_LABELS) as [
                          OfferType,
                          string,
                        ][]
                      ).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="font-bold">صورة العرض</Label>
                <ImageUpload
                  value={form.imageUrl}
                  onChange={(url) => setForm({ ...form, imageUrl: url })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="startAt" className="font-bold">
                    يبدأ *
                  </Label>
                  <Input
                    id="startAt"
                    type="datetime-local"
                    value={form.startAt}
                    onChange={(e) =>
                      setForm({ ...form, startAt: e.target.value })
                    }
                    className="rounded-xl font-semibold"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="endAt" className="font-bold">
                    ينتهي *
                  </Label>
                  <Input
                    id="endAt"
                    type="datetime-local"
                    value={form.endAt}
                    onChange={(e) => setForm({ ...form, endAt: e.target.value })}
                    className="rounded-xl font-semibold"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-muted/40 p-3.5">
                <div className="flex items-center gap-2.5">
                  <Switch
                    id="featured"
                    checked={form.isFeatured}
                    onCheckedChange={(v) => setForm({ ...form, isFeatured: v })}
                  />
                  <Label htmlFor="featured" className="font-bold">
                    🔥 عرض مميز (يظهر في «لقطة اليوم»)
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="font-bold">الحالة</Label>
                  <Select
                    value={form.status}
                    onValueChange={(v) =>
                      setForm({ ...form, status: v as OfferStatus })
                    }
                  >
                    <SelectTrigger className="h-9 w-28 rounded-xl font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">نشط</SelectItem>
                      <SelectItem value="DRAFT">مسودة</SelectItem>
                      <SelectItem value="PAUSED">متوقف</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setForm(null)}
                  className="rounded-xl font-bold"
                >
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  disabled={saveOffer.isPending}
                  className="min-w-28 rounded-xl font-bold"
                >
                  {saveOffer.isPending ? (
                    <Loader2 className="size-4.5 animate-spin" />
                  ) : form.id ? (
                    'حفظ التعديلات'
                  ) : (
                    'نشر العرض'
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <AlertDialogContent dir="rtl" className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black">
              حذف العرض؟
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base font-medium">
              «{deleting?.title}» هيتم حذفه نهائيًا مع إحصائياته. متأكد؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl font-bold">
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleting)
                  deleteOffer.mutate(deleting.id, {
                    onSuccess: () => toast.success('تم حذف العرض'),
                    onError: (err) =>
                      toast.error(err instanceof Error ? err.message : 'حصل خطأ'),
                  })
                setDeleting(null)
              }}
              className="rounded-xl bg-destructive font-bold hover:bg-destructive/90"
            >
              حذف نهائي
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
