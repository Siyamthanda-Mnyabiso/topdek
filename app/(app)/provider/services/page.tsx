import type { Metadata } from 'next'
import { ServicesPage } from '@/features/provider/pages/ServicesPage'

export const metadata: Metadata = {
  title: 'Manage Services — TopDek',
  robots: { index: false, follow: false },
}

export default function ProviderServices() {
  return <ServicesPage />
}
