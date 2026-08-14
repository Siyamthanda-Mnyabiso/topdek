'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { Zap, Heart } from 'lucide-react'
import type { ProviderProfile } from '@/types/database'

const SERVICE_CATEGORIES = [
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

export function HomeAuthedClient() {
  const { profile } = useAuth()

  const [professionals, setProfessionals] = useState<ProviderProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [savedCount, setSavedCount] = useState(0)

  useEffect(() => {
    const fetchProfessionals = async () => {
      setLoading(true)

      const { data, error } = await supabase
        .from('provider_profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6)

      if (error) {
        console.error(error.message)
        setProfessionals([])
      } else {
        setProfessionals(data ?? [])
      }

      setLoading(false)
    }

    void fetchProfessionals()
  }, [])

  useEffect(() => {
    if (!profile) return

    const fetchSavedCount = async () => {
      const { count } = await supabase
        .from('saved_providers')
        .select('id', { count: 'exact', head: true })
        .eq('client_id', profile.id)

      setSavedCount(count ?? 0)
    }

    void fetchSavedCount()
  }, [profile])

  return (
    <>
      {/* CALL-OUT BANNER */}
      <section className="border-b border-black px-6 md:px-12 lg:px-20 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 border border-black px-2.5 py-1 text-xs font-bold tracking-[0.1em] uppercase">
              <Zap className="h-3 w-3" />
              NEW
            </span>
            <p className="text-sm font-semibold tracking-wide">
              Need someone today? Request a call-out and they&apos;ll come to you.
            </p>
          </div>
          <Link
            href="/call-outs"
            className="shrink-0 border border-black px-5 py-2 text-xs font-bold tracking-[0.15em] uppercase transition-colors hover:bg-black hover:text-white"
          >
            LEARN MORE
          </Link>
        </div>
      </section>

      {/* FEATURED PROFESSIONALS */}
      <section className="px-6 md:px-12 lg:px-20 py-16 md:py-24">
        <div className="mb-6 flex items-end justify-between border-b border-black pb-4">
          <h2 className="text-3xl font-black uppercase tracking-tight">FEATURED PROFESSIONALS</h2>
          <Link
            href="/professionals"
            className="border border-black px-4 py-2 text-xs font-bold tracking-[0.1em] uppercase transition-colors hover:bg-black hover:text-white"
          >
            View All
          </Link>
        </div>

        {loading ? (
          <p className="mt-8 text-xs font-semibold tracking-[0.2em] uppercase text-black/40">
            LOADING...
          </p>
        ) : professionals.length === 0 ? (
          <p className="mt-8 text-xs font-semibold tracking-[0.2em] uppercase text-black/40">
            NO PROFESSIONALS LISTED YET.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            {professionals.map((pro) => (
              <Link
                key={pro.id}
                href={`/professionals/${pro.slug}`}
                className="group cursor-pointer border border-black block"
              >
                <div className="h-48 overflow-hidden bg-zinc-900">
                  {pro.cover_image_url ? (
                    <img
                      src={pro.cover_image_url}
                      alt={pro.business_name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full bg-zinc-800" />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-black uppercase tracking-tight">{pro.business_name}</h3>
                  {pro.location && (
                    <p className="text-xs text-black/50 uppercase tracking-widest mt-1">{pro.location}</p>
                  )}
                  {pro.description && (
                    <p className="mt-2 text-sm text-black/60 line-clamp-2">{pro.description}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* EXPLORE BY CATEGORY */}
      <section className="px-6 md:px-12 lg:px-20 py-16 md:py-24 border-t border-black">
        <div className="mb-6 border-b border-black pb-4">
          <h2 className="text-3xl font-black uppercase tracking-tight">EXPLORE BY CATEGORY</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-10">
          {SERVICE_CATEGORIES.map((item) => (
            <Link
              key={item}
              href={`/professionals?type=${item.toLowerCase().replace(/\s/g, '-')}`}
              className="border border-black py-10 text-center uppercase tracking-widest text-sm cursor-pointer hover:bg-black hover:text-white transition-colors flex items-center justify-center"
            >
              {item}
            </Link>
          ))}
        </div>
      </section>

      {/* SAVED PROVIDERS NUDGE */}
      <section className="bg-black text-white px-6 md:px-12 lg:px-20 py-16 text-center">
        <Heart className="h-7 w-7 mx-auto mb-4" />
        {savedCount > 0 ? (
          <>
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
              YOU&apos;VE SAVED {savedCount} PROFESSIONAL{savedCount !== 1 ? 'S' : ''}
            </h2>
            <p className="mt-2 text-sm text-white/50">
              Jump back into your dashboard to book one of your favourites.
            </p>
          </>
        ) : (
          <>
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
              SAVE YOUR FAVOURITE PROFESSIONALS
            </h2>
            <p className="mt-2 text-sm text-white/50">
              Tap the heart on any profile to keep them handy for next time.
            </p>
          </>
        )}
        <Link
          href="/dashboard"
          className="mt-8 inline-block border border-white px-6 py-3 text-xs font-bold tracking-[0.15em] uppercase text-white transition-colors hover:bg-white hover:text-black"
        >
          GO TO DASHBOARD
        </Link>
      </section>
    </>
  )
}
