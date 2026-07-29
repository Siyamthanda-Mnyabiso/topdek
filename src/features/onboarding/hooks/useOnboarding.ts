import { useContext } from 'react'
import { OnboardingContext } from '@/features/onboarding/onboarding-context'

export function useOnboarding() {
  const context = useContext(OnboardingContext)

  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider')
  }

  return context
}
