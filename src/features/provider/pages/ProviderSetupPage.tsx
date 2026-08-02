import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { supabase, type ProviderProfileInsert } from '@/lib/supabase'
import { Store } from 'lucide-react'

type Step = 'store' | 'done'

export function ProviderSetupPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState<Step>('store')

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
      setStep('done')
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

  function handleFinish() {
    // redirect straight to provider dashboard (services page)
    navigate('/provider')
  }

  // ── STEP INDICATOR (UPDATED) ──
  const steps = [
    { id: 'store', label: 'YOUR STORE', icon: Store },
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
            Set up your store to start receiving clients.
          </p>

          {/* STEP INDICATOR */}
          <div className="mt-8 flex items-center gap-0">
            {steps.map((s) => (
                <div key={s.id} className="flex items-center">
                  <div className="flex items-center gap-2 px-4 py-2 border text-xs font-bold tracking-[0.15em] uppercase border-black bg-white text-black">
                    <span className="text-xs">1</span>
                    {s.label}
                  </div>
                </div>
            ))}
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

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                  {createProfile.isPending ? 'CREATING STORE...' : 'CREATE STORE →'}
                </button>
              </form>
          )}

          {/* ── STEP DONE ── */}
          {step === 'done' && (
              <div className="space-y-6 max-w-lg">
                <h2 className="text-2xl font-black uppercase">STORE CREATED</h2>
                <p className="text-sm text-black/50">
                  Your profile is now live. Next step: add your services.
                </p>

                <button
                    onClick={handleFinish}
                    className="w-full border border-black bg-black py-3 text-xs font-bold tracking-[0.15em] uppercase text-white hover:bg-white hover:text-black"
                >
                  CONTINUE TO SERVICES →
                </button>
              </div>
          )}

        </div>
      </div>
  )
}