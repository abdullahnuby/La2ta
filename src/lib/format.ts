// LA2TA — client-safe formatting & link helpers (Arabic / Egypt)

/** "100 جنيه" (full) or "100 ج.م" (short — compact cards) */
export function formatPrice(
  value: number | null | undefined,
  unit: 'full' | 'short' = 'full'
): string {
  if (value == null || isNaN(value)) return ''
  const formatted = Number.isInteger(value)
    ? value.toLocaleString('en-US')
    : value.toLocaleString('en-US', { maximumFractionDigits: 2 })
  return `${formatted} ${unit === 'short' ? 'ج.م' : 'جنيه'}`
}

/** "10 أكتوبر" — Arabic month name with latin digits */
export function formatDate(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso
  if (isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat('ar-EG-u-nu-latn', {
    day: 'numeric',
    month: 'long',
  }).format(d)
}

/** "5 نوفمبر، 8:30 م" for admin tables */
export function formatDateTime(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso
  if (isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat('ar-EG-u-nu-latn', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(d)
}

/** Days remaining until end (ceil, at least 0) */
export function daysLeft(endAt: string | Date): number {
  const d = typeof endAt === 'string' ? new Date(endAt) : endAt
  return Math.max(0, Math.ceil((d.getTime() - Date.now()) / 86_400_000))
}

/** Arabic-pluralized remaining time: "يوم واحد" / "يومين" / "5 أيام" / "12 يوم" */
export function remainingText(endAt: string | Date): string {
  const d = daysLeft(endAt)
  if (d <= 0) return 'آخر يوم!'
  if (d === 1) return 'باقي يوم واحد'
  if (d === 2) return 'باقي يومين'
  if (d <= 10) return `باقي ${d} أيام`
  return `باقي ${d} يوم`
}

/** Offer badge text: "خصم 30%" or type label */
export function offerBadge(offer: {
  discountPercentage?: number | null
  offerType?: string
  oldPrice?: number | null
  newPrice?: number | null
}): string {
  if (offer.discountPercentage && offer.discountPercentage > 0) {
    return `خصم ${offer.discountPercentage}%`
  }
  const computed =
    offer.oldPrice && offer.newPrice && offer.newPrice < offer.oldPrice
      ? Math.round((1 - offer.newPrice / offer.oldPrice) * 100)
      : 0
  if (computed > 0) return `خصم ${computed}%`
  switch (offer.offerType) {
    case 'bundle':
      return '🎁 عرض مجمّع'
    case 'bogo':
      return '🎁 اشترِ واحصل'
    case 'clearance':
      return '🏷️ تصفية'
    case 'special':
      return '⚡ سعر خاص'
    case 'service':
      return '🛠️ خدمة بخصم'
    default:
      return '🔥 لقطة'
  }
}

/** Normalize Egyptian phone to international digits: "01001234567" -> "201001234567" */
export function normalizeEgyptPhone(raw: string): string | null {
  const digits = (raw || '').replace(/\D/g, '')
  if (!digits) return null
  if (digits.startsWith('20')) return digits
  if (digits.startsWith('0')) return `2${digits}`
  if (digits.length === 10 && digits.startsWith('1')) return `20${digits}`
  return digits
}

export function waLink(raw: string): string | null {
  const d = normalizeEgyptPhone(raw)
  return d ? `https://wa.me/${d}` : null
}

export function telLink(raw: string): string | null {
  const d = normalizeEgyptPhone(raw)
  return d ? `tel:+${d}` : null
}

export function mapsLink(
  latitude?: number | null,
  longitude?: number | null,
  address?: string
): string | null {
  if (latitude != null && longitude != null) {
    return `https://www.google.com/maps?q=${latitude},${longitude}`
  }
  if (address && address.trim()) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
  }
  return null
}

/** Local datetime for <input type="datetime-local"> from ISO string */
export function toDateTimeLocal(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso
  if (isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
