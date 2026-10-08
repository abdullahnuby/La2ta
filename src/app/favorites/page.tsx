import type { Metadata } from 'next'
import FavoritesPage from '@/components/la2ta/favorites-page'

export const metadata: Metadata = {
  title: 'العروض المفضلة | لقطة',
  description: 'العروض اللي حفظتها في لقطة.',
}

export default function FavoritesRoute() {
  return <FavoritesPage />
}
