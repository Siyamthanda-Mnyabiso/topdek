import type { Metadata } from 'next'
import { getAllProviderProfiles } from '@/lib/data/providers'
import { ProfessionalsListClient } from './ProfessionalsListClient'

type Props = { searchParams: Promise<{ type?: string }> }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { type } = await searchParams
  const category = type && type !== 'all' ? type.replace(/-/g, ' ') : null

  const title = category ? `${category} on TopDek` : 'Find Professionals — TopDek'
  const description = category
    ? `Browse verified ${category} and book your next experience on TopDek.`
    : 'Browse verified service providers and book your next experience on TopDek.'
  const canonical = type && type !== 'all' ? `/professionals?type=${type}` : '/professionals'

  return {
    title,
    description,
    alternates: { canonical },
  }
}

export default async function ProfessionalsPage({ searchParams }: Props) {
  const { type } = await searchParams
  const professionals = await getAllProviderProfiles()

  return <ProfessionalsListClient professionals={professionals} activeCategory={type ?? 'all'} />
}
