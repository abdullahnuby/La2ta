'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import {
  Loader2,
  MapPin,
  MessageCircle,
  Pencil,
  Phone,
  Plus,
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
  useAdminStores,
  useDeleteStore,
  useSaveStore,
  useUpdateStore,
} from '@/hooks/use-la2ta-api'
import type { AdminStore } from '@/lib/types'

interface StoreForm {
  id?: number
  name: string
  description: string
  phone: string
  whatsapp: string
  address: string
  latitude: string
  longitude: string
  isActive: boolean
}

const emptyForm = (): StoreForm => ({
  name: '',
  description: '',
  phone: '',
  whatsapp: '',
  address: '',
  latitude: '',
  longitude: '',
  isActive: true,
})

const toForm = (s: AdminStore): StoreForm => ({
  id: s.id,
  name: s.name,
  description: s.description,
  phone: s.phone,
  whatsapp: s.whatsapp,
  address: s.address,
  latitude: s.latitude != null ? String(s.latitude) : '',
  longitude: s.longitude != null ? String(s.longitude) : '',
  isActive: s.isActive,
})

export default function StoresTab() {
  const { data, isLoading } = useAdminStores()
  const saveStore = useSaveStore()
  const updateStore = useUpdateStore()
  const deleteStore = useDeleteStore()

  const [form, setForm] = useState<StoreForm | null>(null)
  const [deleting, setDeleting] = useState<AdminStore | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form) return
    if (!form.name.trim()) return toast.error('اكتب اسم المحل')
    try {
      await saveStore.mutateAsync({
        id: form.id,
        name: form.name.trim(),
        description: form.description.trim(),
        phone: form.phone.trim(),
        whatsapp: form.whatsapp.trim(),
        address: form.address.trim(),
        latitude: form.latitude === '' ? null : Number(form.latitude),
        longitude: form.longitude === '' ? null : Number(form.longitude),
        isActive: form.isActive,
      })
      toast.success(form.id ? 'تم تعديل بيانات المحل ✅' : 'تم إضافة المحل 🏪')
      setForm(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'حصل خطأ')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => setForm(emptyForm())}
          className="gap-1.5 rounded-xl font-bold"
        >
          <Plus className="size-4.5" />
          إضافة محل
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      ) : (data?.stores ?? []).length === 0 ? (
        <div className="rounded-3xl border border-dashed bg-card/60 px-6 py-14 text-center">
          <span className="text-5xl">🏪</span>
          <h3 className="mt-3 text-lg font-black">لسه مفيش محلات</h3>
          <p className="text-sm font-medium text-muted-foreground">
            أضف أول محل وابدأ انشر عروضه.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {(data?.stores ?? []).map((s) => (
            <div
              key={s.id}
              className={`space-y-3 rounded-2xl border bg-card p-4 ${
                s.isActive ? '' : 'opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="leading-tight">
                  <p className="text-lg font-black text-foreground">🏪 {s.name}</p>
                  <p className="mt-1 text-xs font-bold text-muted-foreground">
                    {s.offersCount} عرض · {s.isActive ? 'ظاهر' : 'مخفي'}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-9 rounded-lg"
                    onClick={() => setForm(toForm(s))}
                    aria-label={`تعديل ${s.name}`}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-9 rounded-lg text-destructive hover:text-destructive"
                    onClick={() => setDeleting(s)}
                    aria-label={`حذف ${s.name}`}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>

              {s.address && (
                <p className="flex items-start gap-1.5 text-sm font-semibold text-muted-foreground">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                  {s.address}
                </p>
              )}
              <div className="flex flex-wrap gap-2 text-xs font-bold">
                {s.phone && (
                  <Badge variant="secondary" className="gap-1 rounded-lg">
                    <Phone className="size-3" /> {s.phone}
                  </Badge>
                )}
                {s.whatsapp && (
                  <Badge variant="secondary" className="gap-1 rounded-lg">
                    <MessageCircle className="size-3" /> {s.whatsapp}
                  </Badge>
                )}
                {s.latitude != null && s.longitude != null && (
                  <Badge variant="secondary" className="rounded-lg">
                    📍 إحداثيات موجودة
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2">
                <span className="text-sm font-bold">
                  {s.isActive ? 'ظاهر في الموقع' : 'مخفي من الموقع'}
                </span>
                <Switch
                  checked={s.isActive}
                  disabled={updateStore.isPending}
                  onCheckedChange={(v) =>
                    updateStore.mutate(
                      { id: s.id, isActive: v },
                      {
                        onSuccess: () =>
                          toast.success(
                            v ? 'المحل ظاهر دلوقتي' : 'المحل اتخفى وعروضه مش هتظهر'
                          ),
                        onError: (err) =>
                          toast.error(
                            err instanceof Error ? err.message : 'حصل خطأ'
                          ),
                      }
                    )
                  }
                  aria-label={`تبديل ظهور ${s.name}`}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Store form */}
      <Dialog open={form !== null} onOpenChange={(open) => !open && setForm(null)}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto nice-scroll rounded-3xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">
              {form?.id ? 'تعديل المحل' : 'إضافة محل جديد 🏪'}
            </DialogTitle>
            <DialogDescription className="font-medium">
              بيانات المحل بتظهر في صفحة تفاصيل العرض
            </DialogDescription>
          </DialogHeader>
          {form && (
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="s-name" className="font-bold">
                  اسم المحل *
                </Label>
                <Input
                  id="s-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="مثال: طيبة للملابس الجاهزة"
                  className="rounded-xl font-semibold"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="s-desc" className="font-bold">
                  الوصف
                </Label>
                <Textarea
                  id="s-desc"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="نبذة عن المحل — اختياري"
                  rows={2}
                  className="rounded-xl font-medium"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="s-phone" className="font-bold">
                    رقم الهاتف
                  </Label>
                  <Input
                    id="s-phone"
                    dir="ltr"
                    inputMode="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="01001234567"
                    className="rounded-xl text-start font-semibold"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="s-wa" className="font-bold">
                    رقم WhatsApp
                  </Label>
                  <Input
                    id="s-wa"
                    dir="ltr"
                    inputMode="tel"
                    value={form.whatsapp}
                    onChange={(e) =>
                      setForm({ ...form, whatsapp: e.target.value })
                    }
                    placeholder="01001234567"
                    className="rounded-xl text-start font-semibold"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="s-address" className="font-bold">
                  العنوان
                </Label>
                <Input
                  id="s-address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="شارع المحطة، الأقصر"
                  className="rounded-xl font-semibold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="s-lat" className="font-bold">
                    Latitude
                  </Label>
                  <Input
                    id="s-lat"
                    dir="ltr"
                    inputMode="decimal"
                    value={form.latitude}
                    onChange={(e) =>
                      setForm({ ...form, latitude: e.target.value })
                    }
                    placeholder="25.6992"
                    className="rounded-xl text-start font-semibold"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="s-lng" className="font-bold">
                    Longitude
                  </Label>
                  <Input
                    id="s-lng"
                    dir="ltr"
                    inputMode="decimal"
                    value={form.longitude}
                    onChange={(e) =>
                      setForm({ ...form, longitude: e.target.value })
                    }
                    placeholder="32.6443"
                    className="rounded-xl text-start font-semibold"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-xl border bg-muted/40 p-3.5">
                <Label className="font-bold">المحل ظاهر في الموقع</Label>
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(v) => setForm({ ...form, isActive: v })}
                />
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
                  disabled={saveStore.isPending}
                  className="min-w-28 rounded-xl font-bold"
                >
                  {saveStore.isPending ? (
                    <Loader2 className="size-4.5 animate-spin" />
                  ) : form.id ? (
                    'حفظ التعديلات'
                  ) : (
                    'إضافة المحل'
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete store */}
      <AlertDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <AlertDialogContent dir="rtl" className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black">
              حذف المحل؟
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base font-medium">
              حذف «{deleting?.name}» هيحذف كل عروضه ({deleting?.offersCount} عرض)
              نهائيًا. متأكد؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl font-bold">
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleting)
                  deleteStore.mutate(deleting.id, {
                    onSuccess: () => toast.success('تم حذف المحل وعروضه'),
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
