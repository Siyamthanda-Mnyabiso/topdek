import Link from 'next/link'
import { Scissors, MapPin, Clock, Zap } from 'lucide-react'

export function HomeLoggedOutStatic() {
  return (
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
            <h3 className="text-2xl font-black uppercase tracking-tight">VISIT A PRO</h3>
            <p className="mt-3 text-sm text-black/60 leading-relaxed max-w-sm">
              Browse verified barbers, stylists, and beauty professionals near you. Pick a time,
              walk in, walk out looking sharp.
            </p>
          </div>

          {/* CALLOUT */}
          <div className="p-10 relative overflow-hidden bg-black text-white">
            <span className="absolute top-6 right-6 flex items-center gap-1.5 border border-white/30 px-2.5 py-1 text-xs font-bold tracking-[0.1em] uppercase text-white/70">
              <Zap className="h-3 w-3" />
              NEW
            </span>
            <MapPin className="h-8 w-8 mb-6" />
            <h3 className="text-2xl font-black uppercase tracking-tight">CALL THEM TO YOU</h3>
            <p className="mt-3 text-sm text-white/60 leading-relaxed max-w-sm">
              Need a fresh cut before a big day and no time to spare? Book a call-out and your
              professional comes straight to your door.
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
              LAST MINUTE CUT?
              <br />
              WE&apos;VE GOT YOU.
            </h2>
            <p className="mt-6 text-sm tracking-wide text-white/50 max-w-xs">
              Job interview in an hour. Date tonight. Big event tomorrow. Request a call-out and a
              verified professional comes to you — no queue, no travel.
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
              href="/signup"
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
              PRECISION
              <br />
              CRAFT
              <br />
              CONSISTENCY
            </h2>
            <p className="mt-6 text-sm tracking-wide text-black/50 max-w-xs">
              Every professional on TopDek is vetted for quality, consistency, and craft.
            </p>
            <Link
              href="/signup"
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
          BUILD YOUR
          <br />
          BOOKED-OUT BOOK
        </h2>
        <p className="mt-6 text-sm text-white/50 max-w-md mx-auto">
          List your services, accept walk-ins or call-outs, and get discovered by clients ready to
          book.
        </p>
        <Link
          href="/signup"
          className="mt-10 inline-block border border-white px-8 py-3 text-xs font-bold tracking-[0.2em] uppercase text-white transition-colors hover:bg-white hover:text-black"
        >
          CREATE YOUR STORE
        </Link>
      </section>
    </>
  )
}
