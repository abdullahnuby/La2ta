import { dbRequest } from '@/lib/db'

const MAX_SLUG_LENGTH = 80

/**
 * Turn an offer title into a stable, readable Arabic/Latin URL slug.
 * Arabic characters are intentionally preserved for RTL audiences.
 */
export function slugifyOfferTitle(title: string): string {
  const normalized = title
    .normalize('NFKC')
    .toLocaleLowerCase('ar-EG')
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/-+$/g, '')

  return normalized || 'offer'
}

/**
 * Generate a unique human-readable slug.
 * Examples:
 *   3-شرابات-ب-100-جنيه
 *   3-شرابات-ب-100-جنيه-2
 */
export async function createUniqueOfferSlug(
  title: string,
  excludeId?: number
): Promise<string> {
  const base = slugifyOfferTitle(title)

  const rows = await dbRequest<Array<{ slug: string | null }>>(
    'offers',
    {
      query: {
        select: 'slug',
        slug: `like.${base}*`,
        limit: 500,
      },
    }
  )

  const used = new Set(
    (rows ?? [])
      .map((row) => row.slug)
      .filter(
        (slug): slug is string =>
          typeof slug === 'string' && slug.length > 0
      )
  )

  if (excludeId !== undefined) {
    const current = await dbRequest<Array<{ slug: string | null }>>(
      'offers',
      {
        query: {
          select: 'slug',
          id: `eq.${excludeId}`,
          limit: 1,
        },
      }
    )

    const currentSlug = current?.[0]?.slug
    if (currentSlug) used.delete(currentSlug)
  }

  if (!used.has(base)) return base

  let suffix = 2

  while (used.has(`${base}-${suffix}`)) {
    suffix += 1
  }

  return `${base}-${suffix}`
}
