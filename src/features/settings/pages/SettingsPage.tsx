'use client'

import { useEffect, useState } from 'react'
import { Compass, Pencil, Check, X } from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useOnboarding } from '@/features/onboarding/hooks/useOnboarding'
import { supabase } from '@/lib/supabase'

export function SettingsPage() {
  const { profile, refreshProfile } = useAuth()
  const { start } = useOnboarding()
  const [hasProviderProfile, setHasProviderProfile] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState('')
  const [savingName, setSavingName] = useState(false)
  const [nameError, setNameError] = useState<string | null>(null)

  useEffect(() => {
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
  }, [profile])

  function startEditName() {
    setNameDraft(profile?.full_name ?? '')
    setNameError(null)
    setEditingName(true)
  }

  function cancelEditName() {
    setEditingName(false)
    setNameError(null)
  }

  async function saveName() {
    const trimmed = nameDraft.trim()
    if (!trimmed) {
      setNameError('Name cannot be empty')
      return
    }
    if (!profile) return

    setSavingName(true)
    setNameError(null)

    const { error } = await supabase
      .from('users')
      .update({ full_name: trimmed })
      .eq('id', profile.id)

    setSavingName(false)

    if (error) {
      setNameError(error.message)
      return
    }

    await refreshProfile()
    setEditingName(false)
  }

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
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-semibold uppercase tracking-widest text-black/40 shrink-0">Full name</span>
              {editingName ? (
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={nameDraft}
                      onChange={(e) => setNameDraft(e.target.value)}
                      autoFocus
                      className="border border-black px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-black"
                    />
                    <button
                      onClick={() => void saveName()}
                      disabled={savingName}
                      aria-label="Save name"
                      className="p-1.5 border border-green-500 text-green-600 hover:bg-green-500 hover:text-white transition-colors disabled:opacity-50"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={cancelEditName}
                      disabled={savingName}
                      aria-label="Cancel edit"
                      className="p-1.5 border border-black/20 text-black/40 hover:border-black hover:text-black transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  {nameError && <p className="text-xs font-semibold text-red-600">{nameError}</p>}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-black/70">{profile.full_name || 'Add your name'}</span>
                  <button
                    onClick={startEditName}
                    aria-label="Edit name"
                    className="p-1 text-black/30 hover:text-black transition-colors"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between border-t border-black/10 pt-3">
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
