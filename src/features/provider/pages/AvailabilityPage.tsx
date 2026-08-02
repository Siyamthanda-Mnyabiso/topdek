import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { Plus, Trash2, Clock, X, Pencil, Check } from 'lucide-react'

interface AvailabilitySlot {
    id?: string
    specific_date: string
    start_time: string
    end_time: string
    is_available: boolean
}

interface DateTimeDraft {
    startTime: string
    endTime: string
}

// Formats a Date using its local Y/M/D — avoids the day shifting backward
// when toISOString() converts local midnight to UTC in timezones ahead of it.
function toLocalDateString(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

// Parses a "YYYY-MM-DD" string as a local date instead of UTC midnight —
// `new Date(dateStr)` shifts the displayed day backward in timezones behind UTC.
function parseLocalDate(dateStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number)
    return new Date(year, month - 1, day)
}

export function AvailabilityPage() {
    const { profile, isLoading: authLoading } = useAuth()
    const navigate = useNavigate()

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [providerProfileId, setProviderProfileId] = useState<string | null>(null)
    const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([])
    const [selectedDates, setSelectedDates] = useState<string[]>([])
    const [dateTimes, setDateTimes] = useState<Record<string, DateTimeDraft>>({})
    const [defaultStartTime, setDefaultStartTime] = useState('09:00')
    const [defaultEndTime, setDefaultEndTime] = useState('17:00')
    const [showAddForm, setShowAddForm] = useState(false)
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [availableDates, setAvailableDates] = useState<string[]>([])
    const [editingSlotId, setEditingSlotId] = useState<string | null>(null)
    const [editStartTime, setEditStartTime] = useState('')
    const [editEndTime, setEditEndTime] = useState('')
    const [editError, setEditError] = useState<string | null>(null)

    useEffect(() => {
        if (authLoading) return
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
    }, [profile, authLoading, navigate])

    function toggleDateSelection(dateStr: string) {
        setSelectedDates(prev => {
            if (prev.includes(dateStr)) {
                setDateTimes(times => {
                    const next = { ...times }
                    delete next[dateStr]
                    return next
                })
                return prev.filter(d => d !== dateStr)
            }

            setDateTimes(times => ({
                ...times,
                [dateStr]: { startTime: defaultStartTime, endTime: defaultEndTime }
            }))
            return [...prev, dateStr].sort()
        })
    }

    function removeSelectedDate(dateStr: string) {
        setSelectedDates(prev => prev.filter(d => d !== dateStr))
        setDateTimes(times => {
            const next = { ...times }
            delete next[dateStr]
            return next
        })
    }

    function updateDraftTime(dateStr: string, field: 'startTime' | 'endTime', value: string) {
        setDateTimes(times => ({
            ...times,
            [dateStr]: { ...times[dateStr], [field]: value }
        }))
    }

    async function handleAddSlots() {
        if (!providerProfileId) return
        if (selectedDates.length === 0) {
            setError('Please select at least one date')
            return
        }

        for (const dateStr of selectedDates) {
            const draft = dateTimes[dateStr]
            if (!draft?.startTime || !draft?.endTime) {
                setError('Please set start and end times for every selected date')
                return
            }
            if (draft.startTime >= draft.endTime) {
                setError(`End time must be after start time for ${parseLocalDate(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`)
                return
            }
        }

        setSaving(true)
        setError(null)

        const rows = selectedDates.map(dateStr => ({
            provider_profile_id: providerProfileId,
            specific_date: dateStr,
            start_time: dateTimes[dateStr].startTime,
            end_time: dateTimes[dateStr].endTime,
            is_available: true
        }))

        const { data, error } = await supabase
            .from('provider_availability')
            .insert(rows)
            .select()

        if (error) {
            setError(error.message)
            setSaving(false)
            return
        }

        setAvailabilitySlots([...availabilitySlots, ...(data || [])])
        setAvailableDates([...new Set([...availableDates, ...selectedDates])])
        setShowAddForm(false)
        setSelectedDates([])
        setDateTimes({})
        setDefaultStartTime('09:00')
        setDefaultEndTime('17:00')
        setSuccess(true)
        setSaving(false)

        setTimeout(() => setSuccess(false), 3000)
    }

    function startEditSlot(slot: AvailabilitySlot) {
        setEditingSlotId(slot.id ?? null)
        setEditStartTime(slot.start_time)
        setEditEndTime(slot.end_time)
        setEditError(null)
    }

    function cancelEditSlot() {
        setEditingSlotId(null)
        setEditError(null)
    }

    async function handleSaveEditSlot(id: string) {
        if (!editStartTime || !editEndTime) {
            setEditError('Please set both start and end times')
            return
        }
        if (editStartTime >= editEndTime) {
            setEditError('End time must be after start time')
            return
        }

        const { error } = await supabase
            .from('provider_availability')
            .update({ start_time: editStartTime, end_time: editEndTime })
            .eq('id', id)

        if (error) {
            setEditError(error.message)
            return
        }

        setAvailabilitySlots(slots =>
            slots.map(slot =>
                slot.id === id
                    ? { ...slot, start_time: editStartTime, end_time: editEndTime }
                    : slot
            )
        )
        setEditingSlotId(null)
        setEditError(null)
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
            const dateStr = toLocalDateString(date)
            const isPast = date < today
            const hasAvailability = availableDates.includes(dateStr)
            const isSelected = selectedDates.includes(dateStr)

            days.push(
                <button
                    key={day}
                    onClick={() => !isPast && toggleDateSelection(dateStr)}
                    disabled={isPast}
                    className={`h-10 rounded-md text-sm font-medium transition-colors ${
                        isPast
                            ? 'text-gray-300 cursor-not-allowed'
                            : isSelected
                                ? 'bg-black text-white hover:bg-gray-800'
                                : hasAvailability
                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
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
                <div data-tour="availability-section" className="border border-black/20 p-6">
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
                                    SELECT DATES
                                </label>
                                <p className="text-xs text-black/40 mb-3">
                                    Tap as many dates as you like — you can set different times for each one below.
                                </p>
                                <div className="border border-black/20 p-3 sm:p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <button
                                            onClick={() => changeMonth(-1)}
                                            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                                        >
                                            ←
                                        </button>
                                        <span className="font-bold uppercase tracking-widest text-sm sm:text-base">
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
                                </div>
                            </div>

                            {/* Default time for newly selected dates */}
                            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold tracking-[0.15em] uppercase text-black/40">
                                        DEFAULT START
                                    </label>
                                    <input
                                        type="time"
                                        value={defaultStartTime}
                                        onChange={(e) => setDefaultStartTime(e.target.value)}
                                        className="w-full border border-black px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold tracking-[0.15em] uppercase text-black/40">
                                        DEFAULT END
                                    </label>
                                    <input
                                        type="time"
                                        value={defaultEndTime}
                                        onChange={(e) => setDefaultEndTime(e.target.value)}
                                        className="w-full border border-black px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black"
                                    />
                                </div>
                            </div>

                            {/* Selected dates - each editable individually, like a booking calendar */}
                            {selectedDates.length > 0 && (
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold tracking-[0.15em] uppercase text-black/40">
                                        {selectedDates.length} DATE{selectedDates.length > 1 ? 'S' : ''} SELECTED — EDIT TIMES BELOW
                                    </label>
                                    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                                        {selectedDates.map((dateStr) => {
                                            const draft = dateTimes[dateStr]
                                            return (
                                                <div
                                                    key={dateStr}
                                                    className="flex flex-col gap-2 border border-black/20 p-3 sm:flex-row sm:items-center sm:justify-between"
                                                >
                                                    <span className="text-sm font-bold">
                                                        {parseLocalDate(dateStr).toLocaleDateString('en-US', {
                                                            weekday: 'short',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="time"
                                                            value={draft?.startTime ?? ''}
                                                            onChange={(e) => updateDraftTime(dateStr, 'startTime', e.target.value)}
                                                            className="w-full min-w-0 border border-black px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-black sm:w-auto"
                                                        />
                                                        <span className="text-black/30 text-xs">TO</span>
                                                        <input
                                                            type="time"
                                                            value={draft?.endTime ?? ''}
                                                            onChange={(e) => updateDraftTime(dateStr, 'endTime', e.target.value)}
                                                            className="w-full min-w-0 border border-black px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-black sm:w-auto"
                                                        />
                                                        <button
                                                            onClick={() => removeSelectedDate(dateStr)}
                                                            aria-label="Remove date"
                                                            className="p-1 text-black/30 hover:text-red-500 transition-colors shrink-0"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col gap-3 sm:flex-row">
                                <button
                                    onClick={() => void handleAddSlots()}
                                    disabled={saving || selectedDates.length === 0}
                                    className="flex-1 border border-black bg-black px-6 py-2 text-xs font-bold tracking-[0.15em] uppercase text-white hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {saving
                                        ? 'SAVING...'
                                        : selectedDates.length > 1
                                            ? `ADD ${selectedDates.length} DATES`
                                            : 'ADD AVAILABILITY'}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowAddForm(false)
                                        setSelectedDates([])
                                        setDateTimes({})
                                        setDefaultStartTime('09:00')
                                        setDefaultEndTime('17:00')
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
                                        {parseLocalDate(date).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </h3>
                                    <div className="space-y-2">
                                        {groupedSlots[date].map((slot) => {
                                            const isEditing = editingSlotId === slot.id

                                            if (isEditing) {
                                                return (
                                                    <div
                                                        key={slot.id}
                                                        className="flex flex-col gap-2 border border-black px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="time"
                                                                value={editStartTime}
                                                                onChange={(e) => setEditStartTime(e.target.value)}
                                                                className="w-full min-w-0 border border-black px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-black sm:w-auto"
                                                            />
                                                            <span className="text-black/30 text-xs">TO</span>
                                                            <input
                                                                type="time"
                                                                value={editEndTime}
                                                                onChange={(e) => setEditEndTime(e.target.value)}
                                                                className="w-full min-w-0 border border-black px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-black sm:w-auto"
                                                            />
                                                        </div>
                                                        {editError && (
                                                            <p className="text-xs font-semibold text-red-600">{editError}</p>
                                                        )}
                                                        <div className="flex items-center gap-2 self-end sm:self-auto">
                                                            <button
                                                                onClick={() => void handleSaveEditSlot(slot.id!)}
                                                                aria-label="Save times"
                                                                className="p-1.5 border border-green-500 text-green-600 hover:bg-green-500 hover:text-white transition-colors"
                                                            >
                                                                <Check className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={cancelEditSlot}
                                                                aria-label="Cancel edit"
                                                                className="p-1.5 border border-black/20 text-black/40 hover:border-black hover:text-black transition-colors"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )
                                            }

                                            return (
                                                <div
                                                    key={slot.id}
                                                    className={`flex flex-col gap-2 border px-4 py-2 sm:flex-row sm:items-center sm:justify-between ${
                                                        slot.is_available ? 'border-black/20' : 'border-red-200 bg-red-50/50'
                                                    }`}
                                                >
                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
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

                                                    <div className="flex items-center gap-2 self-end sm:self-auto">
                                                        <button
                                                            onClick={() => startEditSlot(slot)}
                                                            aria-label="Edit times"
                                                            className="p-1 hover:text-black transition-colors"
                                                        >
                                                            <Pencil className="h-4 w-4 text-black/30 hover:text-black" />
                                                        </button>
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
                                            )
                                        })}
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