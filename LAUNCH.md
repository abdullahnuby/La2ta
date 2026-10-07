# LA2TA launch checklist

## Supabase

La2ta production project:
- API URL: `https://kkytfnksvqclxxphkqfg.supabase.co`

The La2ta schema must be applied to this project before the first production content is added.
The following tables are intentionally empty until real business data is entered:

- `public.stores`
- `public.categories`
- `public.offers`

Storage bucket:
- `offer-images` (public)

Migration:
- `supabase/migrations/20261007203100_initial_la2ta.sql`

## Vercel environment variables

Set these for Production, Preview, and Development as appropriate:

```env
SUPABASE_URL=https://kkytfnksvqclxxphkqfg.supabase.co
SUPABASE_SECRET_KEY=YOUR_SUPABASE_SECRET_KEY
LA2TA_ADMIN_PASSWORD=YOUR_STRONG_ADMIN_PASSWORD
```

Do not put `SUPABASE_SECRET_KEY` or `LA2TA_ADMIN_PASSWORD` in `NEXT_PUBLIC_*` variables.

## Vercel project

Import the GitHub repository `abdullahnuby/La2ta`.

Recommended settings:

- Framework preset: Next.js
- Root directory: `.`
- Install command: `npm install`
- Build command: `npm run build`
- Node.js: 22

Do not use a custom standalone output configuration.

## First production smoke test

1. Open the public homepage.
2. Open `/#/admin`.
3. Sign in with the configured admin password.
4. Create one real category.
5. Create one real store.
6. Upload one real offer image.
7. Create one real offer with a valid start/end window.
8. Open the offer publicly.
9. Test map, phone, WhatsApp, and share actions.
10. Confirm counters increase in the admin statistics page.
11. Delete the test offer if it is not real production content.

## Security notes

Admin credentials are kept server-side and the session is stored in an HttpOnly cookie. Offer images are stored in Supabase Storage instead of the Vercel filesystem. The La2ta tables have RLS enabled and server routes access them with the Supabase secret key.

The repository contains no production secrets or demo business rows.
