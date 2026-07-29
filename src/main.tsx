import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from '@/features/auth/AuthContext'
import { OnboardingProvider } from '@/features/onboarding/OnboardingContext'
import { router } from '@/routes'
import { registerServiceWorker } from '@/lib/push'
import './index.css'

void registerServiceWorker()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <OnboardingProvider>
          <RouterProvider router={router} />
        </OnboardingProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
