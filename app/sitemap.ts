import type { MetadataRoute } from 'next'
import { getAllProviderProfiles } from '@/lib/data/providers'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://topdek.co.za'

const STATIC_PAGES = [
  { path: '/', priority: 1, changeFrequency: 'daily' as const },
  { path: '/professionals', priority: 0.9, changeFrequency: 'daily' as const },
  { path: '/how-it-works', priority: 0.5, changeFrequency: 'monthly' as const },
  { path: '/call-outs', priority: 0.5, changeFrequency: 'monthly' as const },
  { path: '/for-professionals', priority: 0.5, changeFrequency: 'monthly' as const },
  { path: '/help', priority: 0.3, changeFrequency: 'monthly' as const },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const providers = await getAllProviderProfiles()

  const staticEntries: MetadataRoute.Sitemap = STATIC_PAGES.map(({ path, priority, changeFrequency }) => ({
    url: `${BASE_URL}${path}`,
    changeFrequency,
    priority,
  }))

  const providerEntries: MetadataRoute.Sitemap = providers.map((provider) => ({
    url: `${BASE_URL}/professionals/${provider.slug}`,
    lastModified: provider.updated_at,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [...staticEntries, ...providerEntries]
}
