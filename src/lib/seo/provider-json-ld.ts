import type { ProviderProfile } from '@/types/database'
import { toWhatsAppLink, withScheme } from '@/lib/social-links'

export function buildProviderJsonLd(profile: ProviderProfile, canonicalUrl: string) {
  const sameAs = [
    profile.instagram_url && withScheme(profile.instagram_url),
    profile.facebook_url && withScheme(profile.facebook_url),
    profile.tiktok_url && withScheme(profile.tiktok_url),
    profile.twitter_url && withScheme(profile.twitter_url),
    profile.website_url && withScheme(profile.website_url),
    profile.whatsapp_number && toWhatsAppLink(profile.whatsapp_number),
  ].filter((url): url is string => !!url)

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: profile.business_name,
    description: profile.description ?? undefined,
    image: profile.cover_image_url ?? profile.logo_url ?? undefined,
    url: canonicalUrl,
    ...(profile.location ? { areaServed: profile.location } : {}),
    ...(sameAs.length > 0 ? { sameAs } : {}),
  }
}
