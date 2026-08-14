import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { HomePageShell } from '@/features/home/components/HomePageShell'
import { HomeLoggedOutStatic } from '@/features/home/components/HomeLoggedOutStatic'
import { HomeAuthedClient } from '@/features/home/components/HomeAuthedClient'

export const metadata: Metadata = {
  title: 'TopDek — Premium Grooming, Styling & Salon Experiences',
  description:
    'Browse verified barbers, stylists, and beauty professionals. Book in-store or request a call-out — they come to you.',
  alternates: { canonical: '/' },
}

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const isLoggedIn = !!user

  return (
    <HomePageShell isLoggedIn={isLoggedIn}>
      {isLoggedIn ? <HomeAuthedClient /> : <HomeLoggedOutStatic />}
    </HomePageShell>
  )
}
