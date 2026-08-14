import type { Metadata } from 'next'
import { SettingsPage } from '@/features/settings/pages/SettingsPage'

export const metadata: Metadata = {
  title: 'Settings — TopDek',
  robots: { index: false, follow: false },
}

export default function Settings() {
  return <SettingsPage />
}
