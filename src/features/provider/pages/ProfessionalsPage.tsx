import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Search } from 'lucide-react'

interface ProviderProfile {

    id: string
    business_name: string
    user_id: string
    description: string | null
    location: string | null
    logo_url: string | null
    cover_image_url: string | null
    created_at: string
}

const CATEGORIES = [
    'All',
    'Barbers',
    'Hair Stylists',
    'Beard Grooming',
    'Braiders',
    'Nail Techs',
    'Makeup Artists',
    'Lash Techs',
    'Skincare',
]

export function ProfessionalsPage() {
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()
    const [professionals, setProfessionals] = useState<ProviderProfile[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    const activeCategory = searchParams.get('type') ?? 'all'

    useEffect(() => {
        const fetchProfessionals = async () => {
            setLoading(true)

            const { data, error } = await supabase
                .from('provider_profiles')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Error fetching professionals:', error.message)
                setProfessionals([])
            } else {
                setProfessionals(data ?? [])
            }

            setLoading(false)
        }

        void fetchProfessionals()
    }, [])

    const filtered = professionals.filter((pro) => {
        const matchesSearch =
            search === '' ||
            pro.business_name.toLowerCase().includes(search.toLowerCase()) ||
            pro.location?.toLowerCase().includes(search.toLowerCase()) ||
            pro.description?.toLowerCase().includes(search.toLowerCase())

        return matchesSearch
    })

    function setCategory(cat: string) {
        if (cat === 'All') {
            searchParams.delete('type')
        } else {
            searchParams.set('type', cat.toLowerCase().replace(/\s/g, '-'))
        }
        setSearchParams(searchParams)
    }

    return (
        <div className="bg-white min-h-screen">

            {/* PAGE HEADER */}
            <div className="border-b border-black px-6 md:px-12 lg:px-20 py-16">
                <p className="text-xs font-semibold tracking-[0.3em] uppercase text-black/40">TOPDEK</p>
                <h1 className="mt-2 text-5xl md:text-7xl font-black uppercase tracking-tight">
                    PROFESSIONALS
                </h1>
                <p className="mt-4 text-sm text-black/50 tracking-wide max-w-md">
                    Browse verified service providers and book your next experience.
                </p>
            </div>

            {/* SEARCH + FILTERS */}
            <div className="sticky top-16 z-40 bg-white border-b border-black">
                <div className="px-6 md:px-12 lg:px-20 py-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">

                    {/* SEARCH */}
                    <div className="relative w-full sm:max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name or location..."
                            className="w-full border border-black pl-9 pr-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-black"
                        />
                    </div>

                    {/* CATEGORY PILLS */}
                    <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
                        {CATEGORIES.map((cat) => {
                            const slug = cat === 'All' ? 'all' : cat.toLowerCase().replace(/\s/g, '-')
                            const isActive = activeCategory === slug
                            return (
                                <button
                                    key={cat}
                                    onClick={() => setCategory(cat)}
                                    className={`whitespace-nowrap border px-3 py-1.5 text-xs font-bold tracking-[0.1em] uppercase transition-colors ${
                                        isActive
                                            ? 'border-black bg-black text-white'
                                            : 'border-black/30 text-black/50 hover:border-black hover:text-black'
                                    }`}
                                >
                                    {cat}
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* RESULTS */}
            <div className="px-6 md:px-12 lg:px-20 py-12">

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="border border-black/10 animate-pulse">
                                <div className="h-48 bg-zinc-100" />
                                <div className="p-4 space-y-2">
                                    <div className="h-4 bg-zinc-100 w-3/4" />
                                    <div className="h-3 bg-zinc-100 w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-24 text-center">
                        <p className="text-xs font-semibold tracking-[0.3em] uppercase text-black/30">
                            {search ? `NO RESULTS FOR "${search.toUpperCase()}"` : 'NO PROFESSIONALS LISTED YET.'}
                        </p>
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="mt-4 text-xs font-bold tracking-[0.15em] uppercase underline-offset-4 hover:underline"
                            >
                                CLEAR SEARCH
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <p className="mb-8 text-xs font-semibold tracking-[0.2em] uppercase text-black/40">
                            {filtered.length} PROFESSIONAL{filtered.length !== 1 ? 'S' : ''}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filtered.map((pro) => (
                                <div
                                    key={pro.id}
                                    onClick={() => navigate(`/professionals/${pro.id}`)}
                                    className="group cursor-pointer border border-black hover:shadow-lg transition-shadow"
                                >
                                    {/* COVER IMAGE */}
                                    <div className="relative h-52 overflow-hidden bg-zinc-100">
                                        {pro.cover_image_url ? (
                                            <img
                                                src={pro.cover_image_url}
                                                alt={pro.business_name}
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="h-full w-full bg-zinc-900 flex items-end p-4">
                        <span className="text-xs font-bold tracking-[0.2em] uppercase text-white/30">
                          NO PHOTO
                        </span>
                                            </div>
                                        )}

                                        {/* LOGO */}
                                        {pro.logo_url && (
                                            <div className="absolute bottom-3 left-3 h-10 w-10 border-2 border-white overflow-hidden bg-white">
                                                <img
                                                    src={pro.logo_url}
                                                    alt={`${pro.business_name} logo`}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* INFO */}
                                    <div className="p-5">
                                        <h3 className="font-black uppercase tracking-tight text-lg leading-tight">
                                            {pro.business_name}
                                        </h3>
                                        {pro.location && (
                                            <p className="mt-1 text-xs tracking-[0.15em] uppercase text-black/40">
                                                {pro.location}
                                            </p>
                                        )}
                                        {pro.description && (
                                            <p className="mt-3 text-sm text-black/60 line-clamp-2 leading-relaxed">
                                                {pro.description}
                                            </p>
                                        )}
                                        <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs font-bold tracking-[0.15em] uppercase text-black/30 group-hover:text-black transition-colors">
                        VIEW PROFILE →
                      </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}