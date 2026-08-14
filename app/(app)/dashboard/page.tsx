import type { Metadata } from 'next'
import { ClientDashboardPage } from '@/features/client/pages/ClientDashboardPage'

export const metadata: Metadata = {
  title: 'Dashboard — TopDek',
  robots: { index: false, follow: false },
}

export default function Dashboard() {
  return <ClientDashboardPage />
}
