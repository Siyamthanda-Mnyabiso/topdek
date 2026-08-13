import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { notifyUser } from '@/lib/notifications'
import { MapPin, ArrowLeft, Heart, Share2, Check, ImageOff, ChevronLeft, ChevronRight, X, Calendar, Globe } from 'lucide-react'
import { SERVICE_DURATION_MINUTES } from '@/features/provider/constants'

interface Service {
    id: string
    provider_id: string
    title: string
    description: string | null
    price: number
    is_active: boolean
    created_at: string
    image_url: string | null
    category: string | null
}

interface ServiceImage {
    id: string
    service_id: string
    image_url: string
    position: number
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
    instagram_url: string | null
    facebook_url: string | null
    tiktok_url: string | null
    twitter_url: string | null
    website_url: string | null
    created_at: string
}

// --- Social links -----------------------------------------------------

function withScheme(url: string): string {
    return /^https?:\/\//i.test(url) ? url : `https://${url}`
}

function InstagramIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
    )
}

function FacebookIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
            <path d="M15 4h-2a4 4 0 0 0-4 4v3H7v4h2v7h4v-7h2.5l.5-4h-3V8a1 1 0 0 1 1-1h2.5V4Z" />
        </svg>
    )
}

function TikTokIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
            <path d="M15 3v11.5a3.5 3.5 0 1 1-3.5-3.5" />
            <path d="M15 3c0 3 2 5 5 5" />
        </svg>
    )
}

function XIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
            <path d="M4 4l16 16M20 4L4 20" />
        </svg>
    )
}

const SOCIAL_LINKS: {
    key: 'instagram_url' | 'facebook_url' | 'tiktok_url' | 'twitter_url' | 'website_url'
    label: string
    Icon: React.ComponentType<{ className?: string }>
}[] = [
    { key: 'instagram_url', label: 'INSTAGRAM', Icon: InstagramIcon },
    { key: 'facebook_url', label: 'FACEBOOK', Icon: FacebookIcon },
    { key: 'tiktok_url', label: 'TIKTOK', Icon: TikTokIcon },
    { key: 'twitter_url', label: 'X', Icon: XIcon },
    { key: 'website_url', label: 'WEBSITE', Icon: Globe },
]

// --- Carousel for a single service's images -------------------------------

