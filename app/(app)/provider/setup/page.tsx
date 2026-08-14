import type { Metadata } from 'next'
import { ProviderSetupPage } from '@/features/provider/pages/ProviderSetupPage'

export const metadata: Metadata = {
  title: 'Set Up Your Store — TopDek',
  robots: { index: false, follow: false },
}

export default function ProviderSetup() {
  return <ProviderSetupPage />
}
