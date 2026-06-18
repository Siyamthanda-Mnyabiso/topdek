import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { Loader2, Pencil, Trash2, X, Plus, ImagePlus } from 'lucide-react'

interface Service {
    id: string
    provider_id: string
    title: string
    description: string | null
    price: number
    duration: number
    is_active: boolean
    image_url: string | null
    category: string | null
}

interface ServiceImage {
    id: string
    service_id: string
    image_url: string
    position: number
}

interface ServiceFormData {
    title: string
    description: string
    price: string
    duration: string
    category: string
}

const CATEGORIES = [
    'Barbers',
    'Hair Styles',
    'Braids',
    'Nails',
    'Makeup',
    'Lashes',
    'Skincare',
    'Other',
]

const MAX_IMAGES = 3

const initialFormData: ServiceFormData = {
    title: '',
    description: '',
    price: '',
    duration: '',
    category: ''
}

// One slot in the image picker: either an already-saved image (has `id`),
// a freshly picked file waiting to upload (has `file` + local preview url),
// or empty.
interface ImageSlot {
    id: string | null
    file: File | null
    previewUrl: string | null
}

const emptySlots = (): ImageSlot[] =>
    Array.from({ length: MAX_IMAGES }, () => ({ id: null, file: null, previewUrl: null }))

