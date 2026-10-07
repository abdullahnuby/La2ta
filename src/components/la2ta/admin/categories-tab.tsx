'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { ArrowDown, ArrowUp, Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  useAdminCategories,
  useDeleteCategory,
  useSaveCategory,
} from '@/hooks/use-la2ta-api'
import type { AdminCategory } from '@/lib/types'

interface CategoryForm {
  id?: number
  name: string
  slug: string
  icon: string
  sortOrder: string
  isActive: boolean
}

const emptyForm = (nextOrder: number): CategoryForm => ({
  name: '',
  slug: '',
  icon: '',
  sortOrder: String(nextOrder),
  isActive: true,
})

export default function CategoriesTab() {
  const { data, isLoading } = useAdminCategories()
  const saveCategory = useSaveCategory()
  const deleteCategory = useDeleteCategory()

  const [form, setForm] = useState<CategoryForm | null>(null)
  const [deleting, setDeleting] = useState<AdminCategory | null>(null)

  const categories = data?.categories ?? []

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form) return
    if (!form.name.trim()) return toast.error('اكتب اسم التصنيف')
    try {
      await saveCategory.mutateAsync({
        id: form.id,
        name: form.name.trim(),
        slug: form.slug.trim(),
        icon: form.icon.trim(),
        sortOrder: form.sortOrder === '' ? undefined : Number(form.sortOrder),
        isActive: form.isActive,
      })
      toast.success(form.id ? 'تم تعديل التصنيف ✅' : 'تم إضافة التصنيف 🗂️')
      setForm(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'حصل خطأ')
    }
  }

  /** Swap sortOrder with the neighbour above/below (PRD §9: reorder) */
  const move = async (cat: AdminCategory, dir: 'up' | 'down') => {
    const idx = categories.findIndex((c) => c.id === cat.id)
    const target = dir === 'up' ? categories[idx - 1] : categories[idx + 1]
    if (!target) return
    try {
      await saveCategory.mutateAsync({
        id: cat.id,
        sortOrder: target.sortOrder,
      })
      await saveCategory.mutateAsync({
        id: target.id,
        sortOrder: cat.sortOrder,
      })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'حصل خطأ')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-muted-foreground">
          التصنيفات بتظهر في الصفحة الرئيسية بالترتيب — تقدر تضيف، تعدّل، تخفي،
          وترتب.
        </p>
        <Button
          onClick={() =>
            setForm(emptyForm((categories.at(-1)?.sortOrder ?? 0) + 1))
          }
          className="shrink-0 gap-1.5 rounded-xl font-bold"
        >
          <Plus className="size-4.5" />
          إضافة تصنيف
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="max-h-[70vh] space-y-2 overflow-y-auto nice-scroll pl-1">
          {categories.map((c, i) => (
            <div
              key={c.id}
              className={`flex items-center gap-3 rounded-2xl border bg-card p-3.5 ${
                c.isActive ? '' : 'opacity-60'
              }`}
            >
              <div className="flex flex-col gap-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6 rounded-md"
                  disabled={i === 0 || saveCategory.isPending}
                  onClick={() => move(c, 'up')}
                  aria-label="تحريك لأعلى"
                >
                  <ArrowUp className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6 rounded-md"
                  disabled={i === categories.length - 1 || saveCategory.isPending}
                  onClick={() => move(c, 'down')}
                  aria-label="تحريك لأسفل"
                >
                  <ArrowDown className="size-3.5" />
                </Button>
              </div>

              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent text-xl">
                {c.icon || '🗂️'}
              </span>

              <div className="min-w-0 flex-1 leading-tight">
                <p className="truncate font-extrabold text-foreground">{c.name}</p>
                <p className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <span dir="ltr">/{c.slug}</span>
                  <span>· {c.offersCount} عرض</span>
                </p>
              </div>

              <Badge
                variant="secondary"
                className={`hidden border-0 font-black sm:inline-flex ${
                  c.isActive
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {c.isActive ? 'ظاهر' : 'مخفي'}
              </Badge>

              <Switch
                checked={c.isActive}
                disabled={saveCategory.isPending}
                onCheckedChange={(v) =>
                  saveCategory.mutate(
                    { id: c.id, isActive: v },
                    {
                      onSuccess: () =>
                        toast.success(
                          v ? 'التصنيف ظهر في الرئيسية' : 'التصنيف اتخفى'
                        ),
                    }
                  )
                }
                aria-label={`تبديل ظهور ${c.name}`}
              />

              <Button
                variant="ghost"
                size="icon"
                className="size-9 rounded-lg"
                onClick={() =>
                  setForm({
                    id: c.id,
                    name: c.name,
                    slug: c.slug,
                    icon: c.icon,
                    sortOrder: String(c.sortOrder),
                    isActive: c.isActive,
                  })
                }
                aria-label={`تعديل ${c.name}`}
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-9 rounded-lg text-destructive hover:text-destructive"
                onClick={() => setDeleting(c)}
                aria-label={`حذف ${c.name}`}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Category form */}
      <Dialog open={form !== null} onOpenChange={(open) => !open && setForm(null)}>
        <DialogContent className="max-w-md rounded-3xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">
              {form?.id ? 'تعديل التصنيف' : 'إضافة تصنيف جديد 🗂️'}
            </DialogTitle>
            <DialogDescription className="font-medium">
              التصنيفات عامة — لأي نشاط تجاري يقدم عرضًا
            </DialogDescription>
          </DialogHeader>
          {form && (
            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-[1fr_88px] gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="c-name" className="font-bold">
                    الاسم *
                  </Label>
                  <Input
                    id="c-name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="مثال: أزياء"
                    className="rounded-xl font-semibold"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="c-icon" className="font-bold">
                    الأيقونة
                  </Label>
                  <Input
                    id="c-icon"
                    value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    placeholder="👗"
                    className="rounded-xl text-center text-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="c-slug" className="font-bold">
                    Slug (اختياري)
                  </Label>
                  <Input
                    id="c-slug"
                    dir="ltr"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="fashion"
                    className="rounded-xl text-start font-semibold"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="c-order" className="font-bold">
                    الترتيب
                  </Label>
                  <Input
                    id="c-order"
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) =>
                      setForm({ ...form, sortOrder: e.target.value })
                    }
                    className="rounded-xl font-semibold"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-xl border bg-muted/40 p-3.5">
                <Label className="font-bold">ظاهر في الصفحة الرئيسية</Label>
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
                  disabled={saveCategory.isPending}
                  className="min-w-28 rounded-xl font-bold"
                >
                  {saveCategory.isPending ? (
                    <Loader2 className="size-4.5 animate-spin" />
                  ) : form.id ? (
                    'حفظ التعديلات'
                  ) : (
                    'إضافة التصنيف'
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete category */}
      <AlertDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <AlertDialogContent dir="rtl" className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black">
              حذف التصنيف؟
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base font-medium">
              حذف «{deleting?.name}» — العروض اللي فيه ({deleting?.offersCount}{' '}
              عرض) مش هتتمسح، بس هتفقد التصنيف. متأكد؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl font-bold">
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleting)
                  deleteCategory.mutate(deleting.id, {
                    onSuccess: () => toast.success('تم حذف التصنيف'),
                    onError: (err) =>
                      toast.error(err instanceof Error ? err.message : 'حصل خطأ'),
                  })
                setDeleting(null)
              }}
              className="rounded-xl bg-destructive font-bold hover:bg-destructive/90"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
