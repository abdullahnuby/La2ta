'use client'

import { FormEvent, useState } from 'react'
import {
  CheckCircle2,
  LogIn,
  LogOut,
  Mail,
  ShieldCheck,
  Sparkles,
  UserRound,
  UserPlus,
} from 'lucide-react'
import { toast } from 'sonner'
import BrandLogo from '@/components/la2ta/brand-logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/components/la2ta/auth-provider'

function friendlyAuthError(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : ''

  if (message.includes('invalid login credentials')) {
    return 'البريد الإلكتروني أو كلمة السر مش صح.'
  }
  if (message.includes('email not confirmed')) {
    return 'أكد بريدك الإلكتروني الأول من الرسالة اللي وصلتك.'
  }
  if (message.includes('user already registered')) {
    return 'الإيميل ده مسجل بالفعل — جرّب تسجيل الدخول.'
  }
  if (message.includes('password should be at least')) {
    return 'كلمة السر لازم تكون 6 حروف أو أكتر.'
  }
  if (message.includes('rate limit')) {
    return 'في محاولات كتير دلوقتي، استنى شوية وجرب تاني.'
  }

  return error instanceof Error ? error.message : 'حصل خطأ، جرّب تاني.'
}

export default function AccountPage() {
  const { user, loading, configured, signIn, signUp, signOut } = useAuth()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!configured) {
      toast.error('تسجيل الدخول لسه مش متفعل على الموقع.')
      return
    }

    if (!email.trim() || !password) {
      toast.error('اكتب البريد الإلكتروني وكلمة السر.')
      return
    }

    if (mode === 'signup' && fullName.trim().length < 2) {
      toast.error('اكتب اسمك علشان نكمل.')
      return
    }

    setSubmitting(true)

    try {
      if (mode === 'signup') {
        const result = await signUp(email, password, fullName)
        if (result.needsEmailConfirmation) {
          toast.success(
            'تم إنشاء حسابك — راجع بريدك الإلكتروني لتأكيد الحساب.'
          )
        } else {
          toast.success('تمام! حسابك اتعمل بنجاح 👌')
        }
      } else {
        await signIn(email, password)
        toast.success('أهلاً بيك في لقطة 🔥')
      }
    } catch (error) {
      toast.error(friendlyAuthError(error))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main className="mx-auto flex min-h-[65vh] w-full max-w-3xl items-center justify-center px-4 py-12">
        <div className="text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Sparkles className="size-7 animate-pulse" />
          </div>
          <p className="mt-4 text-sm font-bold text-muted-foreground">
            بنجهز حسابك...
          </p>
        </div>
      </main>
    )
  }

  if (user) {
    const fullNameValue =
      typeof user.user_metadata?.full_name === 'string'
        ? user.user_metadata.full_name.trim()
        : ''

    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
        <section className="overflow-hidden rounded-[2rem] border bg-card shadow-xl shadow-primary/5">
          <div className="bg-[linear-gradient(135deg,#fff7ed_0%,#ffedd5_55%,#fed7aa_100%)] px-5 py-8 sm:px-8">
            <div className="flex items-center gap-4">
              <BrandLogo size="lg" />
              <div>
                <p className="text-sm font-bold text-primary">حساب لقطة</p>
                <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">
                  {fullNameValue || 'أهلاً بيك 👋'}
                </h1>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                  <Mail className="size-4" />
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-8">
            <div className="rounded-2xl border bg-background p-4">
              <div className="flex items-center gap-2 text-sm font-black text-foreground">
                <ShieldCheck className="size-4 text-primary" />
                حسابك اختياري
              </div>
              <p className="mt-2 text-xs font-semibold leading-6 text-muted-foreground">
                تقدر تتصفح كل العروض حتى من غير تسجيل. الحساب بيتجهز لك علشان الخدمات الشخصية زي المفضلة والإشعارات.
              </p>
            </div>

            <div className="rounded-2xl border bg-background p-4">
              <div className="flex items-center gap-2 text-sm font-black text-foreground">
                <CheckCircle2 className="size-4 text-primary" />
                جاهز للمرحلة الجاية
              </div>
              <p className="mt-2 text-xs font-semibold leading-6 text-muted-foreground">
                نفس الحساب هيكون مدخل المفضلة والتنبيهات وحفظ العروض اللي عجبتك.
              </p>
            </div>
          </div>

          <div className="border-t p-5 sm:p-8">
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full rounded-xl font-black"
              onClick={async () => {
                setSubmitting(true)
                try {
                  await signOut()
                  toast.success('تم تسجيل الخروج.')
                } catch (error) {
                  toast.error(friendlyAuthError(error))
                } finally {
                  setSubmitting(false)
                }
              }}
              disabled={submitting}
            >
              <LogOut className="size-4" />
              تسجيل الخروج
            </Button>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-7 sm:px-6 lg:px-8 lg:py-10">
      <section className="grid overflow-hidden rounded-[2rem] border bg-card shadow-xl shadow-primary/5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative hidden min-h-[520px] overflow-hidden bg-[linear-gradient(145deg,#fff7ed_0%,#ffedd5_55%,#fed7aa_100%)] p-8 lg:flex lg:flex-col lg:justify-between">
          <div>
            <BrandLogo size="xl" />
            <p className="mt-6 text-sm font-black text-primary">عروضك أقرب لك</p>
            <h1 className="mt-2 max-w-md text-4xl font-black leading-tight text-slate-950">
              حسابك في لقطة
              <span className="block text-primary">اختياري وبسيط 🔥</span>
            </h1>
            <p className="mt-4 max-w-md text-sm font-semibold leading-7 text-slate-700">
              تصفح العروض براحتك، ولما تحب اعمل حساب علشان نكمل لك تجربة المفضلة والتنبيهات.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/70 p-4 shadow-lg backdrop-blur">
            <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Sparkles className="size-5" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900">من غير تعقيد</p>
              <p className="mt-0.5 text-xs font-semibold text-slate-600">
                سجل في دقائق وكمل تصفحك عادي.
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-8 lg:p-10">
          <div className="flex items-center gap-3 lg:hidden">
            <BrandLogo size="md" />
            <div>
              <p className="text-xs font-black text-primary">عروضك أقرب لك</p>
              <h1 className="text-2xl font-black">حسابك في لقطة 🔥</h1>
            </div>
          </div>

          <div className="mt-7">
            <div className="grid grid-cols-2 rounded-2xl bg-muted p-1">
              <button
                type="button"
                onClick={() => setMode('signin')}
                className={
                  mode === 'signin'
                    ? 'rounded-xl bg-card px-3 py-2.5 text-sm font-black text-foreground shadow-sm'
                    : 'rounded-xl px-3 py-2.5 text-sm font-black text-muted-foreground'
                }
              >
                دخول
              </button>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={
                  mode === 'signup'
                    ? 'rounded-xl bg-card px-3 py-2.5 text-sm font-black text-foreground shadow-sm'
                    : 'rounded-xl px-3 py-2.5 text-sm font-black text-muted-foreground'
                }
              >
                حساب جديد
              </button>
            </div>

            <div className="mt-6">
              <h2 className="text-xl font-black">
                {mode === 'signin' ? 'أهلاً بيك تاني 👋' : 'يلا نعمل حسابك'}
              </h2>
              <p className="mt-1 text-xs font-semibold leading-6 text-muted-foreground">
                {mode === 'signin'
                  ? 'سجل دخولك وكمل من حيث ما وقفت.'
                  : 'الحساب اختياري — وفتح الحساب بياخد دقيقة.'}
              </p>
            </div>

            <form onSubmit={submit} className="mt-6 space-y-4">
              {mode === 'signup' && (
                <label className="block space-y-2">
                  <span className="text-xs font-black">الاسم</span>
                  <div className="relative">
                    <UserRound className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="اسمك"
                      autoComplete="name"
                      className="h-11 rounded-xl ps-10 font-semibold"
                    />
                  </div>
                </label>
              )}

              <label className="block space-y-2">
                <span className="text-xs font-black">البريد الإلكتروني</span>
                <div className="relative">
                  <Mail className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    dir="ltr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    autoComplete="email"
                    className="h-11 rounded-xl ps-10 font-semibold"
                  />
                </div>
              </label>

              <label className="block space-y-2">
                <span className="text-xs font-black">كلمة السر</span>
                <Input
                  type="password"
                  dir="ltr"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={
                    mode === 'signin' ? 'current-password' : 'new-password'
                  }
                  minLength={6}
                  className="h-11 rounded-xl font-semibold"
                />
              </label>

              {!configured && (
                <div className="rounded-2xl border border-amber-300/50 bg-amber-50 px-3 py-2.5 text-xs font-bold leading-6 text-amber-900">
                  الواجهة جاهزة، لكن تفعيل تسجيل الدخول محتاج إضافة الـ public anon/publishable key لمشروع Supabase في Environment Variables.
                </div>
              )}

              <Button
                type="submit"
                disabled={submitting || !configured}
                className="h-12 w-full rounded-xl font-black shadow-lg shadow-primary/20"
              >
                {mode === 'signin' ? (
                  <LogIn className="size-4" />
                ) : (
                  <UserPlus className="size-4" />
                )}
                {submitting
                  ? 'ثواني...'
                  : mode === 'signin'
                    ? 'تسجيل الدخول'
                    : 'إنشاء الحساب'}
              </Button>
            </form>

            <p className="mt-5 text-center text-[11px] font-semibold leading-5 text-muted-foreground">
              التصفح مجاني ومتاح من غير حساب. الحساب معمول للميزات الشخصية بس.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
