'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { PublicOffer } from '@/lib/types'
import { useAuth } from '@/components/la2ta/auth-provider'

interface FavoritesContextValue {
  favoriteOfferIds: number[]
  favoriteOffers: PublicOffer[]
  loading: boolean
  isFavorite: (offerId: number) => boolean
  toggleFavorite: (offerId: number) => Promise<void>
  refresh: () => Promise<void>
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null)

async function readResponse(response: Response) {
  const body = await response.json().catch(() => ({})) as { error?: string }
  if (!response.ok) throw new Error(body.error || 'تعذر تحديث المفضلة.')
  return body
}

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { session, user } = useAuth()
  const [favoriteOfferIds, setFavoriteOfferIds] = useState<number[]>([])
  const [favoriteOffers, setFavoriteOffers] = useState<PublicOffer[]>([])
  const [loading, setLoading] = useState(Boolean(user))

  const refresh = useCallback(async () => {
    if (!session?.access_token) {
      setFavoriteOfferIds([])
      setFavoriteOffers([])
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/favorites', {
        headers: { Authorization: `Bearer ${session.access_token}` },
        cache: 'no-store',
      })
      const body = await readResponse(response) as {
        favoriteOfferIds?: number[]
        offers?: PublicOffer[]
      }
      setFavoriteOfferIds(body.favoriteOfferIds ?? [])
      setFavoriteOffers(body.offers ?? [])
    } catch {
      setFavoriteOfferIds([])
      setFavoriteOffers([])
    } finally {
      setLoading(false)
    }
  }, [session?.access_token])

  useEffect(() => { void refresh() }, [refresh])

  const toggleFavorite = useCallback(async (offerId: number) => {
    if (!session?.access_token) throw new Error('AUTH_REQUIRED')

    const wasFavorite = favoriteOfferIds.includes(offerId)
    const previousIds = favoriteOfferIds
    setFavoriteOfferIds(
      wasFavorite ? previousIds.filter((id) => id !== offerId) : [...previousIds, offerId]
    )

    try {
      const response = await fetch('/api/favorites', {
        method: wasFavorite ? 'DELETE' : 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ offerId }),
      })
      await readResponse(response)
      await refresh()
    } catch (error) {
      setFavoriteOfferIds(previousIds)
      throw error
    }
  }, [favoriteOfferIds, refresh, session?.access_token])

  const value = useMemo<FavoritesContextValue>(() => ({
    favoriteOfferIds,
    favoriteOffers,
    loading,
    isFavorite: (offerId) => favoriteOfferIds.includes(offerId),
    toggleFavorite,
    refresh,
  }), [favoriteOfferIds, favoriteOffers, loading, refresh, toggleFavorite])

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
}

export function useFavorites() {
  const value = useContext(FavoritesContext)
  if (!value) throw new Error('useFavorites must be used inside FavoritesProvider')
  return value
}
