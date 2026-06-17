import { Link } from 'react-router-dom'
import { Store, Calendar, TrendingUp, MapPin, Check } from 'lucide-react'

const BENEFITS = [
    {
        icon: Store,
        title: 'YOUR OWN STORE PAGE',
        description: 'A professional profile clients find when browsing the marketplace.',
    },
    {
        icon: Calendar,
        title: 'MANAGE BOOKINGS',
        description: 'Accept appointments and call-outs in one simple dashboard.',
    },
    {
        icon: MapPin,
        title: 'OFFER CALL-OUTS',
        description: 'Travel to clients and charge for the convenience — your call.',
    },
    {
        icon: TrendingUp,
        title: 'GET DISCOVERED',
        description: 'Appear in search results and category pages across the platform.',
    },
]

const PLANS = [
    { name: 'BASIC', price: 'R299', features: ['Listed on marketplace', 'Up to 5 services', 'Client bookings'] },
    { name: 'PRO', price: 'R599', features: ['Unlimited services', 'Featured placement', 'Priority support'], highlighted: true },
    { name: 'ELITE', price: 'R999', features: ['Top search results', 'Verified badge', 'Dedicated support'] },
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
                        ready to book.
                    </p>
                    <Link
                        to="/signup"
                        className="mt-8 w-fit border border-white bg-white px-6 py-3 text-xs font-bold tracking-[0.15em] uppercase text-black transition-colors hover:bg-transparent hover:text-white"
                    >
                        CREATE YOUR STORE
                    </Link>
                </div>
            </section>

            {/* BENEFITS */}
            <section className="px-6 md:px-12 lg:px-20 py-16 md:py-24 border-b border-black">
                <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-12">
                    WHY LIST ON TOPDEK
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px border border-black">
                    {BENEFITS.map((benefit, i) => (
                        <div
                            key={benefit.title}
                            className={`p-8 ${
                                i < BENEFITS.length - 1 ? 'border-b sm:border-b-0 sm:border-r border-black' : ''
                            }`}
                        >
                            <benefit.icon className="h-7 w-7 mb-4" />
                            <h3 className="font-black uppercase tracking-tight text-sm">{benefit.title}</h3>
                            <p className="mt-2 text-sm text-black/60 leading-relaxed">{benefit.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* PRICING TEASER */}
            <section className="px-6 md:px-12 lg:px-20 py-16 md:py-24">
                <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-3">
                    SIMPLE PRICING
                </h2>
                <p className="text-sm text-black/50 mb-12 max-w-md">
                    Choose a plan when you set up your store. Cancel anytime.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {PLANS.map((plan) => (
                        <div
                            key={plan.name}
                            className={`border p-6 ${
                                plan.highlighted ? 'border-black bg-black text-white' : 'border-black/20'
                            }`}
                        >
                            <h3 className="font-black uppercase tracking-tight text-lg">{plan.name}</h3>
                            <div className="mt-4 mb-6">
                                <span className="text-3xl font-black">{plan.price}</span>
                                <span className={`text-xs ${plan.highlighted ? 'text-white/60' : 'text-black/50'}`}>
                  /month
                </span>
                            </div>
                            <ul className="space-y-2">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-2 text-sm">
                                        <Check className="h-4 w-4 mt-0.5 shrink-0" />
                                        <span className={plan.highlighted ? 'text-white/80' : 'text-black/70'}>
                      {feature}
                    </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="bg-black text-white text-center py-20 px-6">
                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight">
                    READY TO GET BOOKED?
                </h2>
                <Link
                    to="/signup"
                    className="mt-8 inline-block border border-white px-8 py-3 text-xs font-bold tracking-[0.2em] uppercase text-white transition-colors hover:bg-white hover:text-black"
                >
                    CREATE YOUR STORE
                </Link>
            </section>
        </div>
    )
}