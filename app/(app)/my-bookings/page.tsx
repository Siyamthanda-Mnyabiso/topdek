import type { Metadata } from 'next'
import { MyBookingsPage } from '@/features/client/pages/MyBookingsPage'

export const metadata: Metadata = {
  title: 'My Bookings — TopDek',
  robots: { index: false, follow: false },
}

export default function MyBookings() {
  return <MyBookingsPage />
}
