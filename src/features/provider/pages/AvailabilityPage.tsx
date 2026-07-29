import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { Plus, Trash2, Clock } from 'lucide-react'

interface AvailabilitySlot {
    id?: string
    specific_date: string
    start_time: string
    end_time: string
    is_available: boolean
}

export function AvailabilityPage() {
    const { profile } = useAuth()
    const navigate = useNavigate()

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [providerProfileId, setProviderProfileId] = useState<string | null>(null)
    const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([])
    const [selectedDate, setSelectedDate] = useState('')
    const [startTime, setStartTime] = useState('09:00')
    const [endTime, setEndTime] = useState('17:00')
    const [showAddForm, setShowAddForm] = useState(false)
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [availableDates, setAvailableDates] = useState<string[]>([])

    useEffect(() => {
        if (!profile) {
            navigate('/login')
            return
        }

        async function loadAvailability(providerId: string) {
            const { data, error } = await supabase
                .from('provider_availability')
                .select('*')
                .eq('provider_profile_id', providerId)
                .order('specific_date')
                .order('start_time')

            if (error) {
                setError(error.message)
                return
            }

            setAvailabilitySlots(data || [])

            // Extract available dates for highlighting
            const dates = (data || []).map(slot => slot.specific_date)
            setAvailableDates([...new Set(dates)])
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

            setProviderProfileId(data.id)
            await loadAvailability(data.id)
            setLoading(false)
        }

        void loadProviderProfile()
    }, [profile, navigate])

    async function handleAddSlot() {
        if (!providerProfileId) return
        if (!selectedDate) {
            setError('Please select a date')
            return
        }
        if (!startTime || !endTime) {
            setError('Please select start and end times')
            return
        }
        if (startTime >= endTime) {
            setError('End time must be after start time')
            return
        }

        setSaving(true)
        setError(null)

        const { data, error } = await supabase
            .from('provider_availability')
            .insert({
                provider_profile_id: providerProfileId,
                specific_date: selectedDate,
                start_time: startTime,
                end_time: endTime,
                is_available: true
            })
            .select()
            .single()

        if (error) {
            setError(error.message)
            setSaving(false)
            return
        }

        setAvailabilitySlots([...availabilitySlots, data])
        setAvailableDates([...new Set([...availableDates, selectedDate])])
        setShowAddForm(false)
        setSelectedDate('')
        setStartTime('09:00')
        setEndTime('17:00')
        setSuccess(true)
        setSaving(false)

        setTimeout(() => setSuccess(false), 3000)
    }

    async function handleToggleAvailability(id: string, currentStatus: boolean) {
        if (!id) return

        const { error } = await supabase
            .from('provider_availability')
            .update({ is_available: !currentStatus })
            .eq('id', id)

        if (error) {
            setError(error.message)
            return
        }

        setAvailabilitySlots(slots =>
            slots.map(slot =>
                slot.id === id
                    ? { ...slot, is_available: !currentStatus }
                    : slot
            )
        )
    }

    async function handleDeleteSlot(id: string) {
        if (!confirm('Remove this availability slot?')) return

        const { error } = await supabase
            .from('provider_availability')
            .delete()
            .eq('id', id)

        if (error) {
            setError(error.message)
            return
        }

        const updatedSlots = availabilitySlots.filter(slot => slot.id !== id)
        setAvailabilitySlots(updatedSlots)

        // Update available dates
        const dates = updatedSlots.map(slot => slot.specific_date)
        setAvailableDates([...new Set(dates)])
    }

    // Calendar rendering
    function renderCalendar() {
        const year = currentMonth.getFullYear()
        const month = currentMonth.getMonth()
        const firstDay = new Date(year, month, 1).getDay()
        const daysInMonth = new Date(year, month + 1, 0).getDate()
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const days = []

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-10" />)
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day)
            const dateStr = date.toISOString().split('T')[0]
            const isPast = date < today
            const hasAvailability = availableDates.includes(dateStr)
            const isSelected = dateStr === selectedDate

            days.push(
                <button
                    key={day}
                    onClick={() => !isPast && setSelectedDate(dateStr)}
                    disabled={isPast}
                    className={`h-10 rounded-md text-sm font-medium transition-colors ${
                        isPast
                            ? 'text-gray-300 cursor-not-allowed'
                            : hasAvailability
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : isSelected
                                    ? 'bg-black text-white hover:bg-gray-800'
                                    : 'hover:bg-gray-100'
                    } ${isSelected ? 'ring-2 ring-black ring-offset-2' : ''}`}
                >
                    {day}
                    {hasAvailability && !isSelected && (
                        <span className="block w-1 h-1 mx-auto mt-0.5 rounded-full bg-green-500" />
                    )}
                </button>
            )
        }

        return days
    }

    function changeMonth(delta: number) {
        const newMonth = new Date(currentMonth)
        newMonth.setMonth(newMonth.getMonth() + delta)
        setCurrentMonth(newMonth)
    }

    if (loading) {
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

    // Group slots by date for display
    const groupedSlots = availabilitySlots.reduce((groups, slot) => {
        const date = slot.specific_date
        if (!groups[date]) groups[date] = []
        groups[date].push(slot)
        return groups
    }, {} as Record<string, AvailabilitySlot[]>)

    const sortedDates = Object.keys(groupedSlots).sort()

    return (
        <div className="min-h-screen bg-white">
            {/* HEADER */}
            <div className="border-b border-black px-6 md:px-12 lg:px-20 py-12">
                <p className="text-xs font-semibold tracking-[0.3em] uppercase text-black/40">TOPDEK</p>
                <h1 className="mt-2 text-4xl md:text-6xl font-black uppercase tracking-tight">
                    AVAILABILITY
                </h1>
                <p className="mt-3 text-sm text-black/50">
                    Set specific dates and times when you're available for bookings.
                </p>
            </div>

            <div className="px-6 md:px-12 lg:px-20 py-12 max-w-4xl space-y-8">
                {error && (
                    <p className="border border-red-500 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-red-600">
                        {error}
                    </p>
                )}

                {success && (
                    <p className="border border-black bg-black px-4 py-3 text-xs font-semibold uppercase tracking-wide text-white">
                        ✓ AVAILABILITY UPDATED SUCCESSFULLY
                    </p>
                )}

                {/* ADD NEW SLOT */}
                <div className="border border-black/20 p-6">
                    {!showAddForm ? (
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.15em] hover:text-black/60 transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            ADD AVAILABILITY
                        </button>
                    ) : (
                        <div className="space-y-4">
                            {/* Calendar */}
                            <div>
                                <label className="block text-xs font-bold tracking-[0.15em] uppercase text-black/40 mb-3">
                                    SELECT DATE
                                </label>
                                <div className="border border-black/20 p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <button
                                            onClick={() => changeMonth(-1)}
                                            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                                        >
                                            ←
                                        </button>
                                        <span className="font-bold uppercase tracking-widest">
                                            {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                                        </span>
                                        <button
                                            onClick={() => changeMonth(1)}
                                            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                                        >
                                            →
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-7 gap-1 mb-2">
                                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                                            <div key={day} className="h-8 flex items-center justify-center text-xs font-bold uppercase text-black/40">
                                                {day}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-7 gap-1">
                                        {renderCalendar()}
                                    </div>

                                    {selectedDate && (
                                        <div className="mt-3 text-sm text-black/60">
                                            Selected: <span className="font-bold">
                                                {new Date(selectedDate).toLocaleDateString('en-US', {
                                                    weekday: 'long',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Time selection */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold tracking-[0.15em] uppercase text-black/40">
                                        START TIME
                                    </label>
                                    <input
                                        type="time"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        className="w-full border border-black px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold tracking-[0.15em] uppercase text-black/40">
                                        END TIME
                                    </label>
                                    <input
                                        type="time"
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                        className="w-full border border-black px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => void handleAddSlot()}
                                    disabled={saving || !selectedDate}
                                    className="flex-1 border border-black bg-black px-6 py-2 text-xs font-bold tracking-[0.15em] uppercase text-white hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {saving ? 'SAVING...' : 'ADD AVAILABILITY'}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowAddForm(false)
                                        setSelectedDate('')
                                        setStartTime('09:00')
                                        setEndTime('17:00')
                                    }}
                                    className="border border-black/20 px-6 py-2 text-xs font-bold tracking-[0.15em] uppercase text-black/40 hover:border-black hover:text-black transition-colors"
                                >
                                    CANCEL
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* AVAILABILITY SLOTS */}
                <div className="space-y-4">
                    <h2 className="text-xs font-bold tracking-[0.3em] uppercase text-black/40">
                        CURRENT AVAILABILITY
                    </h2>

                    {availabilitySlots.length === 0 ? (
                        <p className="text-sm text-black/30 border border-black/10 px-4 py-8 text-center">
                            No availability slots set. Add your first slot above.
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {sortedDates.map((date) => (
                                <div key={date} className="border border-black/20 p-4">
                                    <h3 className="text-sm font-bold uppercase mb-2">
                                        {new Date(date).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </h3>
                                    <div className="space-y-2">
                                        {groupedSlots[date].map((slot) => (
                                            <div
                                                key={slot.id}
                                                className={`flex items-center justify-between border px-4 py-2 ${
                                                    slot.is_available ? 'border-black/20' : 'border-red-200 bg-red-50/50'
                                                }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Clock className="h-4 w-4 text-black/40" />
                                                        <span>
                                                            {slot.start_time} - {slot.end_time}
                                                        </span>
                                                    </div>
                                                    <span className={`text-xs font-bold uppercase ${
                                                        slot.is_available ? 'text-green-600' : 'text-red-600'
                                                    }`}>
                                                        {slot.is_available ? 'AVAILABLE' : 'UNAVAILABLE'}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleToggleAvailability(slot.id!, slot.is_available)}
                                                        className={`text-xs font-bold uppercase tracking-[0.1em] px-3 py-1 border ${
                                                            slot.is_available
                                                                ? 'border-red-500 text-red-500 hover:bg-red-500 hover:text-white'
                                                                : 'border-green-500 text-green-500 hover:bg-green-500 hover:text-white'
                                                        } transition-colors`}
                                                    >
                                                        {slot.is_available ? 'DISABLE' : 'ENABLE'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteSlot(slot.id!)}
                                                        className="p-1 hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 className="h-4 w-4 text-black/30 hover:text-red-500" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}