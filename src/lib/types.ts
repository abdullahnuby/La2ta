// LA2TA — Shared types

export type OfferType =
  | 'discount'
  | 'special'
  | 'bundle'
  | 'bogo'
  | 'clearance'
  | 'service'

export type OfferStatus = 'ACTIVE' | 'DRAFT' | 'PAUSED' | 'EXPIRED'

export const OFFER_TYPE_LABELS: Record<OfferType, string> = {
  discount: 'خصم',
  special: 'سعر خاص',
  bundle: 'عرض مجمّع',
  bogo: 'اشترِ واحصل',
  clearance: 'تصفية',
  service: 'خدمة بخصم',
}

export const OFFER_STATUS_LABELS: Record<OfferStatus, string> = {
  ACTIVE: 'نشط',
  DRAFT: 'مسودة',
  PAUSED: 'متوقف',
  EXPIRED: 'منتهي',
}

/** Category as exposed publicly */
export interface PublicCategory {
  id: number
  name: string
  slug: string
  icon: string
}

export interface Category extends PublicCategory {
  sortOrder: number
  isActive: boolean
}

export interface AdminCategory extends Category {
  offersCount: number
}

/**
 * Offer as exposed in lists — ⚠️ intentionally contains NO store fields.
 * The store is revealed only inside the offer details page (curiosity funnel).
 */
export interface PublicOffer {
  id: number
  title: string
  description: string
  imageUrl: string
  oldPrice: number | null
  newPrice: number | null
  discountPercentage: number | null
  offerType: OfferType
  isFeatured: boolean
  startAt: string
  endAt: string
  category: PublicCategory | null
}

export interface StoreInfo {
  id: number
  name: string
  description: string
  phone: string
  whatsapp: string
  address: string
  latitude: number | null
  longitude: number | null
}

export interface OfferDetails extends PublicOffer {
  views: number
  store: StoreInfo | null
}

/** Admin shapes */
export interface AdminStore extends StoreInfo {
  isActive: boolean
  offersCount?: number
}

export interface AdminOffer extends PublicOffer {
  storeId: number
  storeName: string
  categoryId: number | null
  status: OfferStatus
  impressions: number
  views: number
  mapClicks: number
  callClicks: number
  whatsappClicks: number
  shares: number
}

export interface AdminStats {
  totals: {
    offers: number
    active: number
    stores: number
    categories: number
    impressions: number
    views: number
    mapClicks: number
    callClicks: number
    whatsappClicks: number
    shares: number
  }
  top: Array<{
    id: number
    title: string
    storeName: string
    status: OfferStatus
    views: number
    mapClicks: number
    callClicks: number
    whatsappClicks: number
    shares: number
  }>
}

export interface OfferInput {
  storeId: number
  categoryId?: number | null
  title: string
  description?: string
  imageUrl?: string
  oldPrice?: number | null
  newPrice?: number | null
  offerType?: OfferType
  startAt: string
  endAt: string
  isFeatured?: boolean
  status?: OfferStatus
}

export interface StoreInput {
  name: string
  description?: string
  phone?: string
  whatsapp?: string
  address?: string
  latitude?: number | null
  longitude?: number | null
  isActive?: boolean
}

export interface CategoryInput {
  name: string
  slug?: string
  icon?: string
  sortOrder?: number
  isActive?: boolean
}

export type TrackEvent =
  | 'impression'
  | 'view'
  | 'map'
  | 'call'
  | 'whatsapp'
  | 'share'
