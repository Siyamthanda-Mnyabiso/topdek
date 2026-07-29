import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { getTour, type TourDefinition } from '@/features/onboarding/tours.config'
import {
  OnboardingContext,
  type OnboardingContextValue,
  type OnboardingStatus,
} from '@/features/onboarding/onboarding-context'

interface ProgressRow {
  tour_id: string
  completed: boolean
  current_step: number
}

async function upsertProgress(
  userId: string,
  tourId: string,
  fields: Partial<Pick<ProgressRow, 'completed' | 'current_step'>> & { completed_at?: string | null },
) {
  const { error } = await supabase
    .from('onboarding_progress')
    .upsert(
      { user_id: userId, tour_id: tourId, ...fields },
      { onConflict: 'user_id,tour_id' },
    )
  if (error) console.error('Failed to save onboarding progress:', error.message)
}

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { authUser, profile } = useAuth()
  const [status, setStatus] = useState<OnboardingStatus>('idle')
  const [tour, setTour] = useState<TourDefinition | null>(null)
  const [stepIndex, setStepIndex] = useState(0)

  // Same "does this user have a provider store" check used by the navbar —
  // determines which default tour applies.
  const { data: hasProviderProfile } = useQuery({
    queryKey: ['onboarding-provider-check', profile?.id],
    queryFn: async () => {
      if (!profile) return false
      const { data } = await supabase
        .from('provider_profiles')
        .select('id')
        .eq('user_id', profile.id)
        .maybeSingle()
      return !!data
    },
    enabled: !!profile,
  })

  const defaultTourId = hasProviderProfile ? 'provider-main' : 'client-main'

  // On first load after auth resolves, check whether the user has already
  // seen (or is mid-way through) their default tour.
  const { data: initialProgress, isFetched } = useQuery({
    queryKey: ['onboarding-progress', authUser?.id, defaultTourId],
    queryFn: async (): Promise<ProgressRow | null> => {
      if (!authUser) return null
      const { data } = await supabase
        .from('onboarding_progress')
        .select('tour_id, completed, current_step')
        .eq('user_id', authUser.id)
        .eq('tour_id', defaultTourId)
        .maybeSingle()
      return data
    },
    enabled: !!authUser && hasProviderProfile !== undefined,
  })

  useEffect(() => {
    if (!authUser || !isFetched || status !== 'idle') return

    queueMicrotask(() => {
      if (!initialProgress) {
        setTour(getTour(defaultTourId) ?? null)
        setStepIndex(0)
        setStatus('welcome')
      } else if (!initialProgress.completed) {
        const definition = getTour(initialProgress.tour_id)
        if (definition) {
          setTour(definition)
          setStepIndex(Math.min(initialProgress.current_step, definition.steps.length - 1))
          setStatus('running')
        }
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser, isFetched, initialProgress, defaultTourId])

  const start = useCallback((tourId: string) => {
    const definition = getTour(tourId)
    if (!definition) return
    setTour(definition)
    setStepIndex(0)
    setStatus('welcome')
  }, [])

  const begin = useCallback(() => {
    if (!authUser || !tour) return
    setStepIndex(0)
    setStatus('running')
    void upsertProgress(authUser.id, tour.id, { completed: false, current_step: 0, completed_at: null })
  }, [authUser, tour])

  const next = useCallback(() => {
    if (!authUser || !tour) return
    setStepIndex((i) => {
      const nextIndex = Math.min(i + 1, tour.steps.length - 1)
      void upsertProgress(authUser.id, tour.id, { current_step: nextIndex })
      return nextIndex
    })
  }, [authUser, tour])

  const prev = useCallback(() => {
    if (!authUser || !tour) return
    setStepIndex((i) => {
      const prevIndex = Math.max(i - 1, 0)
      void upsertProgress(authUser.id, tour.id, { current_step: prevIndex })
      return prevIndex
    })
  }, [authUser, tour])

  const skip = useCallback(() => {
    if (!authUser || !tour) return
    void upsertProgress(authUser.id, tour.id, {
      completed: true,
      completed_at: new Date().toISOString(),
    })
    setStatus('idle')
    setTour(null)
  }, [authUser, tour])

  const finish = useCallback(() => {
    if (!authUser || !tour) return
    void upsertProgress(authUser.id, tour.id, {
      completed: true,
      current_step: tour.steps.length,
      completed_at: new Date().toISOString(),
    })
    setStatus('celebrating')
  }, [authUser, tour])

  const dismissCelebration = useCallback(() => {
    setStatus('idle')
    setTour(null)
  }, [])

  const activeStep = tour ? tour.steps[stepIndex] ?? null : null

  const value = useMemo<OnboardingContextValue>(
    () => ({ status, tour, stepIndex, activeStep, start, begin, next, prev, skip, finish, dismissCelebration }),
    [status, tour, stepIndex, activeStep, start, begin, next, prev, skip, finish, dismissCelebration],
  )

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>
}
