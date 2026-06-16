import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { SignupPage } from '@/features/auth/pages/SignupPage'
import { ClientDashboardPage } from '@/features/client/pages/ClientDashboardPage'
import { HomePage } from '@/features/home/pages/HomePage'
import { ProviderDashboardPage } from '@/features/provider/pages/ProviderDashboardPage'
import { ProviderSetupPage } from '@/features/provider/pages/ProviderSetupPage'

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
    ],
  },
])