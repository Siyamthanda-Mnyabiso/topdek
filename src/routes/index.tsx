import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { SignupPage } from '@/features/auth/pages/SignupPage'
import { ClientDashboardPage } from '@/features/client/pages/ClientDashboardPage'
import { HomePage } from '@/features/home/pages/HomePage'
import { ProviderDashboardPage } from '@/features/provider/pages/ProviderDashboardPage'
import { ProviderSetupPage } from '@/features/provider/pages/ProviderSetupPage'
import { ResetPasswordPage } from '@/features/auth/pages/ResetPasswordPage'
import { ProfessionalsPage } from '@/features/provider/pages/ProfessionalsPage'
import { ServicesPage } from '@/features/provider/pages/ServicesPage'
import { StoreSettingsPage } from "@/features/provider/pages/StoreSettingsPage"
import { ProviderPublicProfilePage } from '@/features/provider/pages/ProviderPublicProfilePage'
import { HowItWorksPage } from '@/features/home/pages/HowItWorksPage'
import { CallOutsPage } from '@/features/home/pages/CallOutsPage'
import { ForProfessionalsPage } from '@/features/home/pages/ForProfessionalsPage'
import { AvailabilityPage } from '@/features/provider/pages/AvailabilityPage'
import { BookingsPage } from '@/features/provider/pages/BookingsPage'
import { MyBookingsPage } from '@/features/client/pages/MyBookingsPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'signup', element: <SignupPage /> },
      { path: 'dashboard', element: <ClientDashboardPage /> },
      { path: 'provider', element: <ProviderDashboardPage /> },
      { path: 'provider/setup', element: <ProviderSetupPage /> },
      { path: 'reset-password', element: <ResetPasswordPage /> },
      { path: 'professionals', element: <ProfessionalsPage /> },
      { path: 'provider/services', element: <ServicesPage /> },
      { path: 'provider/store', element: <StoreSettingsPage /> },
      { path: '/professionals/:id', element: <ProviderPublicProfilePage /> },
      { path: 'how-it-works', element: <HowItWorksPage /> },
      { path: 'call-outs', element: <CallOutsPage /> },
      { path: 'for-professionals', element: <ForProfessionalsPage /> },
      { path: 'provider/availability', element: <AvailabilityPage /> },
      { path: 'provider/bookings', element: <BookingsPage /> },
      { path: 'my-bookings', element: <MyBookingsPage /> },
    ],
  },
])