/**
 * LA2TA no longer uses Prisma for application data.
 *
 * The production application uses Supabase, and database initialization
 * is handled by Supabase migrations under `supabase/migrations/`.
 *
 * This file intentionally contains no Prisma imports so legacy tracked
 * Prisma files cannot break the TypeScript build while the repository
 * is being cleaned up.
 */
export {}
