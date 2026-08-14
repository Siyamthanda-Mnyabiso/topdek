import type { Metadata } from 'next'
import { ProviderDashboardPage } from '@/features/provider/pages/ProviderDashboardPage'

export const metadata: Metadata = {
  title: 'Provider Dashboard — TopDek',
  robots: { index: false, follow: false },
}

export default function ProviderDashboard() {
  return <ProviderDashboardPage />
}
