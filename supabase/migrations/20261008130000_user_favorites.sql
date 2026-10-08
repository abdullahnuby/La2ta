-- LA2TA — optional signed-in user favorites.
-- Users can browse without an account; favorites belong to authenticated users only.

create table if not exists public.user_favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  offer_id integer not null references public.offers(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, offer_id)
);

create index if not exists user_favorites_user_created_idx
  on public.user_favorites(user_id, created_at desc);

alter table public.user_favorites enable row level security;

drop policy if exists user_favorites_select_own on public.user_favorites;
drop policy if exists user_favorites_insert_own on public.user_favorites;
drop policy if exists user_favorites_delete_own on public.user_favorites;

create policy user_favorites_select_own
  on public.user_favorites
  for select
  using (auth.uid() = user_id);

create policy user_favorites_insert_own
  on public.user_favorites
  for insert
  with check (auth.uid() = user_id);

create policy user_favorites_delete_own
  on public.user_favorites
  for delete
  using (auth.uid() = user_id);
