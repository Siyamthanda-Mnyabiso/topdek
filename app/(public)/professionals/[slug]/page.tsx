import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { QueryClient, dehydrate, HydrationBoundary } from '@tanstack/react-query'
import {
  getProviderProfileBySlug,
  getProviderProfileById,
  getActiveServicesForProvider,
} from '@/lib/data/providers'
import { buildProviderJsonLd } from '@/lib/seo/provider-json-ld'
import { ProviderPublicProfileClient } from './ProviderPublicProfileClient'
import type { ProviderProfile } from '@/types/database'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ slug: string }> }

async function resolveProfile(slugParam: string): Promise<ProviderProfile | null> {
  const bySlug = await getProviderProfileBySlug(slugParam)
  if (bySlug) return bySlug
  return getProviderProfileById(slugParam)
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  return `${text.slice(0, max - 1).trimEnd()}…`
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const profile = await resolveProfile(slug)

  if (!profile) {
    return { title: 'Provider not found | TopDek' }
  }

  const canonical = `/professionals/${profile.slug}`
  const description = profile.description
    ? truncate(profile.description, 155)
    : `Book ${profile.business_name}${profile.location ? ` in ${profile.location}` : ''} on TopDek.`
  const image = profile.cover_image_url ?? profile.logo_url ?? undefined

  return {
    title: `${profile.business_name} — Book on TopDek`,
    description,
    alternates: { canonical },
    openGraph: {
      title: profile.business_name,
      description,
      url: canonical,
      siteName: 'TopDek',
      type: 'profile',
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: profile.business_name,
      description,
      images: image ? [image] : undefined,
    },
  }
}

export default async function ProviderProfilePage({ params }: Props) {
  const { slug: slugParam } = await params

  const provider = await getProviderProfileBySlug(slugParam)

  if (!provider) {
    const byId = await getProviderProfileById(slugParam)
    if (byId) permanentRedirect(`/professionals/${byId.slug}`)
    notFound()
  }

  const queryClient = new QueryClient()
  await queryClient.prefetchQuery({
    queryKey: ['provider-profile', provider.slug],
    queryFn: async () => provider,
  })
  await queryClient.prefetchQuery({
    queryKey: ['provider-services', provider.id],
    queryFn: () => getActiveServicesForProvider(provider.id),
  })

  const canonical = `/professionals/${provider.slug}`
  const jsonLd = buildProviderJsonLd(provider, canonical)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ProviderPublicProfileClient slug={provider.slug} />
      </HydrationBoundary>
    </>
  )
}