export function ServicesPage() {
    const { profile } = useAuth()
    const [providerId, setProviderId] = useState<string | null>(null)
    const [services, setServices] = useState<Service[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [formData, setFormData] = useState<ServiceFormData>(initialFormData)
    const [error, setError] = useState<string | null>(null)

    const [imageSlots, setImageSlots] = useState<ImageSlot[]>(emptySlots())
    const fileInputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)]

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
        setImageSlots(emptySlots())
        fileInputRefs.forEach(ref => { if (ref.current) ref.current.value = '' })
    }, [])

    const handleInputChange = useCallback((
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }, [])

    const handleImageSelect = useCallback((slotIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            setError('Please select an image file')
            return
        }
        if (file.size > 5 * 1024 * 1024) {
            setError('Image must be smaller than 5MB')
            return
        }

        setImageSlots(prev => {
            const next = [...prev]
            next[slotIndex] = { id: null, file, previewUrl: URL.createObjectURL(file) }
            return next
        })
        setError(null)
    }, [])

    const clearSlot = useCallback((slotIndex: number) => {
        setImageSlots(prev => {
            const next = [...prev]
            next[slotIndex] = { id: null, file: null, previewUrl: null }
            return next
        })
        const ref = fileInputRefs[slotIndex]
        if (ref.current) ref.current.value = ''
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

    // Uploads any new files in imageSlots to storage, returns the final
    // ordered list of public URLs (mix of existing + newly uploaded).
    const uploadImageSlots = useCallback(async (providerIdForPath: string): Promise<string[]> => {
        const urls: string[] = []

        for (const slot of imageSlots) {
            if (slot.file) {
                const fileExt = slot.file.name.split('.').pop()
                const fileName = `${providerIdForPath}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`

                const { error: uploadError } = await supabase.storage
                    .from('service-images')
                    .upload(fileName, slot.file, { upsert: false })

                if (uploadError) throw uploadError

                const { data } = supabase.storage.from('service-images').getPublicUrl(fileName)
                urls.push(data.publicUrl)
            } else if (slot.previewUrl && slot.id) {
                // Existing saved image kept as-is
                urls.push(slot.previewUrl)
            }
        }

        return urls
    }, [imageSlots])

    const saveService = useCallback(async () => {
        if (!providerId) return
        if (!validateForm()) return

        setIsSubmitting(true)
        setError(null)

        try {
            const imageUrls = await uploadImageSlots(providerId)
            const coverImageUrl = imageUrls[0] ?? null

            const serviceData = {
                title: formData.title.trim(),
                description: formData.description.trim() || null,
                price: Number(formData.price),
                duration: Number(formData.duration),
                category: formData.category || null,
                image_url: coverImageUrl, // kept as a quick "cover" fallback
            }

            let serviceId = editingId

            if (editingId) {
                const { error } = await supabase
                    .from('services')
                    .update(serviceData)
                    .eq('id', editingId)

                if (error) throw error

                // Replace the full gallery: simplest correct approach given
                // slots can be reordered/removed/replaced freely in the UI.
                const { error: deleteImagesError } = await supabase
                    .from('service_images')
                    .delete()
                    .eq('service_id', editingId)
                if (deleteImagesError) throw deleteImagesError
            } else {
                const { data, error } = await supabase
                    .from('services')
                    .insert({
                        ...serviceData,
                        provider_id: providerId,
                        is_active: true,
                    })
                    .select('id')
                    .single()

                if (error) throw error
                serviceId = data.id
            }

            if (serviceId && imageUrls.length > 0) {
                const rows = imageUrls.map((url, position) => ({
                    service_id: serviceId,
                    image_url: url,
                    position,
                }))
                const { error: insertImagesError } = await supabase
                    .from('service_images')
                    .insert(rows)
                if (insertImagesError) throw insertImagesError
            }

            resetForm()
            await fetchServices(providerId)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save service')
        } finally {
            setIsSubmitting(false)
        }
    }, [providerId, formData, editingId, validateForm, resetForm, fetchServices, uploadImageSlots])

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

    const startEdit = useCallback(async (service: Service) => {
        setEditingId(service.id)
        setFormData({
            title: service.title,
            description: service.description ?? '',
            price: String(service.price),
            duration: String(service.duration),
            category: service.category ?? '',
        })
        setError(null)

        // Load this service's existing gallery into the slots
        try {
            const { data, error } = await supabase
                .from('service_images')
                .select('*')
                .eq('service_id', service.id)
                .order('position', { ascending: true })

            if (error) throw error

            const existing = (data ?? []) as ServiceImage[]
            const slots = emptySlots()
            existing.slice(0, MAX_IMAGES).forEach((img, i) => {
                slots[i] = { id: img.id, file: null, previewUrl: img.image_url }
            })
            setImageSlots(slots)
        } catch (err) {
            setImageSlots(emptySlots())
        }
    }, [])

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
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Services</h1>
                <p className="text-sm text-zinc-500 mt-1">
                    Create and manage what your business offers
                </p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm flex items-center justify-between">
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
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
                    <div className="lg:col-span-1">
                        <div className="bg-white border rounded-lg p-6 sticky top-6">
                            <h2 className="text-lg font-semibold mb-4">
                                {editingId ? 'Edit Service' : 'Add New Service'}
                            </h2>

                            <div className="space-y-4">
                                {/* Image slots */}
                                <div>
                                    <label className="block text-xs font-medium text-zinc-500 mb-1.5">
                                        Service Images (up to {MAX_IMAGES})
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {imageSlots.map((slot, i) => (
                                            <div key={i}>
                                                <input
                                                    ref={fileInputRefs[i]}
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleImageSelect(i, e)}
                                                    disabled={isSubmitting}
                                                    className="hidden"
                                                    id={`service-image-input-${i}`}
                                                />
                                                {slot.previewUrl ? (
                                                    <div className="relative w-full aspect-square rounded-md overflow-hidden border group">
                                                        <img
                                                            src={slot.previewUrl}
                                                            alt={`Service image ${i + 1}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => clearSlot(i)}
                                                            disabled={isSubmitting}
                                                            className="absolute top-1 right-1 p-1 bg-black/70 text-white rounded-full hover:bg-black transition-colors"
                                                            aria-label="Remove image"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <label
                                                        htmlFor={`service-image-input-${i}`}
                                                        className="flex flex-col items-center justify-center gap-1 w-full aspect-square rounded-md border-2 border-dashed border-zinc-200 hover:border-zinc-300 cursor-pointer transition-colors text-zinc-400"
                                                    >
                                                        <ImagePlus className="w-4 h-4" />
                                                    </label>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <p className="mt-1.5 text-[11px] text-zinc-400">
                                        First image is used as the cover photo.
                                    </p>
                                </div>

                                <input
                                    name="title"
                                    className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                                    placeholder="Service title *"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    disabled={isSubmitting}
                                />

                                <select
                                    name="category"
                                    className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white text-zinc-700"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    disabled={isSubmitting}
                                >
                                    <option value="">Select category</option>
                                    {CATEGORIES.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>

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
                                        <>{editingId ? 'Update Service' : 'Add Service'}</>
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
                                        <div className="flex items-start gap-4 flex-1 min-w-0">
                                            {service.image_url ? (
                                                <img
                                                    src={service.image_url}
                                                    alt={service.title}
                                                    className="w-16 h-16 rounded-md object-cover border flex-shrink-0"
                                                />
                                            ) : (
                                                <div className="w-16 h-16 rounded-md border border-dashed flex items-center justify-center flex-shrink-0 text-zinc-300">
                                                    <ImagePlus className="w-5 h-5" />
                                                </div>
                                            )}

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h3 className="font-semibold truncate">
                                                        {service.title}
                                                    </h3>
                                                    {service.category && (
                                                        <span className="text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200">
                                                            {service.category}
                                                        </span>
                                                    )}
                                                </div>
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
                                        </div>

                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <button
                                                onClick={() => void startEdit(service)}
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