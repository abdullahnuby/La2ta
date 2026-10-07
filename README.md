<div dir="rtl">

# 🔥 لقطة | LA2TA

**لقط أحسن عرض في الأقصر** — منصة محلية لاكتشاف عروض الأنشطة التجارية في الأقصر، وتوصيل العميل للمحل عبر الموقع أو الاتصال أو WhatsApp.

MVP v0.2 — **Mobile First** ✅ | عربي RTL بالكامل | بدون تسجيل ولا سلة ولا دفع

</div>

## ⚙️ Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| UI | Tailwind CSS 4 + shadcn/ui + Framer Motion + خط Cairo |
| DB | Prisma ORM + SQLite (`db/custom.db`) |
| State | TanStack Query + Zustand |

## 🚀 التشغيل (Bun)

```bash
bun install          # تثبيت الحزم
bun run db:generate  # توليد Prisma Client
bun run dev          # التشغيل → http://localhost:3000
```

> **بالـ Node/npm بدلًا من bun:** `npm install` ثم `npx prisma generate` ثم `npm run dev`

قاعدة البيانات **مرفقة وفيها بيانات جاهزة**: 10 تصنيفات + 4 محلات + 18 عرضًا بصور.
للبدء من الصفر:

```bash
bun run db:push      # إعادة إنشاء الجداول
bun run db:seed      # البيانات التجريبية (طيبة + 3 محلات)
```

> لمستخدمي npm: `npx tsx prisma/seed.ts` بدلًا من `bun run db:seed`

## 🔐 لوحة الإدارة

- من الفوتر: **«لوحة التحكم»** أو مباشرة `/#/admin`
- كلمة المرور: `la2ta2024` (عدّلها من `.env` ← `ADMIN_PASSWORD`)
- التبويبات: **نظرة عامة** (إحصائيات + أعلى العروض) / **العروض** (إضافة وتعديل، نشر/إيقاف/مسودة، تمييز بنجمة، رفع صورة، حذف بتأكيد) / **المحلات** (إضافة، إظهار/إخفاء، تعديل، حذف) / **التصنيفات** (ترتيب ↑↓، إظهار/إخفاء، CRUD)

## 📁 الهيكل

```
prisma/schema.prisma     Store / Category / Offer (+ حقول analytics)
prisma/seed.ts           بيانات تجريبية — طيبة Store #1 + 3 محلات demo
src/app/page.tsx         صفحة واحدة SPA — هاش-راوتر: #/ و #/o/{id} و #/admin
src/app/api/             13 مسار API (عام + إداري)
src/components/la2ta/    17 مكوّن واجهة
src/lib/                 types / format / admin-auth / api-client
public/uploads/seed/     صور العروض المولّدة
```

## 🔑 قرارات أساسية (من الـ PRD)

- **اسم المحل مخفي في كروت العروض** — يظهر فقط في صفحة التفاصيل (إثارة الفضول)، والـ API العام لا يُرجع أي بيانات المحل إطلاقًا
- معمارية **Generic**: أي نشاط تجاري = Store + Offers، والتصنيفات مُدارة بالكامل من قاعدة البيانات
- العرض ينتهي تلقائيًا حسب `endAt` (يتحوّل إلى `EXPIRED` بدون تدخل)
- تتبّع مدمج لكل عرض: impressions / views / map / call / whatsapp / shares
- أزرار التواصل روابط خارجية فقط: Google Maps (بالإحداثيات) + `tel:` + `wa.me` — لا خرائط داخلية ولا نظام رسائل

## 📦 قبل الإنتاج (Post-MVP)

- استبدال SQLite بـ **PostgreSQL (Supabase)** — نفس الـ schema تقريبًا بدون تغيير
- جلسات إدارة حقيقية بدل الـ token البسيط
- رفع الصور على تخزين سحابي (Supabase Storage / S3) بدل `public/uploads`
- النشر على **Vercel** مباشرة
