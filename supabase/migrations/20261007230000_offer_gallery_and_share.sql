-- LA2TA — up to 5 images per offer + shareable offer pages.
-- Backward compatible with the existing image_url column.

alter table public.offers
  add column if not exists image_urls jsonb not null default '[]'::jsonb;

-- Migrate legacy single-image offers into the new gallery.
update public.offers
set image_urls = jsonb_build_array(image_url)
where coalesce(trim(image_url), '') <> ''
  and image_urls = '[]'::jsonb;

-- Keep gallery storage bounded at five images.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'offers_image_urls_array_check'
      and conrelid = 'public.offers'::regclass
  ) then
    alter table public.offers
      add constraint offers_image_urls_array_check
      check (
        jsonb_typeof(image_urls) = 'array'
        and jsonb_array_length(image_urls) <= 5
      );
  end if;
end
$$;
