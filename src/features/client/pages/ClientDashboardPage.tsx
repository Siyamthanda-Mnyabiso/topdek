import { useState } from 'react'
import { Building2, Heart, Search, X } from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

interface ProviderProfile {
  id: string
  user_id: string
  business_name: string
  description: string | null
  location: string | null
  logo_url: string | null
  cover_image_url: string | null
}

interface SavedProvider {
  id: string
  provider_id: string
  provider_profiles: ProviderProfile | ProviderProfile[]
}

function getProviderProfile(saved: SavedProvider): ProviderProfile {
  return Array.isArray(saved.provider_profiles)
      ? saved.provider_profiles[0]
      : saved.provider_profiles
}

export function ClientDashboardPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')

  // Check if user has a provider store
  const { data: providerProfile } = useQuery({
    queryKey: ['provider-profile-check', profile?.id],
    queryFn: async () => {
      if (!profile) return null
      const { data } = await supabase
          .from('provider_profiles')
          .select('*')
          .eq('user_id', profile.id)
          .maybeSingle()
      return data
    },
    enabled: !!profile,
  })

  // Fetch saved providers
  const { data: savedProviders = [], isLoading: savedLoading } = useQuery<SavedProvider[]>({
    queryKey: ['saved-providers', profile?.id],
    queryFn: async () => {
      if (!profile) return []
      const { data, error } = await supabase
          .from('saved_providers')
          .select('id, provider_id, provider_profiles(*)')
          .eq('client_id', profile.id)
          .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as unknown as SavedProvider[]
    },
    enabled: !!profile,
  })

  // Fetch all providers for browse
  const { data: allProviders = [], isLoading: browsLoading } = useQuery<ProviderProfile[]>({
    queryKey: ['all-providers'],
    queryFn: async () => {
      const { data, error } = await supabase
          .from('provider_profiles')
          .select('*')
          .order('created_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
  })

  // Remove saved provider
  const unsave = useMutation({
    mutationFn: async (savedId: string) => {
      const { error } = await supabase
          .from('saved_providers')
          .delete()
          .eq('id', savedId)
      if (error) throw error
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['saved-providers'] })
    },
  })

  // Save a provider
  const save = useMutation({
    mutationFn: async (providerId: string) => {
      if (!profile) return
      const { error } = await supabase
          .from('saved_providers')
          .insert({ client_id: profile.id, provider_id: providerId })
      if (error) throw error
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['saved-providers'] })
    },
  })

  const savedProviderIds = savedProviders.map((s) => s.provider_id)

  const filteredProviders = allProviders.filter(
      (p) =>
          search === '' ||
          p.business_name.toLowerCase().includes(search.toLowerCase()) ||
          p.location?.toLowerCase().includes(search.toLowerCase()),
  )

  return (
      <div className="min-h-screen bg-white">

        {/* HEADER */}
        <div className="border-b border-black px-6 md:px-12 lg:px-20 py-12">
          <p className="text-xs font-semibold tracking-[0.3em] uppercase text-black/40">TOPDEK</p>
          <h1 className="mt-2 text-4xl md:text-6xl font-black uppercase tracking-tight">
            DASHBOARD
          </h1>
          <p className="mt-3 text-sm text-black/50">
            Welcome back{profile ? `, ${profile.email}` : ''}.
          </p>
        </div>

        <div className="px-6 md:px-12 lg:px-20 py-12 space-y-16">

          {/* YOUR STORE */}
          <section>
            <div className="flex items-end justify-between border-b border-black pb-4 mb-8">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5" />
                <h2 className="text-2xl font-black uppercase tracking-tight">YOUR STORE</h2>
              </div>
            </div>

            {providerProfile ? (
                <div className="border border-black p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-black uppercase tracking-tight text-lg">
                      {providerProfile.business_name}
                    </h3>
                    {providerProfile.location && (
                        <p className="text-xs text-black/40 uppercase tracking-widest mt-1">
                          {providerProfile.location}
                        </p>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <Link
                        to="/provider/store"
                        className="border border-black px-5 py-2.5 text-xs font-bold tracking-[0.15em] uppercase transition-colors hover:bg-black hover:text-white"
                    >
                      EDIT STORE
                    </Link>
                    <Link
                        to="/provider/services"
                        className="border border-black bg-black text-white px-5 py-2.5 text-xs font-bold tracking-[0.15em] uppercase transition-colors hover:bg-white hover:text-black"
                    >
                      MANAGE SERVICES
                    </Link>
                  </div>
                </div>
            ) : (
                <div className="border border-dashed border-black/20 p-10 text-center">
                  <p className="text-xs font-semibold tracking-[0.2em] uppercase text-black/30">
                    YOU DON'T HAVE A STORE YET
                  </p>
                  <p className="mt-2 text-sm text-black/40">
                    Create your store to start offering services on the marketplace.
                  </p>
                  <Link
                      to="/provider/setup"
                      className="mt-6 inline-block border border-black bg-black px-6 py-3 text-xs font-bold tracking-[0.15em] uppercase text-white transition-colors hover:bg-white hover:text-black"
                  >
                    CREATE STORE
                  </Link>
                </div>
            )}
          </section>

          {/* SAVED PROVIDERS */}
          <section>
            <div className="flex items-end justify-between border-b border-black pb-4 mb-8">
              <div className="flex items-center gap-3">
                <Heart className="h-5 w-5" />
                <h2 className="text-2xl font-black uppercase tracking-tight">SAVED PROVIDERS</h2>
              </div>
              {savedProviders.length > 0 && (
                  <span className="text-xs font-semibold tracking-[0.2em] uppercase text-black/40">
                {savedProviders.length} SAVED
              </span>
              )}
            </div>

            {savedLoading ? (
                <p className="text-xs font-semibold tracking-[0.2em] uppercase text-black/40">
                  LOADING...
                </p>
            ) : savedProviders.length === 0 ? (
                <div className="border border-dashed border-black/20 p-10 text-center">
                  <p className="text-xs font-semibold tracking-[0.2em] uppercase text-black/30">
                    NO SAVED PROVIDERS YET
                  </p>
                  <p className="mt-2 text-sm text-black/40">
                    Browse providers below and save your favourites.
                  </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedProviders.map((saved) => {
                    const savedProfile = getProviderProfile(saved)
                    return (
                        <div key={saved.id} className="group border border-black relative">
                          <button
                              onClick={() => unsave.mutate(saved.id)}
                              className="absolute top-3 right-3 z-10 border border-black/20 bg-white p-1.5 hover:border-red-500 hover:bg-red-500 hover:text-white transition-colors"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                          <div
                              onClick={() => navigate(`/professionals/${saved.provider_id}`)}
                              className="cursor-pointer"
                          >
                            <div className="h-36 overflow-hidden bg-zinc-900">
                              {savedProfile?.cover_image_url ? (
                                  <img
                                      src={savedProfile.cover_image_url}
                                      alt={savedProfile.business_name}
                                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                  />
                              ) : (
                                  <div className="h-full w-full bg-zinc-800" />
                              )}
                            </div>
                            <div className="p-4">
                              <h3 className="font-black uppercase tracking-tight">
                                {savedProfile?.business_name}
                              </h3>
                              {savedProfile?.location && (
                                  <p className="text-xs text-black/40 uppercase tracking-widest mt-1">
                                    {savedProfile.location}
                                  </p>
                              )}
                            </div>
                          </div>
                        </div>
                    )
                  })}
                </div>
            )}
          </section>

          {/* BROWSE PROVIDERS */}
          <section>
            <div className="flex items-end justify-between border-b border-black pb-4 mb-8">
              <div className="flex items-center gap-3">
                <Search className="h-5 w-5" />
                <h2 className="text-2xl font-black uppercase tracking-tight">BROWSE PROVIDERS</h2>
              </div>
              <Link
                  to="/professionals"
                  className="text-xs font-bold tracking-[0.15em] uppercase underline-offset-4 hover:underline"
              >
                VIEW ALL
              </Link>
            </div>

            {/* SEARCH */}
            <div className="relative mb-8 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40" />
              <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or location..."
                  className="w-full border border-black pl-9 pr-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            {browsLoading ? (
                <p className="text-xs font-semibold tracking-[0.2em] uppercase text-black/40">
                  LOADING...
                </p>
            ) : filteredProviders.length === 0 ? (
                <p className="text-xs font-semibold tracking-[0.2em] uppercase text-black/40">
                  NO PROVIDERS FOUND.
                </p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProviders.map((pro) => {
                    const isSaved = savedProviderIds.includes(pro.id)
                    const isOwnStore = pro.user_id === profile?.id
                    return (
                        <div key={pro.id} className="group border border-black relative">
                          {/* SAVE BUTTON */}
                          {!isOwnStore && (
                              <button
                                  onClick={() => {
                                    if (isSaved) {
                                      const saved = savedProviders.find((s) => s.provider_id === pro.id)
                                      if (saved) unsave.mutate(saved.id)
                                    } else {
                                      save.mutate(pro.id)
                                    }
                                  }}
                                  className={`absolute top-3 right-3 z-10 border p-1.5 transition-colors ${
                                      isSaved
                                          ? 'border-black bg-black text-white hover:bg-red-500 hover:border-red-500'
                                          : 'border-black/20 bg-white hover:border-black hover:bg-black hover:text-white'
                                  }`}
                              >
                                <Heart className={`h-3.5 w-3.5 ${isSaved ? 'fill-current' : ''}`} />
                              </button>
                          )}

                          <div
                              onClick={() => navigate(`/professionals/${pro.id}`)}
                              className="cursor-pointer"
                          >
                            <div className="h-36 overflow-hidden bg-zinc-900">
                              {pro.cover_image_url ? (
                                  <img
                                      src={pro.cover_image_url}
                                      alt={pro.business_name}
                                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                  />
                              ) : (
                                  <div className="h-full w-full bg-zinc-800" />
                              )}
                            </div>
                            <div className="p-4">
                              <h3 className="font-black uppercase tracking-tight">
                                {pro.business_name}
                              </h3>
                              {pro.location && (
                                  <p className="text-xs text-black/40 uppercase tracking-widest mt-1">
                                    {pro.location}
                                  </p>
                              )}
                              {pro.description && (
                                  <p className="mt-2 text-sm text-black/60 line-clamp-2">
                                    {pro.description}
                                  </p>
                              )}
                              <span className="mt-3 inline-block text-xs font-bold tracking-[0.15em] uppercase text-black/30 group-hover:text-black transition-colors">
                          VIEW PROFILE →
                        </span>
                            </div>
                          </div>
                        </div>
                    )
                  })}
                </div>
            )}
          </section>

        </div>
      </div>
  )
}