import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type { ProviderProfile, Service } from '@/types/database'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const getProviderProfileBySlug = cache(
  async (slug: string): Promise<ProviderProfile | null> => {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('provider_profiles')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()
    if (error) throw error
    return data
  },
)

/** Only ever matches legacy /professionals/{uuid} links — see the redirect
 * in app/(public)/professionals/[slug]/page.tsx. */
export const getProviderProfileById = cache(
  async (id: string): Promise<ProviderProfile | null> => {
    if (!UUID_RE.test(id)) return null
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('provider_profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (error) throw error
    return data
  },
)

export const getActiveServicesForProvider = cache(
  async (providerId: string): Promise<Service[]> => {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('provider_id', providerId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data ?? []
  },
)

export const getAllProviderProfiles = cache(async (): Promise<ProviderProfile[]> => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('provider_profiles')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
})
