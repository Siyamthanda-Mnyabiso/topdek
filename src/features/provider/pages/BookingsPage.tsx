import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { notifyUser } from '@/lib/notifications'
import { Check, X, Clock, User, Calendar, MessageCircle, Pencil, Save, XCircle } from 'lucide-react'

interface Booking {
    id: string
    client_id: string
    provider_id: string
    service_id: string
    service_name: string
    booking_date: string
    start_time: string
    end_time: string
    status: 'pending' | 'accepted' | 'declined' | 'cancelled' | 'completed' | 'rescheduled'
    client_notes: string | null
    provider_notes: string | null
    created_at: string
    client?: {
        email?: string
    } | null
}

type FilterStatus = 'all' | 'pending' | 'accepted' | 'declined' | 'cancelled' | 'completed' | 'rescheduled'

export function BookingsPage() {
    const { profile, isLoading: authLoading } = useAuth()
    const navigate = useNavigate()

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [bookings, setBookings] = useState<Booking[]>([])
    const [filter, setFilter] = useState<FilterStatus>('all')
    const [processingId, setProcessingId] = useState<string | null>(null)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editDate, setEditDate] = useState('')
    const [editStartTime, setEditStartTime] = useState('')
    const [editEndTime, setEditEndTime] = useState('')

    useEffect(() => {
        if (authLoading) return
        if (!profile) {
            navigate('/login')
            return
        }

        async function loadBookings(providerId: string) {
            const { data, error } = await supabase
                .from('bookings')
                .select(`
                    *,
                    client:client_id (
                        email
                    )
                `)
                .eq('provider_id', providerId)
                .order('booking_date', { ascending: false })
                .order('start_time', { ascending: true })

            if (error) {
                setError(error.message)
                return
            }

            setBookings(data || [])
        }

        async function loadProviderProfile() {
            if (!profile) return

            const { data, error } = await supabase
                .from('provider_profiles')
                .select('id')
                .eq('user_id', profile.id)
                .single()

            if (error || !data) {
                setError('Provider profile not found. Please complete setup first.')
                setLoading(false)
                return
            }

            await loadBookings(data.id)
            setLoading(false)
        }

        void loadProviderProfile()
    }, [profile, authLoading, navigate])

    async function handleUpdateStatus(bookingId: string, newStatus: 'accepted' | 'declined' | 'cancelled' | 'completed') {
        setProcessingId(bookingId)
        setError(null)
        setSuccess(null)

        const { error } = await supabase
            .from('bookings')
            .update({
                status: newStatus,
                updated_at: new Date().toISOString()
            })
            .eq('id', bookingId)

        if (error) {
            setError(error.message)
            setProcessingId(null)
            return
        }

        setBookings(bookings.map(booking =>
            booking.id === bookingId
                ? { ...booking, status: newStatus }
                : booking
        ))

        const notificationEvent = {
            accepted: 'booking_accepted',
            declined: 'booking_declined',
            cancelled: 'booking_cancelled',
            completed: 'booking_completed',
        } as const
        void notifyUser(bookingId, notificationEvent[newStatus])

        setSuccess(`Booking ${newStatus} successfully`)
        setProcessingId(null)

        setTimeout(() => setSuccess(null), 3000)
    }

    async function handleReschedule(bookingId: string) {
        if (!editDate || !editStartTime || !editEndTime) {
            setError('Please select date and time')
            return
        }

        if (editStartTime >= editEndTime) {
            setError('End time must be after start time')
            return
        }

        setProcessingId(bookingId)
        setError(null)
        setSuccess(null)

        // Find the booking to get provider_id
        const bookingToUpdate = bookings.find(b => b.id === bookingId)
        if (!bookingToUpdate) {
            setError('Booking not found')
            setProcessingId(null)
            return
        }

        // Check if the new time slot is available
        const { data: existingBookings, error: checkError } = await supabase
            .from('bookings')
            .select('id')
            .eq('provider_id', bookingToUpdate.provider_id)
            .eq('booking_date', editDate)
            .in('status', ['pending', 'accepted'])
            .neq('id', bookingId)
            .or(`start_time.lte.${editEndTime},end_time.gte.${editStartTime}`)

        if (checkError) {
            setError(checkError.message)
            setProcessingId(null)
            return
        }

        if (existingBookings && existingBookings.length > 0) {
            setError('This time slot is already booked. Please choose another time.')
            setProcessingId(null)
            return
        }

        const { error } = await supabase
            .from('bookings')
            .update({
                booking_date: editDate,
                start_time: editStartTime,
                end_time: editEndTime,
                status: 'rescheduled',
                updated_at: new Date().toISOString()
            })
            .eq('id', bookingId)

        if (error) {
            setError(error.message)
            setProcessingId(null)
            return
        }

        setBookings(bookings.map(booking =>
            booking.id === bookingId
                ? {
                    ...booking,
                    booking_date: editDate,
                    start_time: editStartTime,
                    end_time: editEndTime,
                    status: 'rescheduled'
                }
                : booking
        ))

        void notifyUser(bookingId, 'booking_rescheduled')

        setSuccess('Booking rescheduled successfully')
        setEditingId(null)
        setProcessingId(null)
        setEditDate('')
        setEditStartTime('')
        setEditEndTime('')

        setTimeout(() => setSuccess(null), 3000)
    }

    function startEdit(booking: Booking) {
        setEditingId(booking.id)
        setEditDate(booking.booking_date)
        setEditStartTime(booking.start_time)
        setEditEndTime(booking.end_time)
        setError(null)
    }

    function cancelEdit() {
        setEditingId(null)
        setEditDate('')
        setEditStartTime('')
        setEditEndTime('')
        setError(null)
    }

    const filteredBookings = filter === 'all'
        ? bookings
        : bookings.filter(b => b.status === filter)

    const statusCounts = {
        all: bookings.length,
        pending: bookings.filter(b => b.status === 'pending').length,
        accepted: bookings.filter(b => b.status === 'accepted').length,
        declined: bookings.filter(b => b.status === 'declined').length,
        cancelled: bookings.filter(b => b.status === 'cancelled').length,
        completed: bookings.filter(b => b.status === 'completed').length,
        rescheduled: bookings.filter(b => b.status === 'rescheduled').length,
    }

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
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="mt-2 text-4xl md:text-6xl font-black uppercase tracking-tight">
                            BOOKINGS
                        </h1>
                        <p className="mt-3 text-sm text-black/50">
                            Manage all client booking requests.
                        </p>
                    </div>
                    <div className="sm:text-right">
                        <span className="text-2xl font-black">{statusCounts.pending}</span>
                        <span className="text-xs font-bold uppercase text-black/40 block">Pending</span>
                    </div>
                </div>
            </div>

            <div className="px-6 md:px-12 lg:px-20 py-12 max-w-6xl space-y-8">
                {error && (
                    <p className="border border-red-500 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-red-600">
                        {error}
                    </p>
                )}

                {success && (
                    <p className="border border-black bg-black px-4 py-3 text-xs font-semibold uppercase tracking-wide text-white">
                        ✓ {success}
                    </p>
                )}

                {/* FILTER TABS */}
                <div className="flex flex-wrap gap-2 border-b border-black/10 pb-4">
                    {(['all', 'pending', 'accepted', 'declined', 'cancelled', 'completed', 'rescheduled'] as FilterStatus[]).map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] transition-colors ${
                                filter === status
                                    ? 'bg-black text-white'
                                    : 'text-black/40 hover:text-black'
                            }`}
                        >
                            {status} ({statusCounts[status]})
                        </button>
                    ))}
                </div>

                {/* BOOKINGS LIST */}
                {filteredBookings.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-sm text-black/30">
                            No {filter !== 'all' ? filter : ''} bookings found.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredBookings.map((booking) => (
                            <div key={booking.id} className="border border-black/20 p-6 space-y-4">
                                {/* HEADER */}
                                <div className="flex flex-wrap justify-between items-start gap-4">
                                    <div>
                                        <h3 className="text-xl font-bold uppercase">
                                            {booking.service_name}
                                        </h3>
                                        <div className="flex flex-wrap gap-4 mt-1 text-sm text-black/60">
                                            <div className="flex items-center gap-1">
                                                <User className="h-3 w-3" />
                                                {booking.client?.email || 'Unknown Client'}
                                            </div>
                                            {editingId === booking.id ? (
                                                <div className="flex flex-wrap gap-2">
                                                    <input
                                                        type="date"
                                                        value={editDate}
                                                        onChange={(e) => setEditDate(e.target.value)}
                                                        className="border border-black px-2 py-1 text-sm"
                                                    />
                                                    <input
                                                        type="time"
                                                        value={editStartTime}
                                                        onChange={(e) => setEditStartTime(e.target.value)}
                                                        className="border border-black px-2 py-1 text-sm"
                                                    />
                                                    <span className="text-black/40">-</span>
                                                    <input
                                                        type="time"
                                                        value={editEndTime}
                                                        onChange={(e) => setEditEndTime(e.target.value)}
                                                        className="border border-black px-2 py-1 text-sm"
                                                    />
                                                </div>
                                            ) : (
                                                <>
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
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <span className={`border px-3 py-1 text-xs font-bold uppercase tracking-[0.1em] ${getStatusColor(booking.status)}`}>
                                        {booking.status}
                                    </span>
                                </div>

                                {/* NOTES */}
                                {(booking.client_notes || booking.provider_notes) && (
                                    <div className="border-t border-black/10 pt-3 space-y-1">
                                        {booking.client_notes && (
                                            <div className="flex items-start gap-2 text-sm">
                                                <MessageCircle className="h-3 w-3 text-black/40 mt-0.5" />
                                                <span className="text-black/60">
                                                    <span className="font-bold uppercase text-black/40 text-xs">Client:</span> {booking.client_notes}
                                                </span>
                                            </div>
                                        )}
                                        {booking.provider_notes && (
                                            <div className="flex items-start gap-2 text-sm">
                                                <MessageCircle className="h-3 w-3 text-black/40 mt-0.5" />
                                                <span className="text-black/60">
                                                    <span className="font-bold uppercase text-black/40 text-xs">Your note:</span> {booking.provider_notes}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ACTIONS */}
                                {editingId === booking.id ? (
                                    <div className="flex gap-3 pt-2 border-t border-black/10">
                                        <button
                                            onClick={() => handleReschedule(booking.id)}
                                            disabled={processingId === booking.id}
                                            className="flex items-center gap-2 border border-green-600 bg-green-600 px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] text-white hover:bg-white hover:text-green-600 transition-colors disabled:opacity-50"
                                        >
                                            <Save className="h-3 w-3" />
                                            SAVE
                                        </button>
                                        <button
                                            onClick={cancelEdit}
                                            disabled={processingId === booking.id}
                                            className="flex items-center gap-2 border border-gray-400 px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
                                        >
                                            <XCircle className="h-3 w-3" />
                                            CANCEL
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        {/* PENDING ACTIONS */}
                                        {booking.status === 'pending' && (
                                            <div className="flex gap-3 pt-2 border-t border-black/10">
                                                <button
                                                    onClick={() => handleUpdateStatus(booking.id, 'accepted')}
                                                    disabled={processingId === booking.id}
                                                    className="flex items-center gap-2 border border-green-600 bg-green-600 px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] text-white hover:bg-white hover:text-green-600 transition-colors disabled:opacity-50"
                                                >
                                                    <Check className="h-3 w-3" />
                                                    ACCEPT
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateStatus(booking.id, 'declined')}
                                                    disabled={processingId === booking.id}
                                                    className="flex items-center gap-2 border border-red-600 bg-red-600 px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] text-white hover:bg-white hover:text-red-600 transition-colors disabled:opacity-50"
                                                >
                                                    <X className="h-3 w-3" />
                                                    DECLINE
                                                </button>
                                            </div>
                                        )}

                                        {/* ACCEPTED ACTIONS */}
                                        {booking.status === 'accepted' && (
                                            <div className="flex gap-3 pt-2 border-t border-black/10">
                                                <button
                                                    onClick={() => handleUpdateStatus(booking.id, 'completed')}
                                                    disabled={processingId === booking.id}
                                                    className="border border-black bg-black px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] text-white hover:bg-white hover:text-black transition-colors disabled:opacity-50"
                                                >
                                                    MARK COMPLETED
                                                </button>
                                                <button
                                                    onClick={() => startEdit(booking)}
                                                    disabled={processingId === booking.id}
                                                    className="flex items-center gap-2 border border-blue-500 px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] text-blue-500 hover:bg-blue-500 hover:text-white transition-colors disabled:opacity-50"
                                                >
                                                    <Pencil className="h-3 w-3" />
                                                    RESCHEDULE
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                                                    disabled={processingId === booking.id}
                                                    className="border border-red-500 px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] text-red-500 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
                                                >
                                                    CANCEL
                                                </button>
                                            </div>
                                        )}

                                        {/* RESCHEDULED - show reschedule button */}
                                        {booking.status === 'rescheduled' && (
                                            <div className="flex gap-3 pt-2 border-t border-black/10">
                                                <button
                                                    onClick={() => startEdit(booking)}
                                                    disabled={processingId === booking.id}
                                                    className="flex items-center gap-2 border border-blue-500 px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] text-blue-500 hover:bg-blue-500 hover:text-white transition-colors disabled:opacity-50"
                                                >
                                                    <Pencil className="h-3 w-3" />
                                                    RESCHEDULE AGAIN
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}