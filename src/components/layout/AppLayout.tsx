import { Outlet, useLocation } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'

export function AppLayout() {
    const { pathname } = useLocation()
    const isHome = pathname === '/'

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className={isHome ? '' : 'mx-auto max-w-6xl px-4 py-8'}>
                <Outlet />
            </main>
        </div>
    )
}