function ServiceImageCarousel({ images, title }: { images: string[]; title: string }) {
    const [index, setIndex] = useState(0)

    if (images.length === 0) {
        return (
            <div className="aspect-square w-full bg-zinc-100 flex items-center justify-center text-zinc-300">
                <ImageOff className="h-8 w-8" />
            </div>
        )
    }

    const goPrev = (e: React.MouseEvent) => {
        e.stopPropagation()
        setIndex((i) => (i === 0 ? images.length - 1 : i - 1))
    }
    const goNext = (e: React.MouseEvent) => {
        e.stopPropagation()
        setIndex((i) => (i === images.length - 1 ? 0 : i + 1))
    }

    return (
        <div className="relative aspect-square w-full bg-zinc-100 overflow-hidden select-none">
            <img
                src={images[index]}
                alt={`${title} photo ${index + 1}`}
                className="h-full w-full object-cover"
                draggable={false}
            />

            {images.length > 1 && (
                <>
                    <button
                        onClick={goPrev}
                        aria-label="Previous photo"
                        className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                        onClick={goNext}
                        aria-label="Next photo"
                        className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>

                    {/* Dots */}
                    <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-1.5">
                        {images.map((_, i) => (
                            <span
                                key={i}
                                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                                    i === index ? 'bg-white' : 'bg-white/40'
                                }`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

// --- Booking modal ----------------------------------------------------------

function BookingModal({
                          service,
                          providerId,
                          businessName,
                          onClose,
                      }: {
    service: Service
    providerId: string
    businessName: string
    onClose: () => void
}) {
    const { profile: authProfile, session } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const queryClient = useQueryClient()

    const [selectedDate, setSelectedDate] = useState('')
    const [selectedTime, setSelectedTime] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [availableSlots, setAvailableSlots] = useState<{date: string, times: string[]}[]>([])
    const [loadingAvailability, setLoadingAvailability] = useState(true)
    const [hasAvailability, setHasAvailability] = useState(false)
    const [hasExistingBooking, setHasExistingBooking] = useState(false)
    const [existingBookingStatus, setExistingBookingStatus] = useState<string | null>(null)

    // Fetch all availability for this provider, and check for an existing booking
    useEffect(() => {
        async function checkExistingBooking() {
            if (!authProfile) return

            try {
                const { data, error } = await supabase
                    .from('bookings')
                    .select('status')
                    .eq('client_id', authProfile.id)
                    .eq('service_id', service.id)
                    .eq('provider_id', providerId)
                    .in('status', ['pending', 'accepted'])
                    .maybeSingle()

                if (error) {
                    console.error('Error checking existing booking:', error)
                    return
                }

                if (data) {
                    setHasExistingBooking(true)
                    setExistingBookingStatus(data.status)
                }
            } catch (err) {
                console.error('Error checking existing booking:', err)
            }
        }

        async function fetchAllAvailability() {
            setLoadingAvailability(true)
            setError(null)

            try {
                console.log('Fetching availability for provider:', providerId)

                // Get all availability slots for this provider
                const { data: availabilityData, error: availabilityError } = await supabase
                    .from('provider_availability')
                    .select('*')
                    .eq('provider_profile_id', providerId)
                    .eq('is_available', true)
                    .gte('specific_date', new Date().toISOString().split('T')[0]) // Only future dates
                    .order('specific_date', { ascending: true })
                    .order('start_time', { ascending: true })

                if (availabilityError) {
                    console.error('Availability error:', availabilityError)
                    setError(`Failed to load availability: ${availabilityError.message}`)
                    setLoadingAvailability(false)
                    return
                }

                console.log('Availability data:', availabilityData)

                if (!availabilityData || availabilityData.length === 0) {
                    setHasAvailability(false)
                    setLoadingAvailability(false)
                    return
                }

                // Group by date
                const groupedSlots: Record<string, string[]> = {}

                for (const slot of availabilityData) {
                    const date = slot.specific_date
                    if (!groupedSlots[date]) {
                        groupedSlots[date] = []
                    }

                    // Check if this time slot is already booked
                    const { data: bookingsData } = await supabase
                        .from('bookings')
                        .select('id')
                        .eq('provider_id', providerId)
                        .eq('booking_date', date)
                        .eq('start_time', slot.start_time)
                        .in('status', ['pending', 'accepted'])

                    if (!bookingsData || bookingsData.length === 0) {
                        groupedSlots[date].push(slot.start_time)
                    }
                }

                // Convert to array and filter out dates with no available times
                const slots = Object.entries(groupedSlots)
                    .filter(([, times]) => times.length > 0)
                    .map(([date, times]) => ({
                        date,
                        times: times.sort()
                    }))

                console.log('Available slots:', slots)

                setAvailableSlots(slots)
                setHasAvailability(slots.length > 0)

            } catch (err) {
                console.error('Error fetching availability:', err)
                setError(err instanceof Error ? err.message : 'Failed to load availability')
            } finally {
                setLoadingAvailability(false)
            }
        }

        void fetchAllAvailability()
        void checkExistingBooking()
    }, [authProfile, providerId, service.id])

    const createBooking = useMutation({
        mutationFn: async () => {
            if (!session || !authProfile) {
                navigate('/login', { state: { from: location.pathname } })
                throw new Error('not-authenticated')
            }
            if (!selectedDate || !selectedTime) {
                throw new Error('Please choose a date and time')
            }

            // Calculate end time based on the fixed slot length
            const [hours, minutes] = selectedTime.split(':').map(Number)
            const startMinutes = hours * 60 + minutes
            const endMinutes = startMinutes + SERVICE_DURATION_MINUTES
            const endHours = Math.floor(endMinutes / 60)
            const endMins = endMinutes % 60
            const endTime = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`

            // Double check that the slot is still available
            const { data: existingBookings, error: checkError } = await supabase
                .from('bookings')
                .select('id')
                .eq('provider_id', providerId)
                .eq('booking_date', selectedDate)
                .eq('start_time', selectedTime)
                .in('status', ['pending', 'accepted'])

            if (checkError) throw checkError

            if (existingBookings && existingBookings.length > 0) {
                throw new Error('This time slot is no longer available. Please choose another time.')
            }

            const { data: created, error } = await supabase
                .from('bookings')
                .insert({
                    service_id: service.id,
                    provider_id: providerId,
                    client_id: authProfile.id,
                    service_name: service.title,
                    booking_date: selectedDate,
                    start_time: selectedTime,
                    end_time: endTime,
                    status: 'pending',
                    client_notes: null,
                    provider_notes: null,
                })
                .select('id')
                .single()

            if (error) throw error

            void notifyUser(created.id, 'booking_created')
        },
        onSuccess: () => {
            setSuccess(true)
            setError(null)
            void queryClient.invalidateQueries({ queryKey: ['bookings'] })
        },
        onError: (err) => {
            if (err instanceof Error && err.message !== 'not-authenticated') {
                setError(err.message)
            }
        },
    })

    if (loadingAvailability) {
        return (
            <div
                className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4"
                onClick={onClose}
            >
                <div className="w-full max-w-sm bg-white border border-black p-6">
                    <div className="text-center">
                        <div className="h-8 w-8 border-2 border-black border-t-transparent animate-spin mx-auto" />
                        <p className="mt-3 text-xs font-semibold tracking-[0.2em] uppercase text-black/40">
                            LOADING AVAILABILITY...
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-sm bg-white border border-black max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b border-black p-4">
                    <h3 className="text-sm font-bold tracking-[0.15em] uppercase">
                        {success ? 'BOOKING REQUESTED' : 'BOOK SERVICE'}
                    </h3>
                    <button onClick={onClose} aria-label="Close" className="text-black/50 hover:text-black">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {success ? (
                    <div className="p-6 text-center">
                        <Check className="mx-auto h-8 w-8 mb-3" />
                        <p className="text-sm text-black/70">
                            Your request for <span className="font-bold">{service.title}</span> with{' '}
                            {businessName} on {new Date(selectedDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                        })} at {selectedTime} has been sent.
                        </p>
                        <button
                            onClick={onClose}
                            className="mt-6 w-full border border-black bg-black py-2.5 text-xs font-bold tracking-[0.15em] uppercase text-white"
                        >
                            DONE
                        </button>
                    </div>
                ) : (
                    <div className="p-6 space-y-4">
                        <div>
                            <p className="text-xs font-bold tracking-[0.15em] uppercase text-black/40">
                                {service.title}
                            </p>
                            <p className="mt-1 text-sm text-black/60">
                                R{service.price.toFixed(2)}
                            </p>
                        </div>

                        {error && (
                            <div className="border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                                {error}
                            </div>
                        )}

                        {hasExistingBooking ? (
                            <div className="border border-blue-200 bg-blue-50 p-6 text-center">
                                <p className="text-sm text-blue-700 font-medium">
                                    You have already booked this service!
                                </p>
                                <p className="mt-2 text-xs text-blue-600">
                                    Your booking is currently <span className="font-bold uppercase">{existingBookingStatus}</span>.
                                    {existingBookingStatus === 'pending' && ' Please wait for the provider to confirm.'}
                                    {existingBookingStatus === 'accepted' && ' Your appointment has been confirmed!'}
                                </p>
                            </div>
                        ) : !hasAvailability ? (
                            <div className="border border-yellow-200 bg-yellow-50 p-6 text-center">
                                <p className="text-sm text-yellow-700 font-medium">
                                    Sorry, I'm not available at the moment.
                                </p>
                                <p className="mt-2 text-xs text-yellow-600">
                                    But keep an eye open for when I am!
                                </p>
                            </div>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-xs font-semibold tracking-wide uppercase text-black/50 mb-2">
                                        Available Dates
                                    </label>
                                    <div className="space-y-3 max-h-60 overflow-y-auto">
                                        {availableSlots.map((slot) => (
                                            <div key={slot.date} className="border border-black/20 p-3">
                                                <div className="text-sm font-bold uppercase mb-2">
                                                    {new Date(slot.date).toLocaleDateString('en-US', {
                                                        weekday: 'long',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </div>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {slot.times.map((time) => (
                                                        <button
                                                            key={time}
                                                            onClick={() => {
                                                                setSelectedDate(slot.date)
                                                                setSelectedTime(time)
                                                                setError(null)
                                                            }}
                                                            className={`border px-3 py-2 text-sm font-medium transition-colors ${
                                                                selectedDate === slot.date && selectedTime === time
                                                                    ? 'border-black bg-black text-white'
                                                                    : 'border-black/20 hover:border-black'
                                                            }`}
                                                        >
                                                            {time}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {selectedDate && selectedTime && (
                                    <div className="border border-green-200 bg-green-50 p-3">
                                        <p className="text-xs text-green-700">
                                            Selected: {new Date(selectedDate).toLocaleDateString('en-US', {
                                            weekday: 'short',
                                            month: 'short',
                                            day: 'numeric'
                                        })} at {selectedTime}
                                        </p>
                                    </div>
                                )}

                                <button
                                    onClick={() => createBooking.mutate()}
                                    disabled={createBooking.isPending || !selectedDate || !selectedTime}
                                    className="w-full border border-black bg-black py-3 text-xs font-bold tracking-[0.15em] uppercase text-white transition-colors hover:bg-white hover:text-black disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {createBooking.isPending ? 'BOOKING...' : 'CONFIRM BOOKING'}
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

// --- Main page ---------------------------------------------------------

export function ProviderPublicProfilePage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const location = useLocation()
    const { profile: authProfile, session } = useAuth()
    const queryClient = useQueryClient()

    const [linkCopied, setLinkCopied] = useState(false)
    const [bookingService, setBookingService] = useState<Service | null>(null)

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

    // All images for all of this provider's services, grouped by service_id
    const { data: imagesByService = {} } = useQuery<Record<string, string[]>>({
        queryKey: ['provider-service-images', services.map((s) => s.id).join(',')],
        queryFn: async () => {
            if (services.length === 0) return {}
            const { data, error } = await supabase
                .from('service_images')
                .select('*')
                .in('service_id', services.map((s) => s.id))
                .order('position', { ascending: true })
            if (error) throw error

            const grouped: Record<string, string[]> = {}
            ;(data as ServiceImage[]).forEach((img) => {
                if (!grouped[img.service_id]) grouped[img.service_id] = []
                grouped[img.service_id].push(img.image_url)
            })
            return grouped
        },
        enabled: services.length > 0,
        staleTime: 5 * 60 * 1000,
    })

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

    function handleBookClick(service: Service) {
        if (!session) {
            navigate('/login', { state: { from: location.pathname, bookServiceId: service.id } })
            return
        }
        setBookingService(service)
    }

    // If the visitor was just redirected through login/signup while trying
    // to book a specific service, resume that booking once it's loaded.
    const resumeBookServiceId = (location.state as { bookServiceId?: string } | null)?.bookServiceId
    const resumedService = session && resumeBookServiceId
        ? (services.find((s) => s.id === resumeBookServiceId) ?? null)
        : null
    const activeBookingService = bookingService ?? resumedService

    function closeBookingModal() {
        setBookingService(null)
        if (resumedService) {
            navigate(location.pathname, { replace: true })
        }
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

            {activeBookingService && (
                <BookingModal
                    service={activeBookingService}
                    providerId={profile.id}
                    businessName={profile.business_name}
                    onClose={closeBookingModal}
                />
            )}

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

                {SOCIAL_LINKS.some(({ key }) => profile[key]) && (
                    <div className="mb-12 pb-12 border-b border-black">
                        <h2 className="text-xs font-bold tracking-[0.3em] uppercase text-black/40 mb-4">
                            CONNECT
                        </h2>
                        <div className="flex flex-wrap gap-3">
                            {SOCIAL_LINKS.map(({ key, label, Icon }) => {
                                const url = profile[key]
                                if (!url) return null

                                return (
                                    <a
                                        key={key}
                                        href={withScheme(url)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 border border-black px-4 py-2.5 text-xs font-bold tracking-[0.15em] uppercase transition-colors hover:bg-black hover:text-white"
                                    >
                                        <Icon />
                                        {label}
                                    </a>
                                )
                            })}
                        </div>
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {services.map((service) => {
                                const images = imagesByService[service.id] ?? (service.image_url ? [service.image_url] : [])

                                return (
                                    <div key={service.id} className="border border-black flex flex-col">
                                        {/* IMAGE / CAROUSEL */}
                                        <ServiceImageCarousel images={images} title={service.title} />

                                        {/* INFO */}
                                        <div className="p-4 flex flex-col flex-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="font-black uppercase tracking-tight text-base">
                                                    {service.title}
                                                </h3>
                                                {service.category && (
                                                    <span className="text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 border border-black/20 text-black/50">
                                                        {service.category}
                                                    </span>
                                                )}
                                            </div>

                                            {service.description && (
                                                <p className="mt-1.5 text-sm text-black/60 line-clamp-2">
                                                    {service.description}
                                                </p>
                                            )}

                                            <div className="flex items-center gap-4 mt-3">
                                                <span className="text-sm font-black">
                                                    R{service.price.toFixed(2)}
                                                </span>
                                            </div>

                                            <button
                                                onClick={() => handleBookClick(service)}
                                                className="mt-4 w-full border border-black bg-black py-2.5 text-xs font-bold tracking-[0.15em] uppercase text-white transition-colors hover:bg-white hover:text-black flex items-center justify-center gap-2"
                                            >
                                                <Calendar className="h-3.5 w-3.5" />
                                                BOOK NOW
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
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