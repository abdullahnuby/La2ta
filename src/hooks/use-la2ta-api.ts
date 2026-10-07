'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { adminApi, api, useAdminStore } from '@/lib/api-client'
import type {
  AdminOffer,
  AdminStats,
  AdminStore,
  Category,
  CategoryInput,
  OfferDetails,
  OfferInput,
  PublicOffer,
  StoreInput,
} from '@/lib/types'

/* ------------------------------------------------------------------ */
/* Public data                                                         */
/* ------------------------------------------------------------------ */

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => api<{ categories: Category[] }>('/api/categories'),
    staleTime: 60_000,
  })
}

export interface OffersParams {
  q?: string
  cat?: string
}

export function useOffers(params: OffersParams = {}, enabled = true) {
  return useQuery({
    queryKey: ['offers', params],
    queryFn: () => {
      const search = new URLSearchParams()
      if (params.q) search.set('q', params.q)
      if (params.cat) search.set('cat', params.cat)
      const qs = search.toString()
      return api<{ offers: PublicOffer[] }>(`/api/offers${qs ? `?${qs}` : ''}`)
    },
    staleTime: 30_000,
    enabled,
  })
}

export function useOffer(id: number | null) {
  return useQuery({
    queryKey: ['offer', id],
    queryFn: () => api<{ offer: OfferDetails }>(`/api/offers/${id}`),
    enabled: id != null,
    retry: false,
  })
}

/* ------------------------------------------------------------------ */
/* Admin data                                                          */
/* ------------------------------------------------------------------ */

function useAdmin() {
  const token = useAdminStore((s) => s.token)
  return token
}

export function useAdminStats() {
  const token = useAdmin()
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => adminApi<AdminStats>('/api/admin/stats', token),
    enabled: !!token,
  })
}

export function useAdminOffers() {
  const token = useAdmin()
  return useQuery({
    queryKey: ['admin', 'offers'],
    queryFn: () => adminApi<{ offers: AdminOffer[] }>('/api/admin/offers', token),
    enabled: !!token,
  })
}

export function useAdminStores() {
  const token = useAdmin()
  return useQuery({
    queryKey: ['admin', 'stores'],
    queryFn: () => adminApi<{ stores: AdminStore[] }>('/api/admin/stores', token),
    enabled: !!token,
  })
}

export interface AdminCategory extends Category {
  offersCount: number
}

export function useAdminCategories() {
  const token = useAdmin()
  return useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () =>
      adminApi<{ categories: AdminCategory[] }>('/api/admin/categories', token),
    enabled: !!token,
  })
}

/* ------------------------------------------------------------------ */
/* Admin mutations                                                     */
/* ------------------------------------------------------------------ */

function useInvalidate() {
  const qc = useQueryClient()
  return (keys: string[]) =>
    keys.forEach((k) => qc.invalidateQueries({ queryKey: [k] }))
}

export function useSaveOffer() {
  const token = useAdmin()
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: async (input: OfferInput & { id?: number }) => {
      const { id, ...body } = input
      return id
        ? adminApi<{ offer: AdminOffer }>(`/api/admin/offers/${id}`, token, {
            method: 'PATCH',
            body: JSON.stringify(body),
          })
        : adminApi<{ offer: AdminOffer }>('/api/admin/offers', token, {
            method: 'POST',
            body: JSON.stringify(body),
          })
    },
    onSuccess: () => invalidate(['admin', 'offers', 'offers', 'admin']),
  })
}

export function useUpdateOffer() {
  const token = useAdmin()
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: async ({
      id,
      ...body
    }: {
      id: number
    } & Partial<OfferInput>) =>
      adminApi<{ offer: AdminOffer }>(`/api/admin/offers/${id}`, token, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    onSuccess: () => invalidate(['admin', 'offers', 'stats']),
  })
}

export function useDeleteOffer() {
  const token = useAdmin()
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (id: number) =>
      adminApi<{ ok: boolean }>(`/api/admin/offers/${id}`, token, {
        method: 'DELETE',
      }),
    onSuccess: () => invalidate(['admin', 'offers', 'stats']),
  })
}

export function useSaveStore() {
  const token = useAdmin()
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: async (input: StoreInput & { id?: number }) => {
      const { id, ...body } = input
      return id
        ? adminApi<{ store: AdminStore }>(`/api/admin/stores/${id}`, token, {
            method: 'PATCH',
            body: JSON.stringify(body),
          })
        : adminApi<{ store: AdminStore }>('/api/admin/stores', token, {
            method: 'POST',
            body: JSON.stringify(body),
          })
    },
    onSuccess: () => invalidate(['admin', 'stores', 'admin']),
  })
}

export function useUpdateStore() {
  const token = useAdmin()
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: async ({ id, ...body }: { id: number } & Partial<StoreInput>) =>
      adminApi<{ store: AdminStore }>(`/api/admin/stores/${id}`, token, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    onSuccess: () => invalidate(['admin', 'stores', 'stats']),
  })
}

export function useDeleteStore() {
  const token = useAdmin()
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (id: number) =>
      adminApi<{ ok: boolean }>(`/api/admin/stores/${id}`, token, {
        method: 'DELETE',
      }),
    onSuccess: () => invalidate(['admin', 'stores', 'offers', 'stats', 'admin']),
  })
}

export function useSaveCategory() {
  const token = useAdmin()
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: async (input: CategoryInput & { id?: number }) => {
      const { id, ...body } = input
      return id
        ? adminApi<{ category: AdminCategory }>(
            `/api/admin/categories/${id}`,
            token,
            { method: 'PATCH', body: JSON.stringify(body) }
          )
        : adminApi<{ category: AdminCategory }>('/api/admin/categories', token, {
            method: 'POST',
            body: JSON.stringify(body),
          })
    },
    onSuccess: () => invalidate(['admin', 'categories', 'categories', 'admin']),
  })
}

export function useDeleteCategory() {
  const token = useAdmin()
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (id: number) =>
      adminApi<{ ok: boolean }>(`/api/admin/categories/${id}`, token, {
        method: 'DELETE',
      }),
    onSuccess: () =>
      invalidate(['admin', 'categories', 'categories', 'offers', 'admin']),
  })
}

export async function uploadImage(file: File, token: string | null) {
  const fd = new FormData()
  fd.append('file', file)
  const res = await fetch('/api/admin/upload', {
    method: 'POST',
    headers: token ? { 'x-admin-token': token } : {},
    body: fd,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || 'رفع الصورة فشل')
  }
  return (await res.json()) as { url: string }
}
