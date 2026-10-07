'use client'

import { useEffect } from 'react'
import { LayoutDashboard, LogOut, ExternalLink } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import AdminLogin from '@/components/la2ta/admin/admin-login'
import OverviewTab from '@/components/la2ta/admin/overview-tab'
import OffersTab from '@/components/la2ta/admin/offers-tab'
import StoresTab from '@/components/la2ta/admin/stores-tab'
import CategoriesTab from '@/components/la2ta/admin/categories-tab'
import { useAdminStore } from '@/lib/api-client'

export default function AdminPanel() {
  const { token, ready, hydrate, logout } = useAdminStore()

  useEffect(() => {
    void hydrate()
  }, [hydrate])

  if (!ready) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-16 text-center text-muted-foreground">
        جارٍ التحميل...
      </div>
    )
  }

  if (!token) return <AdminLogin />

  return (
    <div className="container mx-auto max-w-6xl space-y-6 px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2.5 text-2xl font-black text-foreground">
          <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground">
            <LayoutDashboard className="size-5.5" />
          </span>
          لوحة تحكم لقطة
        </h1>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" className="rounded-xl font-bold">
            <a href="#/">
              <ExternalLink className="size-4" />
              الموقع
            </a>
          </Button>
          <Button
            variant="ghost"
            onClick={() => void logout()}
            className="gap-1.5 rounded-xl font-bold text-destructive hover:text-destructive"
          >
            <LogOut className="size-4" />
            خروج
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" dir="rtl">
        <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-2xl bg-muted p-1.5 scrollbar-hide">
          <TabsTrigger
            value="overview"
            className="rounded-xl px-4 py-2.5 font-bold data-[state=active]:shadow-sm"
          >
            📊 نظرة عامة
          </TabsTrigger>
          <TabsTrigger
            value="offers"
            className="rounded-xl px-4 py-2.5 font-bold data-[state=active]:shadow-sm"
          >
            🔥 العروض
          </TabsTrigger>
          <TabsTrigger
            value="stores"
            className="rounded-xl px-4 py-2.5 font-bold data-[state=active]:shadow-sm"
          >
            🏪 المحلات
          </TabsTrigger>
          <TabsTrigger
            value="categories"
            className="rounded-xl px-4 py-2.5 font-bold data-[state=active]:shadow-sm"
          >
            🗂️ التصنيفات
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <OverviewTab />
        </TabsContent>
        <TabsContent value="offers" className="mt-4">
          <OffersTab />
        </TabsContent>
        <TabsContent value="stores" className="mt-4">
          <StoresTab />
        </TabsContent>
        <TabsContent value="categories" className="mt-4">
          <CategoriesTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
