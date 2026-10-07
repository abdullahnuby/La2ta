<div dir="rtl">

# 🔥 لقطة | LA2TA

**لقط أحسن عرض في الأقصر** — منصة محلية لاكتشاف العروض والخصومات، وتوصيل العميل للمحل عبر الموقع أو الاتصال أو WhatsApp.

الإصدار الحالي مُجهّز للإنتاج: Next.js + Supabase Postgres + Supabase Storage + Vercel.

</div>

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 App Router + React 19 + TypeScript |
| UI | Tailwind CSS 4 + shadcn/ui + Framer Motion + Cairo |
| Database | Supabase Postgres |
| Storage | Supabase Storage (`offer-images`) |
| State | TanStack Query + Zustand |
| Hosting | Vercel |

## تشغيل محلي

```bash
npm install
npm run dev
```

متغيرات البيئة المطلوبة موجودة في `.env.example`.

## Supabase

نفّذ الملف:

```text
supabase/migrations/20261007203100_initial_la2ta.sql
```

الملف ينشئ جداول `stores` و`categories` و`offers`، الفهارس، تحديث `updated_at` تلقائيًا، وBucket الصور `offer-images`.

**مهم:** قاعدة الإنتاج تبدأ بدون بيانات تجريبية حتى لا يتم نشر أسماء وأرقام وهمية للعامة. أضف البيانات الحقيقية من لوحة التحكم.

## Environment Variables

```env
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SECRET_KEY=sb_secret_...
LA2TA_ADMIN_PASSWORD=ضع-كلمة-مرور-قوية-هنا
```

`SUPABASE_SECRET_KEY` و`LA2TA_ADMIN_PASSWORD` أسرار server-only ولا يتم وضعهما في `NEXT_PUBLIC_*`.

## لوحة الإدارة

افتح:

```text
/#/admin
```

جلسة الإدارة محفوظة في **HttpOnly Secure cookie** لمدة 7 أيام، ولا يتم تخزين كلمة المرور أو token الإدارة في `localStorage`.

## الصور

رفع الصور من لوحة التحكم يتم إلى Supabase Storage بدل الكتابة على filesystem؛ وهذا يجعل الرفع متوافقًا مع بيئة Vercel serverless.

## الإنتاج

```bash
npm run lint
npm run typecheck
npm run build
```

Vercel يجب أن يكون:

```text
Framework: Next.js
Build Command: npm run build
Install Command: npm install
Root Directory: .
```
