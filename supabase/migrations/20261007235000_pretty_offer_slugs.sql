-- LA2TA — readable, stable share URLs for offers.
-- Example: /offer/3-شرابات-ب-100-جنيه
-- Existing /o/{id} URLs remain supported and redirect to the readable URL.

alter table public.offers
  add column if not exists slug text;

-- Remove Arabic tatweel/diacritics, keep Arabic + Latin letters/numbers,
-- and normalize separators to hyphens.
with normalized as (
  select
    id,
    case
      when trimmed_base = '' then 'offer-' || id::text
      else left(trimmed_base, 80)
    end as base_slug
  from (
    select
      id,
      trim(
        both '-'
        from regexp_replace(
          regexp_replace(
            lower(coalesce(title, '')),
            '[\u064B-\u065F\u0670\u0640]',
            '',
            'g'
          ),
          '[^a-z0-9\u0600-\u06FF]+',
          '-',
          'g'
        )
      ) as trimmed_base
    from public.offers
  ) prepared
),
ranked as (
  select
    id,
    base_slug,
    row_number() over (
      partition by base_slug
      order by id
    ) as slug_rank
  from normalized
)
update public.offers o
set slug =
  case
    when r.slug_rank = 1 then r.base_slug
    else r.base_slug || '-' || r.slug_rank::text
  end
from ranked r
where o.id = r.id
  and coalesce(trim(o.slug), '') = '';

create unique index if not exists offers_slug_unique_idx
  on public.offers(slug)
  where slug is not null;

create index if not exists offers_slug_lookup_idx
  on public.offers(slug);
