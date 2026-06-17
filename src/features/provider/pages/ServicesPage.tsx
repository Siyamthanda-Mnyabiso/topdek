import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { Loader2, Pencil, Trash2, X, Plus } from 'lucide-react'

interface Service {
    id: string
    provider_id: string
    title: string
    description: string | null
    price: number
    duration: number
    is_active: boolean
}

interface ServiceFormData {
    title: string
    description: string
    price: string
    duration: string
}

const initialFormData: ServiceFormData = {
    title: '',
    description: '',
    price: '',
    duration: ''
}

export function ServicesPage() {
    const { profile } = useAuth()
    const [providerId, setProviderId] = useState<string | null>(null)
    const [services, setServices] = useState<Service[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [formData, setFormData] = useState<ServiceFormData>(initialFormData)
    const [error, setError] = useState<string | null>(null)

    // Load provider profile
    useEffect(() => {
        const loadProviderProfile = async () => {
            if (!profile) return

            try {
                const { data, error } = await supabase
                    .from('provider_profiles')
                    .select('id')
                    .eq('user_id', profile.id)
                    .maybeSingle()

                if (error) throw error
                if (!data) {
                    setError('Please create a store first before managing services.')
                    return
                }

                setProviderId(data.id)
                await fetchServices(data.id)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load provider profile')
            }
        }

        loadProviderProfile()
    }, [profile])

    const fetchServices = useCallback(async (id: string) => {
        setIsLoading(true)
        setError(null)

        try {
            const { data, error } = await supabase
                .from('services')
                .select('*')
                .eq('provider_id', id)
                .order('created_at', { ascending: false })

            if (error) throw error
            setServices(data ?? [])
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load services')
            setServices([])
        } finally {
            setIsLoading(false)
        }
    }, [])

    const resetForm = useCallback(() => {
        setFormData(initialFormData)
        setEditingId(null)
        setError(null)
    }, [])

    const handleInputChange = useCallback((
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }, [])

    const validateForm = useCallback((): boolean => {
        const { title, price, duration } = formData
        if (!title.trim() || !price || !duration) {
            setError('Please fill in title, price, and duration')
            return false
        }
        if (Number(price) <= 0) {
            setError('Price must be greater than 0')
            return false
        }
        if (Number(duration) <= 0) {
            setError('Duration must be greater than 0')
            return false
        }
        return true
    }, [formData])

    const saveService = useCallback(async () => {
        if (!providerId) return
        if (!validateForm()) return

        setIsSubmitting(true)
        setError(null)

        try {
            const serviceData = {
                title: formData.title.trim(),
                description: formData.description.trim() || null,
                price: Number(formData.price),
                duration: Number(formData.duration),
            }

            if (editingId) {
                const { error } = await supabase
                    .from('services')
                    .update(serviceData)
                    .eq('id', editingId)

                if (error) throw error
            } else {
                const { error } = await supabase
                    .from('services')
                    .insert({
                        ...serviceData,
                        provider_id: providerId,
                        is_active: true,
                    })

                if (error) throw error
            }

            resetForm()
            await fetchServices(providerId)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save service')
        } finally {
            setIsSubmitting(false)
        }
    }, [providerId, formData, editingId, validateForm, resetForm, fetchServices])

    const deleteService = useCallback(async (id: string, title: string) => {
        if (!confirm(`Delete "${title}"? This action cannot be undone.`)) return

        setError(null)
        try {
            const { error } = await supabase
                .from('services')
                .delete()
                .eq('id', id)

            if (error) throw error
            if (providerId) await fetchServices(providerId)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete service')
        }
    }, [providerId, fetchServices])

    const startEdit = useCallback((service: Service) => {
        setEditingId(service.id)
        setFormData({
            title: service.title,
            description: service.description ?? '',
            price: String(service.price),
            duration: String(service.duration),
        })
        setError(null)
    }, [])

    // Empty state
    if (!profile) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-zinc-400" />
                    <p className="mt-2 text-zinc-500">Loading profile...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-zinc-50 p-6 md:p-10">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Services</h1>
                <p className="text-sm text-zinc-500 mt-1">
                    Create and manage what your business offers
                </p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm flex items-center justify-between">
                    <span>{error}</span>
                    <button
                        onClick={() => setError(null)}
                        className="text-red-500 hover:text-red-700"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {!providerId ? (
                <div className="bg-white border rounded-lg p-8 text-center">
                    <p className="text-zinc-600">
                        You must create a store first before managing services.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-white border rounded-lg p-6 sticky top-6">
                            <h2 className="text-lg font-semibold mb-4">
                                {editingId ? 'Edit Service' : 'Add New Service'}
                            </h2>

                            <div className="space-y-4">
                                <input
                                    name="title"
                                    className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                                    placeholder="Service title *"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    disabled={isSubmitting}
                                />

                                <textarea
                                    name="description"
                                    className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-y"
                                    placeholder="Description (optional)"
                                    rows={3}
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    disabled={isSubmitting}
                                />

                                <input
                                    name="price"
                                    type="number"
                                    className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                                    placeholder="Price (R) *"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    disabled={isSubmitting}
                                    min="0"
                                    step="0.01"
                                />

                                <input
                                    name="duration"
                                    type="number"
                                    className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                                    placeholder="Duration (minutes) *"
                                    value={formData.duration}
                                    onChange={handleInputChange}
                                    disabled={isSubmitting}
                                    min="1"
                                    step="1"
                                />

                                <button
                                    onClick={saveService}
                                    disabled={isSubmitting}
                                    className="w-full bg-black text-white rounded-md py-2.5 text-sm font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            {editingId ? 'Update Service' : 'Add Service'}
                                        </>
                                    )}
                                </button>

                                {editingId && (
                                    <button
                                        onClick={resetForm}
                                        className="w-full border rounded-md py-2.5 text-sm font-medium hover:bg-zinc-50 transition-colors"
                                        disabled={isSubmitting}
                                    >
                                        Cancel Edit
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* List */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">
                                Your Services
                                {services.length > 0 && (
                                    <span className="ml-2 text-sm text-zinc-500 font-normal">
                                        ({services.length})
                                    </span>
                                )}
                            </h2>
                        </div>

                        {isLoading ? (
                            <div className="bg-white border rounded-lg p-8 flex items-center justify-center">
                                <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
                            </div>
                        ) : services.length === 0 ? (
                            <div className="bg-white border rounded-lg p-12 text-center">
                                <div className="flex flex-col items-center gap-2">
                                    <Plus className="w-8 h-8 text-zinc-300" />
                                    <p className="text-zinc-500">No services yet</p>
                                    <p className="text-sm text-zinc-400">
                                        Start by adding your first service
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {services.map((service) => (
                                    <div
                                        key={service.id}
                                        className="bg-white border rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-sm transition-shadow"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold truncate">
                                                {service.title}
                                            </h3>
                                            {service.description && (
                                                <p className="text-sm text-zinc-500 mt-1 line-clamp-2">
                                                    {service.description}
                                                </p>
                                            )}
                                            <div className="mt-2 flex flex-wrap gap-4 text-sm text-zinc-700">
                                                <span className="font-medium text-black">
                                                    R{service.price.toFixed(2)}
                                                </span>
                                                <span className="text-zinc-400">•</span>
                                                <span>{service.duration} min</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <button
                                                onClick={() => startEdit(service)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                                aria-label={`Edit ${service.title}`}
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => deleteService(service.id, service.title)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                aria-label={`Delete ${service.title}`}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}