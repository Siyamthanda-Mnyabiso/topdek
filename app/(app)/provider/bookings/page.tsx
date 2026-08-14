import type { Metadata } from 'next'
import { BookingsPage } from '@/features/provider/pages/BookingsPage'

export const metadata: Metadata = {
  title: 'Bookings — TopDek',
  robots: { index: false, follow: false },
}

export default function ProviderBookings() {
  return <BookingsPage />
}
