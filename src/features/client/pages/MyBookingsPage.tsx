import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { Calendar, Clock, User, MapPin } from 'lucide-react'

interface Booking {
    id: string
    provider_id: string
    service_name: string
    booking_date: string
    start_time: string
    end_time: string
    status: 'pending' | 'accepted' | 'declined' | 'cancelled' | 'completed' | 'rescheduled'
    client_notes: string | null
    provider_notes: string | null
    created_at: string
    provider: {
        business_name: string
        location: string | null
        logo_url: string | null
    } | null
}

export function MyBookingsPage() {
    const { profile } = useAuth()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [bookings, setBookings] = useState<Booking[]>([])

    useEffect(() => {
        if (!profile) {
            navigate('/login')
            return
        }

        async function loadBookings() {
            if (!profile) return

            try {
                const { data, error } = await supabase
                    .from('bookings')
                    .select(`
                        *,
                        provider:provider_id (
                            business_name,
                            location,
                            logo_url
                        )
                    `)
                    .eq('client_id', profile.id)
                    .order('booking_date', { ascending: true })
                    .order('start_time', { ascending: true })

                if (error) throw error
                setBookings(data || [])
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load bookings')
            } finally {
                setLoading(false)
            }
        }

        void loadBookings()
    }, [profile, navigate])

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
            case 'accepted': return 'bg-green-100 text-green-800 border-green-300'
            case 'declined': return 'bg-red-100 text-red-800 border-red-300'
            case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-300'
            case 'completed': return 'bg-blue-100 text-blue-800 border-blue-300'
            case 'rescheduled': return 'bg-purple-100 text-purple-800 border-purple-300'
            default: return 'bg-gray-100 text-gray-800 border-gray-300'
        }
    }

    const getStatusMessage = (status: string) => {
        switch(status) {
            case 'pending': return 'Awaiting provider confirmation'
            case 'accepted': return 'Booking confirmed!'
            case 'declined': return 'Booking was declined'
            case 'cancelled': return 'Booking was cancelled'
            case 'completed': return 'Service completed'
            case 'rescheduled': return 'Booking was rescheduled'
            default: return ''
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="space-y-3 text-center">
                    <div className="h-8 w-8 border-2 border-black border-t-transparent animate-spin mx-auto" />
                    <p className="text-xs font-semibold tracking-[0.2em] uppercase text-black/40">
                        LOADING BOOKINGS...
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white">
            {/* HEADER */}
            <div className="border-b border-black px-6 md:px-12 lg:px-20 py-12">
                <p className="text-xs font-semibold tracking-[0.3em] uppercase text-black/40">TOPDEK</p>
                <h1 className="mt-2 text-4xl md:text-6xl font-black uppercase tracking-tight">
                    MY BOOKINGS
                </h1>
                <p className="mt-3 text-sm text-black/50">
                    View and manage your appointments.
                </p>
            </div>

            <div className="px-6 md:px-12 lg:px-20 py-12 max-w-4xl space-y-8">
                {error && (
                    <p className="border border-red-500 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-red-600">
                        {error}
                    </p>
                )}

                {bookings.length === 0 ? (
                    <div className="text-center py-16 border border-black/20">
                        <p className="text-sm text-black/30">
                            You don't have any bookings yet.
                        </p>
                        <p className="text-sm text-black/20 mt-2">
                            Browse professionals and book your first service!
                        </p>
                        <button
                            onClick={() => navigate('/professionals')}
                            className="mt-6 border border-black px-6 py-3 text-xs font-bold tracking-[0.15em] uppercase transition-colors hover:bg-black hover:text-white"
                        >
                            BROWSE PROFESSIONALS
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {bookings.map((booking) => (
                            <div key={booking.id} className="border border-black/20 p-6 space-y-4">
                                <div className="flex flex-wrap justify-between items-start gap-4">
                                    <div>
                                        <h3 className="text-xl font-bold uppercase">
                                            {booking.service_name}
                                        </h3>
                                        <div className="flex flex-wrap gap-4 mt-1 text-sm text-black/60">
                                            <div className="flex items-center gap-1">
                                                <User className="h-3 w-3" />
                                                {booking.provider?.business_name || 'Unknown Provider'}
                                            </div>
                                            {booking.provider?.location && (
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" />
                                                    {booking.provider.location}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(booking.booking_date).toLocaleDateString('en-US', {
                                                    weekday: 'short',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {booking.start_time} - {booking.end_time}
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`border px-3 py-1 text-xs font-bold uppercase tracking-[0.1em] ${getStatusColor(booking.status)}`}>
                                        {booking.status}
                                    </span>
                                </div>

                                <div className="border-t border-black/10 pt-3">
                                    <p className="text-xs font-medium text-black/60">
                                        Status: <span className="font-bold">{getStatusMessage(booking.status)}</span>
                                    </p>
                                    {booking.provider_notes && (
                                        <p className="text-sm text-black/60 mt-2">
                                            <span className="font-bold uppercase text-black/40 text-xs">Provider note:</span> {booking.provider_notes}
                                        </p>
                                    )}
                                    {booking.status === 'rescheduled' && (
                                        <p className="text-sm text-purple-600 mt-2 font-medium">
                                            ⚡ This booking has been rescheduled by the provider.
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}