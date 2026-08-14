import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://topdek.co.za'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/professionals', '/how-it-works', '/call-outs', '/for-professionals', '/help'],
      disallow: ['/dashboard', '/provider', '/my-bookings', '/settings', '/login', '/signup', '/reset-password'],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
