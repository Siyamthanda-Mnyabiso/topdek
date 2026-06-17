import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { supabase, type ProviderProfileInsert } from '@/lib/supabase'
import { Check, Store, CreditCard, ArrowRight } from 'lucide-react'

const PLANS = [
  {
    id: 'basic',
    name: 'BASIC',
    price: 'R299',
    period: '/month',
    description: 'Perfect for getting started',
    features: [
      'Listed on the marketplace',
      'Up to 5 services',
      'Client bookings',
      'Basic profile page',
    ],
  },
  {
    id: 'pro',
    name: 'PRO',
    price: 'R599',
    period: '/month',
    description: 'For serious professionals',
    features: [
      'Everything in Basic',
      'Unlimited services',
      'Featured placement',
      'Priority support',
      'Analytics dashboard',
    ],
    highlighted: true,
  },
  {
    id: 'elite',
    name: 'ELITE',
    price: 'R999',
    period: '/month',
    description: 'Maximum visibility',
    features: [
      'Everything in Pro',
      'Top of search results',
      'Dedicated account manager',
      'Custom profile URL',
      'Verified badge',
    ],
  },
]

type Step = 'store' | 'subscription' | 'done'

export function ProviderSetupPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState<Step>('store')
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const [businessName, setBusinessName] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)

  const createProfile = useMutation({
    mutationFn: async () => {
      if (!profile) throw new Error('You must be logged in')

      const { error: insertError } = await supabase.from('provider_profiles').insert({
        user_id: profile.id,
        business_name: businessName.trim(),
        description: description.trim() || null,
        location: location.trim() || null,
        phone: phone.trim() || null,
      } satisfies ProviderProfileInsert)

      if (insertError) throw insertError
    },
    onSuccess: () => {
      setStep('subscription')
    },
    onError: (err: Error) => {
      setError(err.message)
    },
  })

  function handleStoreSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    createProfile.mutate()
  }

  function handleSubscribe() {
    // TODO: wire up Stripe or PayFast here
    // For now just navigate to provider dashboard
    navigate('/provider')
  }

  // ── STEP INDICATOR ──
  const steps = [
    { id: 'store', label: 'YOUR STORE', icon: Store },
    { id: 'subscription', label: 'SUBSCRIPTION', icon: CreditCard },
  ]

  return (
      <div className="min-h-screen bg-white">

        {/* HEADER */}
        <div className="border-b border-black px-6 md:px-12 lg:px-20 py-12">
          <p className="text-xs font-semibold tracking-[0.3em] uppercase text-black/40">TOPDEK</p>
          <h1 className="mt-2 text-4xl md:text-6xl font-black uppercase tracking-tight">
            BECOME A PROVIDER
          </h1>
          <p className="mt-3 text-sm text-black/50 tracking-wide">
            Set up your store and choose a plan to appear on the marketplace.
          </p>

          {/* STEP INDICATOR */}
          <div className="mt-8 flex items-center gap-0">
            {steps.map((s, i) => {
              const isComplete = step === 'subscription' && s.id === 'store'
              const isActive = step === s.id
              return (
                  <div key={s.id} className="flex items-center">
                    <div className={`flex items-center gap-2 px-4 py-2 border text-xs font-bold tracking-[0.15em] uppercase transition-colors ${
                        isComplete
                            ? 'border-black bg-black text-white'
                            : isActive
                                ? 'border-black bg-white text-black'
                                : 'border-black/20 text-black/30'
                    }`}>
                      {isComplete ? (
                          <Check className="h-3.5 w-3.5" />
                      ) : (
                          <span className="text-xs">{i + 1}</span>
                      )}
                      {s.label}
                    </div>
                    {i < steps.length - 1 && (
                        <ArrowRight className="h-4 w-4 text-black/20 mx-2" />
                    )}
                  </div>
              )
            })}
          </div>
        </div>

        <div className="px-6 md:px-12 lg:px-20 py-12 max-w-4xl">

          {/* ── STEP 1: STORE SETUP ── */}
          {step === 'store' && (
              <form onSubmit={handleStoreSubmit} className="space-y-6 max-w-lg">
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tight">YOUR STORE</h2>
                  <p className="mt-1 text-sm text-black/50">Tell clients about your business.</p>
                </div>

                {error && (
                    <p className="border border-red-500 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-red-600">
                      {error}
                    </p>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold tracking-[0.15em] uppercase">
                    BUSINESS NAME *
                  </label>
                  <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Cuts by Siya"
                      required
                      className="w-full border border-black px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-black"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold tracking-[0.15em] uppercase">
                    DESCRIPTION
                  </label>
                  <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your services and expertise..."
                      rows={4}
                      className="w-full border border-black px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-black resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold tracking-[0.15em] uppercase">
                      LOCATION
                    </label>
                    <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Cape Town"
                        className="w-full border border-black px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold tracking-[0.15em] uppercase">
                      PHONE
                    </label>
                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+27 82 000 0000"
                        className="w-full border border-black px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>
                </div>

                <button
                    type="submit"
                    disabled={createProfile.isPending || !businessName.trim()}
                    className="w-full border border-black bg-black py-3 text-xs font-bold tracking-[0.15em] uppercase text-white transition-colors hover:bg-white hover:text-black disabled:opacity-50"
                >
                  {createProfile.isPending ? 'CREATING STORE...' : 'CONTINUE TO SUBSCRIPTION →'}
                </button>
              </form>
          )}

          {/* ── STEP 2: SUBSCRIPTION ── */}
          {step === 'subscription' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tight">CHOOSE YOUR PLAN</h2>
                  <p className="mt-1 text-sm text-black/50">
                    Select a plan to appear on the marketplace. Cancel anytime.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {PLANS.map((plan) => (
                      <div
                          key={plan.id}
                          onClick={() => setSelectedPlan(plan.id)}
                          className={`cursor-pointer border p-6 transition-colors relative ${
                              selectedPlan === plan.id
                                  ? 'border-black bg-black text-white'
                                  : plan.highlighted
                                      ? 'border-black'
                                      : 'border-black/20 hover:border-black'
                          }`}
                      >
                        {plan.highlighted && selectedPlan !== plan.id && (
                            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black text-white text-xs font-bold tracking-[0.15em] uppercase px-3 py-1">
                      POPULAR
                    </span>
                        )}

                        <div className="mb-4">
                          <h3 className="font-black uppercase tracking-tight text-lg">{plan.name}</h3>
                          <p className={`text-xs uppercase tracking-widest mt-0.5 ${
                              selectedPlan === plan.id ? 'text-white/60' : 'text-black/40'
                          }`}>
                            {plan.description}
                          </p>
                        </div>

                        <div className="mb-6">
                          <span className="text-3xl font-black">{plan.price}</span>
                          <span className={`text-xs ${
                              selectedPlan === plan.id ? 'text-white/60' : 'text-black/50'
                          }`}>
                      {plan.period}
                    </span>
                        </div>

                        <ul className="space-y-2">
                          {plan.features.map((feature) => (
                              <li key={feature} className="flex items-start gap-2 text-sm">
                                <Check className={`h-4 w-4 mt-0.5 shrink-0 ${
                                    selectedPlan === plan.id ? 'text-white' : 'text-black'
                                }`} />
                                <span className={selectedPlan === plan.id ? 'text-white/80' : 'text-black/70'}>
                          {feature}
                        </span>
                              </li>
                          ))}
                        </ul>

                        {selectedPlan === plan.id && (
                            <div className="mt-4 pt-4 border-t border-white/20">
                              <p className="text-xs font-bold tracking-[0.15em] uppercase text-white/80">
                                ✓ SELECTED
                              </p>
                            </div>
                        )}
                      </div>
                  ))}
                </div>

                <div className="flex gap-4 max-w-sm">
                  <button
                      onClick={handleSubscribe}
                      disabled={!selectedPlan}
                      className="flex-1 border border-black bg-black py-3 text-xs font-bold tracking-[0.15em] uppercase text-white transition-colors hover:bg-white hover:text-black disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {selectedPlan ? `SUBSCRIBE TO ${PLANS.find(p => p.id === selectedPlan)?.name}` : 'SELECT A PLAN'}
                  </button>
                  <button
                      onClick={() => navigate('/provider')}
                      className="border border-black/20 px-4 py-3 text-xs font-bold tracking-[0.15em] uppercase text-black/40 transition-colors hover:border-black hover:text-black"
                  >
                    SKIP
                  </button>
                </div>

                <p className="text-xs text-black/30 tracking-wide">
                  Payment integration coming soon. Clicking subscribe will take you to your dashboard.
                </p>
              </div>
          )}
        </div>
      </div>
  )
}