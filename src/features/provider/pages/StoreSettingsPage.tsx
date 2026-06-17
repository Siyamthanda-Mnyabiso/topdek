import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { Camera, Upload } from 'lucide-react'

interface StoreForm {
    business_name: string
    description: string
    location: string
    phone: string
    logo_url: string
    cover_image_url: string
}

export function StoreSettingsPage() {
    const { profile } = useAuth()
    const navigate = useNavigate()

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [providerProfileId, setProviderProfileId] = useState<string | null>(null)

    const [form, setForm] = useState<StoreForm>({
        business_name: '',
        description: '',
        location: '',
        phone: '',
        logo_url: '',
        cover_image_url: '',
    })

    const [coverPreview, setCoverPreview] = useState<string | null>(null)
    const [logoPreview, setLogoPreview] = useState<string | null>(null)
    const [coverUploading, setCoverUploading] = useState(false)
    const [logoUploading, setLogoUploading] = useState(false)

    const coverInputRef = useRef<HTMLInputElement>(null)
    const logoInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (!profile) return
        void loadStore()
    }, [profile])

    async function loadStore() {
        if (!profile) return

        const { data, error } = await supabase
            .from('provider_profiles')
            .select('*')
            .eq('user_id', profile.id)
            .single()

        if (error || !data) {
            navigate('/provider/setup')
            return
        }

        setProviderProfileId(data.id)
        setForm({
            business_name: data.business_name ?? '',
            description: data.description ?? '',
            location: data.location ?? '',
            phone: data.phone ?? '',
            logo_url: data.logo_url ?? '',
            cover_image_url: data.cover_image_url ?? '',
        })
        setCoverPreview(data.cover_image_url ?? null)
        setLogoPreview(data.logo_url ?? null)
        setLoading(false)
    }

    async function uploadImage(
        file: File,
        bucket: string,
        path: string,
    ): Promise<string | null> {
        const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(path, file, { upsert: true })

        if (uploadError) {
            setError(uploadError.message)
            return null
        }

        const { data } = supabase.storage.from(bucket).getPublicUrl(path)
        return data.publicUrl
    }

    async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file || !providerProfileId) return

        setCoverUploading(true)
        setError(null)

        const preview = URL.createObjectURL(file)
        setCoverPreview(preview)

        const path = `covers/${providerProfileId}-${Date.now()}`
        const url = await uploadImage(file, 'provider-assets', path)

        if (url) {
            setForm((prev) => ({ ...prev, cover_image_url: url }))
        }

        setCoverUploading(false)
    }

    async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file || !providerProfileId) return

        setLogoUploading(true)
        setError(null)

        const preview = URL.createObjectURL(file)
        setLogoPreview(preview)

        const path = `logos/${providerProfileId}-${Date.now()}`
        const url = await uploadImage(file, 'provider-assets', path)

        if (url) {
            setForm((prev) => ({ ...prev, logo_url: url }))
        }

        setLogoUploading(false)
    }

    async function handleSave() {
        if (!profile) return

        setSaving(true)
        setError(null)
        setSuccess(false)

        const { error } = await supabase
            .from('provider_profiles')
            .update(form)
            .eq('user_id', profile.id)

        if (error) {
            setError(error.message)
            setSaving(false)
            return
        }

        setSuccess(true)
        setSaving(false)
        setTimeout(() => setSuccess(false), 3000)
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

    return (
        <div className="min-h-screen bg-white">

            {/* HEADER */}
            <div className="border-b border-black px-6 md:px-12 lg:px-20 py-12">
                <p className="text-xs font-semibold tracking-[0.3em] uppercase text-black/40">TOPDECK</p>
                <h1 className="mt-2 text-4xl md:text-6xl font-black uppercase tracking-tight">
                    STORE SETTINGS
                </h1>
                <p className="mt-3 text-sm text-black/50">
                    Update your public profile that clients see on the marketplace.
                </p>
            </div>

            <div className="px-6 md:px-12 lg:px-20 py-12 max-w-3xl space-y-12">

                {error && (
                    <p className="border border-red-500 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-red-600">
                        {error}
                    </p>
                )}

                {success && (
                    <p className="border border-black bg-black px-4 py-3 text-xs font-semibold uppercase tracking-wide text-white">
                        ✓ STORE UPDATED SUCCESSFULLY
                    </p>
                )}

                {/* COVER PHOTO */}
                <div>
                    <h2 className="text-xs font-bold tracking-[0.3em] uppercase text-black/40 mb-4">
                        COVER PHOTO
                    </h2>
                    <div
                        onClick={() => coverInputRef.current?.click()}
                        className="relative h-52 w-full border-2 border-dashed border-black/20 cursor-pointer overflow-hidden hover:border-black transition-colors group"
                    >
                        {coverPreview ? (
                            <>
                                <img
                                    src={coverPreview}
                                    alt="Cover"
                                    className="h-full w-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <div className="flex items-center gap-2 text-white text-xs font-bold tracking-[0.15em] uppercase">
                                        <Camera className="h-4 w-4" />
                                        CHANGE PHOTO
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="h-full w-full flex flex-col items-center justify-center gap-3 text-black/30">
                                <Upload className="h-8 w-8" />
                                <p className="text-xs font-bold tracking-[0.15em] uppercase">
                                    {coverUploading ? 'UPLOADING...' : 'CLICK TO UPLOAD COVER PHOTO'}
                                </p>
                                <p className="text-xs text-black/20">Recommended: 1600 × 400px</p>
                            </div>
                        )}
                        {coverUploading && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <div className="h-6 w-6 border-2 border-white border-t-transparent animate-spin" />
                            </div>
                        )}
                    </div>
                    <input
                        ref={coverInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => void handleCoverChange(e)}
                    />
                </div>

                {/* LOGO */}
                <div>
                    <h2 className="text-xs font-bold tracking-[0.3em] uppercase text-black/40 mb-4">
                        LOGO / PROFILE PHOTO
                    </h2>
                    <div className="flex items-center gap-6">
                        <div
                            onClick={() => logoInputRef.current?.click()}
                            className="relative h-24 w-24 border-2 border-dashed border-black/20 cursor-pointer overflow-hidden hover:border-black transition-colors group shrink-0"
                        >
                            {logoPreview ? (
                                <>
                                    <img
                                        src={logoPreview}
                                        alt="Logo"
                                        className="h-full w-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Camera className="h-4 w-4 text-white" />
                                    </div>
                                </>
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-black/20">
                                    <Upload className="h-6 w-6" />
                                </div>
                            )}
                            {logoUploading && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                    <div className="h-4 w-4 border-2 border-white border-t-transparent animate-spin" />
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="text-xs font-bold tracking-[0.15em] uppercase">
                                {logoUploading ? 'UPLOADING...' : 'CLICK TO UPLOAD LOGO'}
                            </p>
                            <p className="mt-1 text-xs text-black/30">
                                Square image recommended. Shown on your profile and cards.
                            </p>
                        </div>
                    </div>
                    <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => void handleLogoChange(e)}
                    />
                </div>

                {/* STORE INFO */}
                <div className="space-y-6">
                    <h2 className="text-xs font-bold tracking-[0.3em] uppercase text-black/40">
                        STORE INFO
                    </h2>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold tracking-[0.15em] uppercase">
                            BUSINESS NAME *
                        </label>
                        <input
                            type="text"
                            value={form.business_name}
                            onChange={(e) => setForm({ ...form, business_name: e.target.value })}
                            placeholder="e.g. Cuts by Siya"
                            className="w-full border border-black px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-black"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold tracking-[0.15em] uppercase">
                            DESCRIPTION
                        </label>
                        <textarea
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            placeholder="Describe your services and expertise..."
                            rows={4}
                            className="w-full border border-black px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-black resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold tracking-[0.15em] uppercase">
                                LOCATION
                            </label>
                            <input
                                type="text"
                                value={form.location}
                                onChange={(e) => setForm({ ...form, location: e.target.value })}
                                placeholder="Cape Town"
                                className="w-full border border-black px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-black"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold tracking-[0.15em] uppercase">
                                PHONE
                            </label>
                            <input
                                type="tel"
                                value={form.phone}
                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                placeholder="+27 82 000 0000"
                                className="w-full border border-black px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-black"
                            />
                        </div>
                    </div>
                </div>

                {/* SAVE */}
                <div className="flex gap-4 pb-12">
                    <button
                        onClick={() => void handleSave()}
                        disabled={saving || coverUploading || logoUploading}
                        className="flex-1 border border-black bg-black py-3 text-xs font-bold tracking-[0.15em] uppercase text-white transition-colors hover:bg-white hover:text-black disabled:opacity-50"
                    >
                        {saving ? 'SAVING...' : 'SAVE CHANGES'}
                    </button>
                    <button
                        onClick={() => navigate('/provider')}
                        className="border border-black/20 px-6 py-3 text-xs font-bold tracking-[0.15em] uppercase text-black/40 transition-colors hover:border-black hover:text-black"
                    >
                        CANCEL
                    </button>
                </div>
            </div>
        </div>
    )
}