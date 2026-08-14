import type { Metadata } from 'next'
import { AvailabilityPage } from '@/features/provider/pages/AvailabilityPage'

export const metadata: Metadata = {
  title: 'Availability — TopDek',
  robots: { index: false, follow: false },
}

export default function ProviderAvailability() {
  return <AvailabilityPage />
}
