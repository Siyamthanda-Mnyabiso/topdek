import type { Metadata } from 'next'
import { StoreSettingsPage } from '@/features/provider/pages/StoreSettingsPage'

export const metadata: Metadata = {
  title: 'Store Settings — TopDek',
  robots: { index: false, follow: false },
}

export default function ProviderStore() {
  return <StoreSettingsPage />
}
