import type { Metadata } from 'next'
import Link from 'next/link'
import { Clock, MapPin, ShieldCheck, Zap } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Call-Outs — TopDek',
    description: 'Your barber, stylist, or beauty pro — at your door, on your schedule. Request a call-out on TopDek.',
    alternates: { canonical: '/call-outs' },
}

const USE_CASES = [
    'JOB INTERVIEW IN AN HOUR',
    'LAST-MINUTE DATE NIGHT',
    'WEDDING OR EVENT DAY',
    'STUCK AT HOME OR OFFICE',
    'TRAVELLING & NO REGULAR SPOT',
    'JUST DON\'T WANT TO QUEUE',
]

export default function CallOutsPage() {
    return (
        <div className="bg-white text-black">

            {/* HERO */}
            <section className="relative h-[70vh] overflow-hidden bg-black">
                <img
                    src="https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=1600&q=80"
                    alt="Mobile call-out service"
                    className="absolute inset-0 h-full w-full object-cover opacity-50"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                <div className="relative flex h-full max-w-7xl mx-auto flex-col justify-center px-6 md:px-12 lg:px-20">
          <span className="mb-4 flex w-fit items-center gap-1.5 border border-white/30 px-3 py-1 text-xs font-bold tracking-[0.15em] uppercase text-white/70">
            <Zap className="h-3 w-3" />
            NEW ON TOPDEK
          </span>
                    <h1 className="text-[clamp(3rem,9vw,7rem)] font-black leading-none tracking-tight text-white uppercase">
                        CALL-OUTS
                    </h1>
                    <p className="mt-4 text-sm md:text-base text-white/60 max-w-md tracking-wide">
                        Your barber, stylist, or beauty pro — at your door, on your schedule.
                    </p>
                </div>
            </section>

            {/* WHAT IS A CALL-OUT */}
            <section className="px-6 md:px-12 lg:px-20 py-16 md:py-24 border-b border-black">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                    <div>
                        <p className="text-xs font-semibold tracking-[0.3em] uppercase text-black/40 mb-3">
                            WHAT'S A CALL-OUT?
                        </p>
                        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight leading-tight">
                            SKIP THE TRIP. THEY COME TO YOU.
                        </h2>
                    </div>
                    <p className="text-base text-black/60 leading-relaxed">
                        A call-out is an on-demand booking where a verified professional travels to your
                        location instead of you travelling to theirs. Perfect for tight schedules, last-minute
                        plans, or whenever a salon visit just isn't practical. Request a time and place, get
                        matched with an available pro, and they'll show up ready to work.
                    </p>
                </div>
            </section>

            {/* WHEN TO USE IT */}
            <section className="px-6 md:px-12 lg:px-20 py-16 md:py-24 border-b border-black">
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-10">
                    WHEN TO REQUEST A CALL-OUT
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {USE_CASES.map((useCase) => (
                        <div
                            key={useCase}
                            className="border border-black p-6 text-sm font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
                        >
                            {useCase}
                        </div>
                    ))}
                </div>
            </section>

            {/* WHY IT WORKS */}
            <section className="bg-black text-white px-6 md:px-12 lg:px-20 py-16 md:py-24">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div>
                        <Clock className="h-7 w-7 mb-4" />
                        <h3 className="font-black uppercase tracking-tight text-lg">FAST RESPONSE</h3>
                        <p className="mt-2 text-sm text-white/60 leading-relaxed">
                            Most call-out requests get matched with a professional within minutes.
                        </p>
                    </div>
                    <div>
                        <MapPin className="h-7 w-7 mb-4" />
                        <h3 className="font-black uppercase tracking-tight text-lg">THEY COME TO YOU</h3>
                        <p className="mt-2 text-sm text-white/60 leading-relaxed">
                            Home, office, hotel — wherever you are, that's where the appointment happens.
                        </p>
                    </div>
                    <div>
                        <ShieldCheck className="h-7 w-7 mb-4" />
                        <h3 className="font-black uppercase tracking-tight text-lg">VERIFIED PROS</h3>
                        <p className="mt-2 text-sm text-white/60 leading-relaxed">
                            Every professional offering call-outs is vetted before they're allowed on the
                            platform.
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="px-6 md:px-12 lg:px-20 py-20 text-center">
                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight">
                    NEED A CUT, RIGHT NOW?
                </h2>
                <p className="mt-3 text-sm text-black/50">
                    Sign up to request your first call-out.
                </p>
                <Link
                    href="/signup"
                    className="mt-8 inline-block border border-black bg-black px-8 py-3 text-xs font-bold tracking-[0.2em] uppercase text-white transition-colors hover:bg-white hover:text-black"
                >
                    GET STARTED
                </Link>
            </section>
        </div>
    )
}
