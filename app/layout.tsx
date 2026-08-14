import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { TourHost } from '@/features/onboarding/components/TourHost'
import { Providers } from '@/components/Providers'
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister'
import { CookieConsent } from '@/components/CookieConsent'
import './globals.css'

export const metadata: Metadata = {
  title: 'TopDek — Service Marketplace',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  manifest: '/site.webmanifest',
  verification: {
    google: '9lp8MTQJTnheKBnSbM-JSg1Rmy0xGcmgOanlp2gMJv0',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="min-h-screen bg-background">
            <Navbar />
            <main>{children}</main>
            <TourHost />
          </div>
          <ServiceWorkerRegister />
          <CookieConsent />
        </Providers>
      </body>
    </html>
  )
}
