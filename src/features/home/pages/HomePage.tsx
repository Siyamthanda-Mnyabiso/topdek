import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { Scissors, MapPin, Clock, Zap, Heart } from 'lucide-react'

const TICKER_ITEMS = [
  'PREMIUM GROOMING',
  'SALON EXPERIENCE',
  'BARBERS',
  'CAPE TOWN',
  'NAIL TECHS',
  'BRAIDERS',
  'MAKEUP ARTISTS',
]

const SERVICE_CATEGORIES = [
  'Barbers',
  'Hair Stylists',
  'Beard Grooming',
  'Braiders',
  'Nail Techs',
  'Makeup Artists',
  'Lash Techs',
  'Skincare',
]

interface Professional {
  id: string
  user_id: string
  business_name: string
  description: string | null
  location: string | null
  logo_url: string | null
  cover_image_url: string | null
  created_at: string
}

export function HomePage() {
  const navigate = useNavigate()
  const { session, profile } = useAuth()
  const isLoggedIn = !!session

  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [loading, setLoading] = useState(true)
  const [savedCount, setSavedCount] = useState(0)

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false)
      return
    }

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
  }, [isLoggedIn])

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
      <div className="bg-white text-black">

        {/* HERO */}
        <section className="relative h-[90vh] overflow-hidden bg-black">
          <img
              src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1600&q=80"
              alt="Barber"
              className="absolute inset-0 h-full w-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          <div className="relative flex h-full max-w-7xl mx-auto flex-col justify-center px-6 md:px-12 lg:px-20">
            <p className="mb-4 text-xs font-semibold tracking-[0.3em] uppercase text-white/60">
              PREMIUM GROOMING, STYLING, AND SALON EXPERIENCES.
            </p>
            <h1 className="text-[clamp(3.5rem,10vw,8rem)] font-black leading-none tracking-tight text-white uppercase">
              FIND YOUR<br />STYLE
            </h1>
            <div className="mt-8 flex gap-4">
              <Link
                  to={isLoggedIn ? '/professionals' : '/signup'}
                  className="border border-white bg-white px-6 py-3 text-xs font-bold tracking-[0.15em] uppercase text-black transition-colors hover:bg-transparent hover:text-white"
              >
                {isLoggedIn ? 'BOOK EXPERIENCE' : 'GET STARTED'}
              </Link>
              <button
                  onClick={() => navigate(isLoggedIn ? '/professionals' : '/signup')}
                  className="border border-white/60 px-6 py-3 text-xs font-bold tracking-[0.15em] uppercase text-white transition-colors hover:border-white"
              >
                {isLoggedIn ? 'EXPLORE' : 'LEARN MORE'}
              </button>
            </div>
          </div>
        </section>

        {/* TICKER */}
        <section className="relative bg-black text-white py-5 overflow-hidden">
          <div className="absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-black to-transparent z-10" />
          <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-black to-transparent z-10" />
          <div className="flex whitespace-nowrap animate-ticker">
            {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
                <span key={i} className="flex items-center">
              <span className="mx-12 text-sm uppercase tracking-[0.35em] font-light">{item}</span>
              <span className="mx-6 text-lg font-bold opacity-60">✱</span>
            </span>
            ))}
          </div>
        </section>

        {isLoggedIn ? (
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
                      Need someone today? Request a call-out and they'll come to you.
                    </p>
                  </div>
                  <Link
                      to="/call-outs"
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
                  <button
                      onClick={() => navigate('/professionals')}
                      className="border border-black px-4 py-2 text-xs font-bold tracking-[0.1em] uppercase transition-colors hover:bg-black hover:text-white"
                  >
                    View All
                  </button>
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
                          <div
                              key={pro.id}
                              onClick={() => navigate(`/professionals/${pro.id}`)}
                              className="group cursor-pointer border border-black"
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
                          </div>
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
                      <div
                          key={item}
                          onClick={() => navigate(`/professionals?type=${item.toLowerCase().replace(/\s/g, '-')}`)}
                          className="border border-black py-10 text-center uppercase tracking-widest text-sm cursor-pointer hover:bg-black hover:text-white transition-colors"
                      >
                        {item}
                      </div>
                  ))}
                </div>
              </section>

              {/* SAVED PROVIDERS NUDGE */}
              <section className="bg-black text-white px-6 md:px-12 lg:px-20 py-16 text-center">
                <Heart className="h-7 w-7 mx-auto mb-4" />
                {savedCount > 0 ? (
                    <>
                      <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
                        YOU'VE SAVED {savedCount} PROFESSIONAL{savedCount !== 1 ? 'S' : ''}
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
                    to="/dashboard"
                    className="mt-8 inline-block border border-white px-6 py-3 text-xs font-bold tracking-[0.15em] uppercase text-white transition-colors hover:bg-white hover:text-black"
                >
                  GO TO DASHBOARD
                </Link>
              </section>
            </>
        ) : (
            <>
              {/* HOW IT WORKS — LOGGED OUT */}
              <section className="px-6 md:px-12 lg:px-20 py-20 md:py-28">
                <p className="text-xs font-semibold tracking-[0.3em] uppercase text-black/40 mb-3">
                  HOW TOPDEK WORKS
                </p>
                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight max-w-2xl">
                  TWO WAYS TO GET YOUR PERFECT LOOK
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-px mt-12 border border-black">
                  {/* IN STORE */}
                  <div className="border-b md:border-b-0 md:border-r border-black p-10">
                    <Scissors className="h-8 w-8 mb-6" />
                    <h3 className="text-2xl font-black uppercase tracking-tight">
                      VISIT A PRO
                    </h3>
                    <p className="mt-3 text-sm text-black/60 leading-relaxed max-w-sm">
                      Browse verified barbers, stylists, and beauty professionals near you. Pick a
                      time, walk in, walk out looking sharp.
                    </p>
                  </div>

                  {/* CALLOUT */}
                  <div className="p-10 relative overflow-hidden bg-black text-white">
                <span className="absolute top-6 right-6 flex items-center gap-1.5 border border-white/30 px-2.5 py-1 text-xs font-bold tracking-[0.1em] uppercase text-white/70">
                  <Zap className="h-3 w-3" />
                  NEW
                </span>
                    <MapPin className="h-8 w-8 mb-6" />
                    <h3 className="text-2xl font-black uppercase tracking-tight">
                      CALL THEM TO YOU
                    </h3>
                    <p className="mt-3 text-sm text-white/60 leading-relaxed max-w-sm">
                      Need a fresh cut before a big day and no time to spare? Book a call-out and
                      your professional comes straight to your door.
                    </p>
                  </div>
                </div>
              </section>

              {/* CALL-OUT SPOTLIGHT */}
              <section className="bg-black">
                <div className="mx-auto grid max-w-7xl grid-cols-1 md:grid-cols-2">
                  <div className="min-h-[360px] overflow-hidden order-2 md:order-1">
                    <img
                        src="https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=1200&q=80"
                        alt="Mobile barber call-out"
                        className="h-full w-full object-cover grayscale"
                    />
                  </div>
                  <div className="flex flex-col justify-center px-10 py-20 order-1 md:order-2">
                    <p className="text-xs font-semibold tracking-[0.3em] uppercase text-white/40 mb-3">
                      CALL-OUTS
                    </p>
                    <h2 className="text-4xl md:text-5xl font-black uppercase leading-[0.9] text-white">
                      LAST MINUTE CUT?<br />WE'VE GOT YOU.
                    </h2>
                    <p className="mt-6 text-sm tracking-wide text-white/50 max-w-xs">
                      Job interview in an hour. Date tonight. Big event tomorrow. Request a call-out
                      and a verified professional comes to you — no queue, no travel.
                    </p>
                    <div className="mt-8 flex items-center gap-6 text-white/70">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span className="text-xs font-semibold tracking-wide uppercase">FAST RESPONSE</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span className="text-xs font-semibold tracking-wide uppercase">THEY COME TO YOU</span>
                      </div>
                    </div>
                    <Link
                        to="/signup"
                        className="mt-8 w-fit border border-white px-6 py-3 text-xs font-bold tracking-[0.15em] uppercase text-white transition-colors hover:bg-white hover:text-black"
                    >
                      GET STARTED
                    </Link>
                  </div>
                </div>
              </section>

              {/* PRECISION CRAFT CONSISTENCY */}
              <section className="bg-white">
                <div className="mx-auto grid max-w-7xl grid-cols-1 md:grid-cols-2">
                  <div className="flex flex-col justify-center px-10 py-24">
                    <h2 className="text-[clamp(3rem,6vw,5.5rem)] font-black uppercase leading-[0.85]">
                      PRECISION<br />CRAFT<br />CONSISTENCY
                    </h2>
                    <p className="mt-6 text-sm tracking-wide text-black/50 max-w-xs">
                      Every professional on TopDek is vetted for quality, consistency, and craft.
                    </p>
                    <Link
                        to="/signup"
                        className="mt-8 w-fit border border-black bg-black px-6 py-3 text-xs font-bold tracking-[0.15em] uppercase text-white transition-colors hover:bg-white hover:text-black"
                    >
                      JOIN TOPDEK
                    </Link>
                  </div>
                  <div className="min-h-[400px] overflow-hidden">
                    <img
                        src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=80"
                        alt="Salon styling"
                        className="h-full w-full object-cover grayscale"
                    />
                  </div>
                </div>
              </section>

              {/* FOR PROFESSIONALS CTA */}
              <section className="bg-black text-white text-center py-20 px-6">
                <p className="text-xs font-semibold tracking-[0.3em] uppercase text-white/40 mb-4">
                  ARE YOU A BEAUTY PROFESSIONAL?
                </p>
                <h2 className="text-[clamp(2.5rem,6vw,5rem)] font-black uppercase leading-none">
                  BUILD YOUR<br />BOOKED-OUT BOOK
                </h2>
                <p className="mt-6 text-sm text-white/50 max-w-md mx-auto">
                  List your services, accept walk-ins or call-outs, and get discovered by clients
                  ready to book.
                </p>
                <Link
                    to="/signup"
                    className="mt-10 inline-block border border-white px-8 py-3 text-xs font-bold tracking-[0.2em] uppercase text-white transition-colors hover:bg-white hover:text-black"
                >
                  CREATE YOUR STORE
                </Link>
              </section>
            </>
        )}

        {/* FOOTER */}
        <footer className="border-t border-black bg-white">
          <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

              <div className="lg:col-span-1">
                <span className="text-lg font-black tracking-[0.2em] uppercase">TOPDEK</span>
                <p className="mt-3 text-sm text-black/50 leading-relaxed max-w-xs">
                  Premium grooming, styling, and salon experiences — in store or at your door.
                </p>
              </div>

              <div>
                <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-black/40 mb-4">
                  PLATFORM
                </h3>
                <ul className="space-y-2.5 text-sm">
                  <li><Link to="/professionals" className="text-black/70 hover:text-black transition-colors">Browse Professionals</Link></li>
                  <li><Link to="/how-it-works" className="text-black/70 hover:text-black transition-colors">How It Works</Link></li>
                  <li><Link to="/call-outs" className="text-black/70 hover:text-black transition-colors">Call-Outs</Link></li>
                </ul>
              </div>

              <div>
                <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-black/40 mb-4">
                  FOR PROFESSIONALS
                </h3>
                <ul className="space-y-2.5 text-sm">
                  <li><Link to="/for-professionals" className="text-black/70 hover:text-black transition-colors">Why TopDek</Link></li>
                  <li><Link to="/signup" className="text-black/70 hover:text-black transition-colors">Create Your Store</Link></li>
                </ul>
              </div>

              <div>
                <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-black/40 mb-4">
                  ACCOUNT
                </h3>
                <ul className="space-y-2.5 text-sm">
                  {isLoggedIn ? (
                      <li><Link to="/dashboard" className="text-black/70 hover:text-black transition-colors">Dashboard</Link></li>
                  ) : (
                      <>
                        <li><Link to="/login" className="text-black/70 hover:text-black transition-colors">Login</Link></li>
                        <li><Link to="/signup" className="text-black/70 hover:text-black transition-colors">Sign Up</Link></li>
                      </>
                  )}
                </ul>
              </div>

            </div>

            <div className="mt-12 pt-8 border-t border-black/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-black/40 tracking-wide">
                © {new Date().getFullYear()} TopDek. All rights reserved.
              </p>
              <p className="text-xs text-black/30 tracking-[0.15em] uppercase">
                CAPE TOWN, SOUTH AFRICA
              </p>
            </div>
          </div>
        </footer>

      </div>
  )
}