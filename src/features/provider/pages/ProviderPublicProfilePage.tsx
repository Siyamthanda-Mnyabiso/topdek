import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { MapPin, Clock, ArrowLeft, Heart, Share2, Check } from 'lucide-react'

interface Service {
    id: string
    provider_id: string
    title: string
    description: string | null
    price: number
    duration: number
    is_active: boolean
    created_at: string
}

interface ProviderProfile {
    id: string
    user_id: string
    business_name: string
    description: string | null
    location: string | null
    phone: string | null
    logo_url: string | null
    cover_image_url: string | null
    created_at: string
}

export function ProviderPublicProfilePage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const location = useLocation()
    const { profile: authProfile, session } = useAuth()
    const queryClient = useQueryClient()

    const [linkCopied, setLinkCopied] = useState(false)

    const { data: profile, isLoading: profileLoading } = useQuery<ProviderProfile | null>({
        queryKey: ['provider-profile', id],
        queryFn: async () => {
            if (!id) return null
            const { data, error } = await supabase
                .from('provider_profiles')
                .select('*')
                .eq('id', id)
                .maybeSingle()
            if (error) throw error
            return data
        },
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    })

    const { data: services = [], isLoading: servicesLoading } = useQuery<Service[]>({
        queryKey: ['provider-services', profile?.id],
        queryFn: async () => {
            if (!profile?.id) return []
            const { data, error } = await supabase
                .from('services')
                .select('*')
                .eq('provider_id', profile.id)
                .eq('is_active', true)
                .order('created_at', { ascending: false })
            if (error) throw error
            return (data ?? []) as Service[]
        },
        enabled: !!profile?.id,
        staleTime: 5 * 60 * 1000,
    })

    // Check if already saved
    const { data: savedRecord } = useQuery({
        queryKey: ['saved-check', authProfile?.id, id],
        queryFn: async () => {
            if (!authProfile || !id) return null
            const { data } = await supabase
                .from('saved_providers')
                .select('id')
                .eq('client_id', authProfile.id)
                .eq('provider_id', id)
                .maybeSingle()
            return data
        },
        enabled: !!authProfile && !!id,
    })

    const isSaved = !!savedRecord

    const toggleSave = useMutation({
        mutationFn: async () => {
            if (!session) {
                navigate('/login', { state: { from: location.pathname } })
                return
            }
            if (!authProfile || !id) return

            if (isSaved && savedRecord) {
                const { error } = await supabase
                    .from('saved_providers')
                    .delete()
                    .eq('id', savedRecord.id)
                if (error) throw error
            } else {
                const { error } = await supabase
                    .from('saved_providers')
                    .insert({ client_id: authProfile.id, provider_id: id })
                if (error) throw error
            }
        },
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['saved-check'] })
            void queryClient.invalidateQueries({ queryKey: ['saved-providers'] })
        },
    })

    function handleShare() {
        const url = `${window.location.origin}/professionals/${id}`
        void navigator.clipboard.writeText(url)
        setLinkCopied(true)
        setTimeout(() => setLinkCopied(false), 2000)
    }

    if (profileLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="space-y-3 text-center">
                    <div className="h-8 w-8 border-2 border-black border-t-transparent animate-spin mx-auto" />
                    <p className="text-xs font-semibold tracking-[0.2em] uppercase text-black/40">
                        LOADING...
                    </p>
                </div>
            </div>
        )
    }

    if (!profile) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] px-6">
                <div className="text-center">
                    <h1 className="text-3xl font-black uppercase tracking-tight">NOT FOUND</h1>
                    <p className="mt-2 text-sm text-black/50">
                        This provider does not exist or has been removed.
                    </p>
                    <button
                        onClick={() => navigate('/professionals')}
                        className="mt-6 border border-black px-6 py-3 text-xs font-bold tracking-[0.15em] uppercase transition-colors hover:bg-black hover:text-white"
                    >
                        BROWSE PROFESSIONALS
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white relative">

            {/* FLOATING HEART */}
            <button
                onClick={() => toggleSave.mutate()}
                disabled={toggleSave.isPending}
                className={`fixed bottom-8 right-8 z-50 flex h-14 w-14 items-center justify-center border-2 transition-colors shadow-lg ${
                    isSaved
                        ? 'border-black bg-black text-white hover:bg-red-500 hover:border-red-500'
                        : 'border-black bg-white text-black hover:bg-black hover:text-white'
                }`}
            >
                <Heart className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
            </button>

            {/* COVER */}
            <div className="relative h-72 md:h-96 w-full bg-zinc-900">
                {profile.cover_image_url ? (
                    <img
                        src={profile.cover_image_url}
                        alt={profile.business_name}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="h-full w-full bg-zinc-900" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* BACK + SHARE */}
                <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
                    <button
                        onClick={() => navigate('/professionals')}
                        className="flex items-center gap-2 border border-white/40 bg-black/30 px-4 py-2 text-xs font-bold tracking-[0.15em] uppercase text-white backdrop-blur-sm transition-colors hover:bg-black"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        BACK
                    </button>

                    <button
                        onClick={handleShare}
                        className="flex items-center gap-2 border border-white/40 bg-black/30 px-4 py-2 text-xs font-bold tracking-[0.15em] uppercase text-white backdrop-blur-sm transition-colors hover:bg-black"
                    >
                        {linkCopied ? (
                            <>
                                <Check className="h-3.5 w-3.5" />
                                COPIED
                            </>
                        ) : (
                            <>
                                <Share2 className="h-3.5 w-3.5" />
                                SHARE
                            </>
                        )}
                    </button>
                </div>

                {/* BUSINESS NAME OVER COVER */}
                <div className="absolute bottom-0 left-0 right-0 px-6 md:px-12 lg:px-20 pb-8">
                    <div className="flex items-end gap-5">
                        <div className="h-20 w-20 md:h-24 md:w-24 border-2 border-white bg-zinc-800 overflow-hidden shrink-0">
                            {profile.logo_url ? (
                                <img
                                    src={profile.logo_url}
                                    alt={profile.business_name}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="h-full w-full bg-zinc-700 flex items-center justify-center text-2xl font-black text-white">
                                    {profile.business_name.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>

                        <div>
                            <h1 className="text-3xl md:text-5xl font-black uppercase leading-none tracking-tight text-white">
                                {profile.business_name}
                            </h1>
                            {profile.location && (
                                <div className="flex items-center gap-1.5 mt-2 text-white/60">
                                    <MapPin className="h-3.5 w-3.5" />
                                    <span className="text-xs font-semibold tracking-[0.15em] uppercase">
                    {profile.location}
                  </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* CONTENT */}
            <div className="mx-auto max-w-5xl px-6 md:px-12 lg:px-20 py-12">

                {profile.description && (
                    <div className="mb-12 pb-12 border-b border-black">
                        <h2 className="text-xs font-bold tracking-[0.3em] uppercase text-black/40 mb-3">
                            ABOUT
                        </h2>
                        <p className="text-base text-black/70 leading-relaxed max-w-2xl">
                            {profile.description}
                        </p>
                    </div>
                )}

                <div>
                    <div className="flex items-end justify-between mb-8 border-b border-black pb-4">
                        <h2 className="text-3xl font-black uppercase tracking-tight">SERVICES</h2>
                        {services.length > 0 && (
                            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-black/40">
                {services.length} SERVICE{services.length !== 1 ? 'S' : ''}
              </span>
                        )}
                    </div>

                    {servicesLoading ? (
                        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-black/40">
                            LOADING SERVICES...
                        </p>
                    ) : services.length === 0 ? (
                        <div className="border border-dashed border-black/20 py-16 text-center">
                            <p className="text-xs font-semibold tracking-[0.3em] uppercase text-black/30">
                                NO SERVICES LISTED YET
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {services.map((service) => (
                                <div
                                    key={service.id}
                                    className="group border border-black p-6 transition-colors hover:bg-black hover:text-white"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <h3 className="font-black uppercase tracking-tight text-lg">
                                                {service.title}
                                            </h3>
                                            {service.description && (
                                                <p className="mt-1 text-sm text-black/60 group-hover:text-white/60 line-clamp-2">
                                                    {service.description}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-6 mt-3">
                        <span className="text-sm font-black">
                          R{service.price.toFixed(2)}
                        </span>
                                                <span className="flex items-center gap-1.5 text-xs text-black/50 group-hover:text-white/50">
                          <Clock className="h-3.5 w-3.5" />
                                                    {service.duration} min
                        </span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => console.log(`Booking service: ${service.id}`)}
                                            className="shrink-0 border border-black bg-black text-white px-6 py-2.5 text-xs font-bold tracking-[0.15em] uppercase transition-colors group-hover:border-white group-hover:bg-white group-hover:text-black"
                                        >
                                            BOOK NOW
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {services.length > 0 && (
                    <div className="mt-16 bg-black text-white px-8 py-12 text-center">
                        <h3 className="text-2xl font-black uppercase tracking-tight">
                            READY TO BOOK?
                        </h3>
                        <p className="mt-2 text-sm text-white/50">
                            Choose a service above and schedule your appointment with {profile.business_name}.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}