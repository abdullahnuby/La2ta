'use client'

import { BellRing, CheckCheck, Clock3, Heart, LogIn } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/components/la2ta/auth-provider'
import { useNotifications } from '@/components/la2ta/notifications-provider'
import { Button } from '@/components/ui/button'

function formatNotificationDate(value: string) {
  return new Intl.DateTimeFormat('ar-EG', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

export default function NotificationsPage() {
  const { user, configured } = useAuth()
  const { notifications, unreadCount, loading, markRead, markAllRead } = useNotifications()

  if (!user) {
    return (
      <main className="mx-auto flex min-h-[68vh] w-full max-w-2xl items-center px-4 py-10 sm:px-6">
        <section className="w-full rounded-[2rem] border bg-card p-7 text-center shadow-xl shadow-primary/5 sm:p-10">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary">
            <BellRing className="size-7" />
          </div>
          <h1 className="mt-5 text-2xl font-black">تنبيهات العروض</h1>
          <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-7 text-muted-foreground">
            سجل دخولك علشان نقدر نفكرك بالعروض اللي حفظتها قبل ما تخلص.
          </p>
          <Button asChild className="mt-6 h-11 rounded-xl px-6 font-black" disabled={!configured}>
            <a href="/account">
              <LogIn className="size-4" />
              تسجيل الدخول
            </a>
          </Button>
        </section>
      </main>
    )
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
      <section className="overflow-hidden rounded-[2rem] border bg-card shadow-xl shadow-primary/5">
        <div className="bg-[linear-gradient(135deg,#fff7ed_0%,#ffedd5_55%,#ffffff_100%)] px-5 py-7 sm:px-8 sm:py-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-primary">
                <BellRing className="size-5" />
                <span className="text-xs font-black">متابعة العروض</span>
              </div>
              <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                تنبيهاتك
                {unreadCount > 0 && (
                  <span className="ms-2 inline-flex min-w-7 items-center justify-center rounded-full bg-primary px-2 py-0.5 align-middle text-xs text-primary-foreground">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </h1>
              <p className="mt-1 text-xs font-semibold text-slate-600 sm:text-sm">
                هنفكرك بالعروض المحفوظة لما تقرب تنتهي.
              </p>
            </div>

            {unreadCount > 0 && (
              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-xl font-black"
                onClick={async () => {
                  try {
                    await markAllRead()
                    toast.success('اتعلمت كل التنبيهات كمقروءة.')
                  } catch (error) {
                    toast.error(error instanceof Error ? error.message : 'تعذر تحديث التنبيهات.')
                  }
                }}
              >
                <CheckCheck className="size-4" />
                تعليم الكل كمقروء
              </Button>
            )}
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-24 animate-pulse rounded-2xl bg-muted" />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="rounded-2xl border border-dashed bg-background px-5 py-12 text-center">
              <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
                <BellRing className="size-6" />
              </div>
              <h2 className="mt-4 text-lg font-black">مفيش تنبيهات جديدة</h2>
              <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-6 text-muted-foreground">
                لما تحفظ عرض في المفضلة ويقرب يخلص، التنبيه هيظهر هنا تلقائيًا.
              </p>
              <a
                href="/"
                className="mt-5 inline-flex h-10 items-center rounded-xl bg-primary px-4 text-xs font-black text-primary-foreground shadow-md shadow-primary/20"
              >
                شوف العروض
              </a>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => {
                const content = (
                  <div
                    className={`flex gap-3 rounded-2xl border p-4 transition-colors hover:border-primary/30 hover:bg-accent/60 ${
                      notification.readAt ? 'bg-background' : 'border-primary/20 bg-primary/[0.04]'
                    }`}
                  >
                    <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                      {notification.type === 'favorite_expiring' ? (
                        <Heart className="size-5 fill-current/10" />
                      ) : (
                        <BellRing className="size-5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h2 className="text-sm font-black text-foreground">{notification.title}</h2>
                          <p className="mt-1 text-xs font-semibold leading-6 text-muted-foreground">
                            {notification.body}
                          </p>
                        </div>
                        {!notification.readAt && (
                          <span className="mt-1 size-2.5 shrink-0 rounded-full bg-primary" aria-label="غير مقروء" />
                        )}
                      </div>
                      <p className="mt-2 flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                        <Clock3 className="size-3" />
                        {formatNotificationDate(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                )

                return (
                  <a
                    key={notification.id}
                    href={notification.href}
                    onClick={() => {
                      if (!notification.readAt) void markRead(notification.id)
                    }}
                    className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-2xl"
                  >
                    {content}
                  </a>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
