import type { Metadata } from 'next'
import Link from 'next/link'
import { Search, Calendar, Scissors, MapPin, Star, Zap } from 'lucide-react'

export const metadata: Metadata = {
    title: 'How It Works — TopDek',
    description: 'Two ways to get your perfect look on TopDek — visit a pro, or call one to you.',
    alternates: { canonical: '/how-it-works' },
}

export default function HowItWorksPage() {
    return (
        <div className="bg-white text-black">

            {/* HEADER */}
            <div className="border-b border-black px-6 md:px-12 lg:px-20 py-16">
                <p className="text-xs font-semibold tracking-[0.3em] uppercase text-black/40">TOPDEK</p>
                <h1 className="mt-2 text-5xl md:text-7xl font-black uppercase tracking-tight">
                    HOW IT WORKS
                </h1>
                <p className="mt-4 text-sm text-black/50 tracking-wide max-w-md">
                    Two ways to get your perfect look — visit a pro, or call one to you.
                </p>
            </div>

            {/* IN-STORE STEPS */}
            <section className="px-6 md:px-12 lg:px-20 py-16 md:py-24 border-b border-black">
                <div className="flex items-center gap-3 mb-10">
                    <Scissors className="h-6 w-6" />
                    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">VISIT A PRO</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-px border border-black">
                    <div className="p-8 border-b md:border-b-0 md:border-r border-black">
                        <span className="text-5xl font-black text-black/10">01</span>
                        <h3 className="mt-4 font-black uppercase tracking-tight flex items-center gap-2">
                            <Search className="h-4 w-4" /> BROWSE
                        </h3>
                        <p className="mt-2 text-sm text-black/60 leading-relaxed">
                            Search barbers, stylists, nail techs, and beauty professionals near you. Filter by
                            service, location, and reviews.
                        </p>
                    </div>
                    <div className="p-8 border-b md:border-b-0 md:border-r border-black">
                        <span className="text-5xl font-black text-black/10">02</span>
                        <h3 className="mt-4 font-black uppercase tracking-tight flex items-center gap-2">
                            <Calendar className="h-4 w-4" /> BOOK
                        </h3>
                        <p className="mt-2 text-sm text-black/60 leading-relaxed">
                            Pick a service, choose a time that works for you, and confirm your booking in
                            seconds.
                        </p>
                    </div>
                    <div className="p-8">
                        <span className="text-5xl font-black text-black/10">03</span>
                        <h3 className="mt-4 font-black uppercase tracking-tight flex items-center gap-2">
                            <Star className="h-4 w-4" /> ENJOY & REVIEW
                        </h3>
                        <p className="mt-2 text-sm text-black/60 leading-relaxed">
                            Walk in, get your look, walk out. Leave a review to help others find quality
                            professionals.
                        </p>
                    </div>
                </div>
            </section>

            {/* CALL-OUT STEPS */}
            <section className="bg-black text-white px-6 md:px-12 lg:px-20 py-16 md:py-24">
                <div className="flex items-center gap-3 mb-10">
                    <MapPin className="h-6 w-6" />
                    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">CALL THEM TO YOU</h2>
                    <span className="flex items-center gap-1.5 border border-white/30 px-2.5 py-1 text-xs font-bold tracking-[0.1em] uppercase text-white/70">
            <Zap className="h-3 w-3" />
            NEW
          </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-px border border-white/20">
                    <div className="p-8 border-b md:border-b-0 md:border-r border-white/20">
                        <span className="text-5xl font-black text-white/10">01</span>
                        <h3 className="mt-4 font-black uppercase tracking-tight">REQUEST A CALL-OUT</h3>
                        <p className="mt-2 text-sm text-white/60 leading-relaxed">
                            Tell us what you need, where you are, and when. No queues, no driving.
                        </p>
                    </div>
                    <div className="p-8 border-b md:border-b-0 md:border-r border-white/20">
                        <span className="text-5xl font-black text-white/10">02</span>
                        <h3 className="mt-4 font-black uppercase tracking-tight">GET MATCHED</h3>
                        <p className="mt-2 text-sm text-white/60 leading-relaxed">
                            A verified professional accepts your request and confirms the time.
                        </p>
                    </div>
                    <div className="p-8">
                        <span className="text-5xl font-black text-white/10">03</span>
                        <h3 className="mt-4 font-black uppercase tracking-tight">THEY COME TO YOU</h3>
                        <p className="mt-2 text-sm text-white/60 leading-relaxed">
                            Your pro arrives at your door, ready to work. Pay through the app when you're done.
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="px-6 md:px-12 lg:px-20 py-20 text-center">
                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight">
                    READY TO TRY TOPDEK?
                </h2>
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
