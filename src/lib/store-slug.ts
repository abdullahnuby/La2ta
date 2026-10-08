const MAX_STORE_SLUG_LENGTH = 60

export function slugifyStoreName(name: string): string {
  const normalized = name
    .normalize('NFKC')
    .toLocaleLowerCase('ar-EG')
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, MAX_STORE_SLUG_LENGTH)
    .replace(/-+$/g, '')

  return normalized || 'store'
}

export function storePath(id: number, name: string): string {
  return `${id}-${slugifyStoreName(name)}`
}

export function parseStorePath(value: string): number | null {
  const match = value.trim().match(/^(\d+)(?:-|$)/)
  if (!match) return null

  const id = Number(match[1])
  return Number.isSafeInteger(id) && id > 0 ? id : null
}
