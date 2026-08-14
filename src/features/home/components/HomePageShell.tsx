import Link from 'next/link'

const TICKER_ITEMS = [
  'PREMIUM GROOMING',
  'SALON EXPERIENCE',
  'BARBERS',
  'Massage Therapists',
  'NAIL TECHS',
  'BRAIDERS',
  'MAKEUP ARTISTS',
]

export function HomePageShell({
  isLoggedIn,
  children,
}: {
  isLoggedIn: boolean
  children: React.ReactNode
}) {
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
            FIND YOUR
            <br />
            STYLE
          </h1>
          <div className="mt-8 flex gap-4">
            <Link
              href={isLoggedIn ? '/professionals' : '/signup'}
              className="border border-white bg-white px-6 py-3 text-xs font-bold tracking-[0.15em] uppercase text-black transition-colors hover:bg-transparent hover:text-white"
            >
              {isLoggedIn ? 'BOOK EXPERIENCE' : 'GET STARTED'}
            </Link>
            <Link
              href={isLoggedIn ? '/professionals' : '/signup'}
              className="border border-white/60 px-6 py-3 text-xs font-bold tracking-[0.15em] uppercase text-white transition-colors hover:border-white"
            >
              {isLoggedIn ? 'EXPLORE' : 'LEARN MORE'}
            </Link>
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

      {children}

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
                <li>
                  <Link href="/professionals" className="text-black/70 hover:text-black transition-colors">
                    Browse Professionals
                  </Link>
                </li>
                <li>
                  <Link href="/how-it-works" className="text-black/70 hover:text-black transition-colors">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="/call-outs" className="text-black/70 hover:text-black transition-colors">
                    Call-Outs
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-black/40 mb-4">
                FOR PROFESSIONALS
              </h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link href="/for-professionals" className="text-black/70 hover:text-black transition-colors">
                    Why TopDek
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="text-black/70 hover:text-black transition-colors">
                    Create Your Store
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-black/40 mb-4">
                ACCOUNT
              </h3>
              <ul className="space-y-2.5 text-sm">
                {isLoggedIn ? (
                  <li>
                    <Link href="/dashboard" className="text-black/70 hover:text-black transition-colors">
                      Dashboard
                    </Link>
                  </li>
                ) : (
                  <>
                    <li>
                      <Link href="/login" className="text-black/70 hover:text-black transition-colors">
                        Login
                      </Link>
                    </li>
                    <li>
                      <Link href="/signup" className="text-black/70 hover:text-black transition-colors">
                        Sign Up
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-black/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-black/40 tracking-wide">
              © {new Date().getFullYear()} TopDek. All rights reserved.
            </p>
            <p className="text-xs text-black/30 tracking-[0.15em] uppercase">CAPE TOWN, SOUTH AFRICA</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
