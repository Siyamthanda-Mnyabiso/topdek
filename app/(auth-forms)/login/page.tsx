import type { Metadata } from 'next'
import { Suspense } from 'react'
import { LoginPage } from '@/features/auth/pages/LoginPage'

export const metadata: Metadata = {
  title: 'Log In — TopDek',
  robots: { index: false, follow: false },
}

export default function Login() {
  return (
    <Suspense>
      <LoginPage />
    </Suspense>
  )
}
