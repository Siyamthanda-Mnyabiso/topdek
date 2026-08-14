'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import type { ProviderProfile } from '@/types/database'

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
    'Massage Therapists',
]

export function ProfessionalsListClient({
    professionals,
    activeCategory,
}: {
    professionals: ProviderProfile[]
    activeCategory: string
}) {
    const [search, setSearch] = useState('')

    const filtered = professionals.filter((pro) => {
        const matchesSearch =
            search === '' ||
            pro.business_name.toLowerCase().includes(search.toLowerCase()) ||
            pro.location?.toLowerCase().includes(search.toLowerCase()) ||
            pro.description?.toLowerCase().includes(search.toLowerCase())

        const matchesCategory =
            activeCategory === 'all'
                ? true
                : (pro.categories ?? []).some(
                    (cat) =>
                        cat.toLowerCase().replace(/\s/g, '-') === activeCategory
                )

        return matchesSearch && matchesCategory
    })

    return (
        <div className="bg-white min-h-screen">

            {/* HEADER */}
            <div className="border-b border-black px-4 sm:px-6 md:px-12 lg:px-20 py-10 sm:py-16">
                <p className="text-xs font-semibold tracking-[0.3em] uppercase text-black/40">TOPDEK</p>
                <h1 className="mt-2 text-4xl sm:text-5xl md:text-7xl font-black uppercase tracking-tight">
                    PROFESSIONALS
                </h1>
                <p className="mt-4 text-sm text-black/50 tracking-wide max-w-md">
                    Browse verified service providers and book your next experience.
                </p>
            </div>

            {/* SEARCH + FILTERS */}
            <div className="sticky top-0 sm:top-16 z-30 bg-white border-b border-black">
                <div className="px-4 sm:px-6 md:px-12 lg:px-20 py-3 sm:py-4 flex flex-col gap-3 sm:gap-4">

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
                    <div className="relative -mx-4 sm:-mx-6 md:-mx-12 lg:-mx-20">
                        <div className="flex gap-2 overflow-x-auto px-4 sm:px-6 md:px-12 lg:px-20 pb-1 scrollbar-hide">
                            {CATEGORIES.map((cat) => {
                                const slug =
                                    cat === 'All'
                                        ? 'all'
                                        : cat.toLowerCase().replace(/\s/g, '-')

                                const isActive = activeCategory === slug
                                const href = slug === 'all' ? '/professionals' : `/professionals?type=${slug}`

                                return (
                                    <Link
                                        key={cat}
                                        href={href}
                                        className={`shrink-0 whitespace-nowrap border px-3 py-1.5 text-xs font-bold tracking-[0.1em] uppercase transition-colors ${
                                            isActive
                                                ? 'border-black bg-black text-white'
                                                : 'border-black/30 text-black/50 hover:border-black hover:text-black'
                                        }`}
                                    >
                                        {cat}
                                    </Link>
                                )
                            })}
                        </div>

                        <div className="sm:hidden pointer-events-none absolute right-0 top-0 bottom-1 w-8 bg-gradient-to-l from-white to-transparent" />
                    </div>
                </div>
            </div>

            {/* RESULTS */}
            <div className="px-4 sm:px-6 md:px-12 lg:px-20 py-8 sm:py-12">

                {filtered.length === 0 ? (
                    <div className="py-16 sm:py-24 text-center">
                        <p className="text-xs font-semibold tracking-[0.3em] uppercase text-black/30 px-4">
                            {search
                                ? `NO RESULTS FOR "${search.toUpperCase()}"`
                                : 'NO PROFESSIONALS LISTED YET.'}
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
                        <p className="mb-6 sm:mb-8 text-xs font-semibold tracking-[0.2em] uppercase text-black/40">
                            {filtered.length} PROFESSIONAL
                            {filtered.length !== 1 ? 'S' : ''}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
                            {filtered.map((pro) => (
                                <Link
                                    key={pro.id}
                                    href={`/professionals/${pro.slug}`}
                                    className="group cursor-pointer border border-black hover:shadow-lg transition-shadow active:bg-black/[0.02] block"
                                >
                                    {/* COVER */}
                                    <div className="relative h-40 sm:h-52 overflow-hidden bg-zinc-100">
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

                                        {pro.logo_url && (
                                            <div className="absolute bottom-3 left-3 h-9 w-9 sm:h-10 sm:w-10 border-2 border-white overflow-hidden bg-white">
                                                <img
                                                    src={pro.logo_url}
                                                    alt={`${pro.business_name} logo`}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* INFO */}
                                    <div className="p-4 sm:p-5">
                                        <h3 className="font-black uppercase tracking-tight text-base sm:text-lg leading-tight">
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
                                </Link>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
