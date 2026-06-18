import { Link } from 'react-router-dom'
import { Store, Calendar, TrendingUp, MapPin, Sparkles, Users, Zap, Gift } from 'lucide-react'

const BENEFITS = [
    {
        icon: Sparkles,
        title: 'COMPLETELY FREE',
        description: 'List your services, manage bookings, and grow your business at no cost. No hidden fees, no commissions.',
    },
    {
        icon: Store,
        title: 'YOUR OWN STORE PAGE',
        description: 'A professional profile clients find when browsing the marketplace — completely free to create.',
    },
    {
        icon: Calendar,
        title: 'MANAGE BOOKINGS',
        description: 'Accept appointments and call-outs in one simple dashboard. Free for life.',
    },
    {
        icon: MapPin,
        title: 'OFFER CALL-OUTS',
        description: 'Travel to clients and charge for the convenience — your call, your rates.',
    },
    {
        icon: TrendingUp,
        title: 'GET DISCOVERED',
        description: 'Appear in search results and category pages. No paid placements needed.',
    },
    {
        icon: Users,
        title: 'GROW YOUR CLIENT BASE',
        description: 'Connect with clients actively looking for beauty and grooming services in your area.',
    },
]

const FEATURES = [
    {
        icon: Zap,
        title: 'ZERO SETUP FEES',
        description: 'No credit card required. Start immediately.',
    },
    {
        icon: Gift,
        title: 'NO COMMISSIONS',
        description: 'You keep 100% of what you earn. Every time.',
    },
    {
        icon: Users,
        title: 'UNLIMITED CLIENTS',
        description: 'No cap on how many clients you can serve.',
    },
]

export function ForProfessionalsPage() {
    return (
        <div className="bg-white text-black">

            {/* HERO */}
            <section className="relative h-[70vh] overflow-hidden bg-black">
                <img
                    src="https://images.unsplash.com/photo-1599351431290-08e8eb22a5ff?w=1600&q=80"
                    alt="Barber working with client"
                    className="absolute inset-0 h-full w-full object-cover opacity-50"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                <div className="relative flex h-full max-w-7xl mx-auto flex-col justify-center px-6 md:px-12 lg:px-20">
                    <p className="mb-4 text-xs font-semibold tracking-[0.3em] uppercase text-white/60">
                        FOR BEAUTY & GROOMING PROFESSIONALS
                    </p>
                    <h1 className="text-[clamp(3rem,8vw,6.5rem)] font-black leading-none tracking-tight text-white uppercase">
                        BUILD YOUR<br />BOOKED-OUT BOOK
                    </h1>
                    <p className="mt-4 text-sm md:text-base text-white/60 max-w-md tracking-wide">
                        List your services, accept walk-ins or call-outs, and get discovered by clients
                        ready to book — all completely free.
                    </p>
                    <Link
                        to="/signup"
                        className="mt-8 w-fit border border-white bg-white px-6 py-3 text-xs font-bold tracking-[0.15em] uppercase text-black transition-colors hover:bg-transparent hover:text-white"
                    >
                        CREATE YOUR STORE — FREE
                    </Link>
                </div>
            </section>

            {/* BENEFITS - WHY LIST ON TOPDEK */}
            <section className="px-6 md:px-12 lg:px-20 py-16 md:py-24 border-b border-black">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-4">
                        WHY LIST ON TOPDEK
                    </h2>
                    <p className="text-sm text-black/50 mb-12 max-w-md">
                        Join hundreds of professionals using TOPDEK to grow their business — at no cost.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px border border-black">
                        {BENEFITS.map((benefit, i) => (
                            <div
                                key={benefit.title}
                                className={`p-6 ${
                                    i < BENEFITS.length - 1 && i % 2 !== 0 ? 'border-b sm:border-b-0 sm:border-r border-black' : ''
                                } ${i < BENEFITS.length - 1 ? 'border-b sm:border-b-0 sm:border-r border-black' : ''}`}
                            >
                                <benefit.icon className="h-7 w-7 mb-4" />
                                <h3 className="font-black uppercase tracking-tight text-sm">{benefit.title}</h3>
                                <p className="mt-2 text-sm text-black/60 leading-relaxed">{benefit.description}</p>
                            </div>
                        ))}
                    </div>

                    {/* Free Features Highlights */}
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                        {FEATURES.map((feature) => (
                            <div key={feature.title} className="border border-black/20 p-6 text-center">
                                <feature.icon className="h-8 w-8 mx-auto mb-3" />
                                <h4 className="font-black uppercase tracking-tight text-sm">{feature.title}</h4>
                                <p className="mt-2 text-sm text-black/60">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FREE FOREVER SECTION */}
            <section className="px-6 md:px-12 lg:px-20 py-16 md:py-20 border-b border-black">
                <div className="max-w-3xl mx-auto text-center">
                    <Sparkles className="h-10 w-10 mx-auto mb-4" />
                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight">
                        FREE FOREVER
                    </h2>
                    <p className="mt-4 text-sm text-black/50 max-w-md mx-auto">
                        No subscription fees. No hidden charges. Just a simple platform to help you grow your business.
                    </p>
                    <div className="mt-8 flex flex-wrap justify-center gap-4">
                        <span className="border border-black px-4 py-2 text-xs font-bold uppercase tracking-[0.15em]">
                            ✓ No Setup Fees
                        </span>
                        <span className="border border-black px-4 py-2 text-xs font-bold uppercase tracking-[0.15em]">
                            ✓ No Commissions
                        </span>
                        <span className="border border-black px-4 py-2 text-xs font-bold uppercase tracking-[0.15em]">
                            ✓ No Credit Card
                        </span>
                        <span className="border border-black px-4 py-2 text-xs font-bold uppercase tracking-[0.15em]">
                            ✓ Cancel Anytime
                        </span>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-black text-white text-center py-20 px-6">
                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight">
                    READY TO GET BOOKED?
                </h2>
                <p className="mt-4 text-sm text-white/50 max-w-md mx-auto">
                    Start growing your client base today — completely free.
                </p>
                <Link
                    to="/signup"
                    className="mt-8 inline-block border border-white px-8 py-3 text-xs font-bold tracking-[0.2em] uppercase text-white transition-colors hover:bg-white hover:text-black"
                >
                    CREATE YOUR STORE — FREE
                </Link>
            </section>
        </div>
    )
}