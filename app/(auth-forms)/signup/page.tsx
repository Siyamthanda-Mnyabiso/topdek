import type { Metadata } from 'next'
import { Suspense } from 'react'
import { SignupPage } from '@/features/auth/pages/SignupPage'

export const metadata: Metadata = {
  title: 'Sign Up — TopDek',
  robots: { index: false, follow: false },
}

export default function Signup() {
  return (
    <Suspense>
      <SignupPage />
    </Suspense>
  )
}
