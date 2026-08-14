'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { NotificationBell } from '@/components/layout/NotificationBell'
import { ProfileMenu } from '@/components/layout/ProfileMenu'
import { useOnboarding } from '@/features/onboarding/hooks/useOnboarding'

function NavItem({
    to,
    label,
    active,
    dark,
    mobile,
    onClick,
}: {
    to: string
    label: string
    active: boolean
    dark?: boolean
    mobile?: boolean
    onClick?: () => void
}) {
    return (
        <Link
            href={to}
            onClick={onClick}
            className={cn(
                mobile
                    ? cn(
                        'py-3 text-sm font-bold tracking-[0.1em] uppercase border-b border-black/10',
                        active ? 'text-black' : 'text-black/60',
                    )
                    : cn(
                        'text-xs font-semibold tracking-[0.15em] uppercase transition-colors',
                        dark
                            ? active ? 'text-white' : 'text-white/50 hover:text-white'
                            : active ? 'text-black' : 'text-black/50 hover:text-black',
                    ),
            )}
        >
            {label}
        </Link>
    )
}

export function Navbar() {
    const { session, profile, signOut } = useAuth()
    const pathname = usePathname()
    const isHome = pathname === '/'
    const [menuOpen, setMenuOpen] = useState(false)
    const [hasProviderProfile, setHasProviderProfile] = useState(false)
    const { status: tourStatus, activeStep } = useOnboarding()

    const isLoggedIn = !!session

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

    // Reveal the mobile nav for the tour's "nav overview" step, same idea
    // as ProfileMenu opting itself open for the settings/help steps.
    useEffect(() => {
        if (tourStatus !== 'running' || window.innerWidth >= 640) return
        queueMicrotask(() => setMenuOpen(activeStep?.id === 'nav-overview'))
    }, [tourStatus, activeStep])

    // Base nav items for logged in users
    const baseNavItems = [
        { to: '/', label: 'HOME' },
        { to: '/professionals', label: 'PROFESSIONALS' },
        { to: '/my-bookings', label: 'MY BOOKINGS' },
        { to: '/provider/services', label: 'SERVICES' },
    ]

    // Provider-only nav items
    const providerNavItems = [
        { to: '/provider/bookings', label: 'BOOKINGS' },
        { to: '/provider/availability', label: 'AVAILABILITY' },
    ]

    const navItems = isLoggedIn
        ? hasProviderProfile
            ? [...baseNavItems, ...providerNavItems]
            : baseNavItems
        : [
            { to: '/', label: 'HOME' },
            { to: '/how-it-works', label: 'HOW IT WORKS' },
            { to: '/call-outs', label: 'CALL-OUTS' },
            { to: '/for-professionals', label: 'FOR PROFESSIONALS' },
        ]

    // Once the menu is open we lock the bar to a solid background so the
    // dropdown is always readable, regardless of whether we're on the
    // transparent home hero or not.
    const barIsTransparent = isHome && !menuOpen

    return (
        <header
            className={cn(
                'z-50 border-b',
                isHome
                    ? 'absolute top-0 left-0 right-0'
                    : 'sticky top-0',
                barIsTransparent ? 'bg-transparent border-white/10' : 'bg-white border-black',
            )}
        >
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">

                <Link
                    href="/"
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                        'text-sm font-black tracking-[0.2em] uppercase',
                        barIsTransparent ? 'text-white' : 'text-black',
                    )}
                >
                    TOPDEK
                </Link>

                {/* Desktop nav */}
                <nav data-tour="nav-links" className="hidden items-center gap-6 lg:gap-8 sm:flex">
                    {navItems.map(({ to, label }) => (
                        <NavItem
                            key={to}
                            to={to}
                            label={label}
                            active={pathname === to}
                            dark={barIsTransparent}
                        />
                    ))}
                </nav>

                {/* Desktop right side */}
                <div className="hidden sm:flex items-center gap-4">
                    {session && profile ? (
                        <>
                            <NotificationBell dark={barIsTransparent} />

                            <ProfileMenu
                                email={profile.email}
                                hasProviderProfile={hasProviderProfile}
                                onSignOut={() => void signOut()}
                                dark={barIsTransparent}
                            />
                        </>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className={cn(
                                    'text-xs font-semibold tracking-[0.1em] uppercase transition-colors',
                                    barIsTransparent ? 'text-white/70 hover:text-white' : 'text-black hover:text-black/60',
                                )}
                            >
                                LOGIN
                            </Link>

                            <Link
                                href="/signup"
                                className={cn(
                                    'border px-4 py-2 text-xs font-bold tracking-[0.1em] uppercase transition-colors',
                                    barIsTransparent
                                        ? 'border-white bg-transparent text-white hover:bg-white hover:text-black'
                                        : 'border-black bg-black text-white hover:bg-white hover:text-black',
                                )}
                            >
                                BOOK EXPERIENCE
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile menu toggle */}
                <button
                    onClick={() => setMenuOpen((open) => !open)}
                    aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                    aria-expanded={menuOpen}
                    className={cn(
                        'sm:hidden p-2 -mr-2',
                        barIsTransparent ? 'text-white' : 'text-black',
                    )}
                >
                    {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {/* Mobile slide-down menu */}
            <div
                className={cn(
                    'sm:hidden overflow-hidden bg-white border-t border-black transition-[max-height] duration-300 ease-in-out',
                    menuOpen ? 'max-h-[44rem]' : 'max-h-0',
                )}
            >
                <nav data-tour="nav-links" className="flex flex-col px-4 py-2">
                    {navItems.map(({ to, label }) => (
                        <NavItem
                            key={to}
                            to={to}
                            label={label}
                            active={pathname === to}
                            mobile
                            onClick={() => setMenuOpen(false)}
                        />
                    ))}

                    {session && profile ? (
                        <div className="flex flex-col gap-3 py-4">
                            <div className="flex items-center justify-between">
                                <ProfileMenu
                                    email={profile.email}
                                    hasProviderProfile={hasProviderProfile}
                                    onSignOut={() => {
                                        setMenuOpen(false)
                                        void signOut()
                                    }}
                                />
                                <NotificationBell />
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3 py-4">
                            <Link
                                href="/login"
                                onClick={() => setMenuOpen(false)}
                                className="text-xs font-semibold tracking-[0.1em] uppercase text-black text-center py-2"
                            >
                                LOGIN
                            </Link>
                            <Link
                                href="/signup"
                                onClick={() => setMenuOpen(false)}
                                className="border border-black bg-black px-4 py-3 text-center text-xs font-bold tracking-[0.1em] uppercase text-white"
                            >
                                BOOK EXPERIENCE
                            </Link>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    )
}
