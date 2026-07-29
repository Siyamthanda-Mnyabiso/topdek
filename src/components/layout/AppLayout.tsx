import { Outlet, useLocation } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'
import { TourHost } from '@/features/onboarding/components/TourHost'

export function AppLayout() {
    const { pathname } = useLocation()
    const isHome = pathname === '/'

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className={isHome ? '' : 'mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8'}>
                <Outlet />
            </main>
            <TourHost />
        </div>
    )
}