import { createContext } from 'react'
import type { TourDefinition, TourStep } from '@/features/onboarding/tours.config'

export type OnboardingStatus = 'idle' | 'welcome' | 'running' | 'celebrating'

export interface OnboardingContextValue {
  status: OnboardingStatus
  tour: TourDefinition | null
  stepIndex: number
  activeStep: TourStep | null
  /** Shows the welcome screen for a tour (or restarts it) — no DB write yet. */
  start: (tourId: string) => void
  /** Confirms "Start Tour" from the welcome screen: creates/resets progress
   * and begins at step 0. */
  begin: () => void
  next: () => void
  prev: () => void
  skip: () => void
  finish: () => void
  dismissCelebration: () => void
}

export const OnboardingContext = createContext<OnboardingContextValue | null>(null)
