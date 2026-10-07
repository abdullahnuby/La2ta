# LA2TA launch checklist

## Supabase

Production project:
- Project ref: `gzrmmpzbbmoakhpgtvrc`
- Region: `eu-west-1`
- API URL: `https://gzrmmpzbbmoakhpgtvrc.supabase.co`

The production schema is already applied. The following La2ta tables are intentionally empty until real business data is entered:

- `public.stores`
- `public.categories`
- `public.offers`

Storage bucket:
- `offer-images` (public)

## Vercel environment variables

Set these for Production, Preview, and Development as appropriate:

```env
SUPABASE_URL=https://gzrmmpzbbmoakhpgtvrc.supabase.co
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

No standalone output configuration is required.

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

Admin credentials are kept server-side and the session is stored in an HttpOnly cookie. Offer images are stored in Supabase Storage instead of the Vercel filesystem. The La2ta tables have RLS enabled and are accessed by the server with the Supabase secret key.
