import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useOnboarding } from '@/features/onboarding/hooks/useOnboarding'
import { supabase } from '@/lib/supabase'

export function SettingsPage() {
  const { profile, isLoading } = useAuth()
  const navigate = useNavigate()
  const { start } = useOnboarding()
  const [hasProviderProfile, setHasProviderProfile] = useState(false)

  useEffect(() => {
    if (isLoading) return
    if (!profile) {
      navigate('/login')
      return
    }

    async function checkProviderProfile() {
      if (!profile) return
      const { data } = await supabase
        .from('provider_profiles')
        .select('id')
        .eq('user_id', profile.id)
        .maybeSingle()
      setHasProviderProfile(!!data)
    }
    void checkProviderProfile()
  }, [profile, isLoading, navigate])

  if (!profile) return null

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-black px-6 md:px-12 lg:px-20 py-12">
        <p className="text-xs font-semibold tracking-[0.3em] uppercase text-black/40">TOPDEK</p>
        <h1 className="mt-2 text-4xl md:text-6xl font-black uppercase tracking-tight">SETTINGS</h1>
      </div>

      <div className="px-6 md:px-12 lg:px-20 py-12 max-w-2xl space-y-12">
        <section>
          <h2 className="text-xs font-bold tracking-[0.3em] uppercase text-black/40 mb-4">Account</h2>
          <div className="border border-black p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-widest text-black/40">Email</span>
              <span className="text-sm text-black/70">{profile.email}</span>
            </div>
            <div className="flex items-center justify-between border-t border-black/10 pt-3">
              <span className="text-xs font-semibold uppercase tracking-widest text-black/40">Account type</span>
              <span className="text-sm text-black/70">{hasProviderProfile ? 'Provider' : 'Client'}</span>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xs font-bold tracking-[0.3em] uppercase text-black/40 mb-4">Onboarding</h2>
          <div className="border border-black p-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Compass className="h-5 w-5 shrink-0" />
              <div>
                <h3 className="font-black uppercase tracking-tight">Guided tour</h3>
                <p className="text-xs text-black/40 mt-0.5">Walk back through the TopDek basics.</p>
              </div>
            </div>
            <button
              onClick={() => start(hasProviderProfile ? 'provider-main' : 'client-main')}
              className="shrink-0 border border-black px-4 py-2 text-xs font-bold tracking-[0.15em] uppercase transition-colors hover:bg-black hover:text-white"
            >
              View Tour Again
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
