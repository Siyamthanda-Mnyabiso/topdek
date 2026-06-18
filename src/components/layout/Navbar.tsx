import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

export function Navbar() {
    const { session, profile, signOut } = useAuth()
    const { pathname } = useLocation()
    const isHome = pathname === '/'
    const [menuOpen, setMenuOpen] = useState(false)
    const [hasProviderProfile, setHasProviderProfile] = useState(false)

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
                    to="/"
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                        'text-sm font-black tracking-[0.2em] uppercase',
                        barIsTransparent ? 'text-white' : 'text-black',
                    )}
                >
                    TOPDEK
                </Link>

                {/* Desktop nav */}
                <nav className="hidden items-center gap-6 lg:gap-8 sm:flex">
                    {navItems.map(({ to, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) =>
                                cn(
                                    'text-xs font-semibold tracking-[0.15em] uppercase transition-colors',
                                    barIsTransparent
                                        ? isActive ? 'text-white' : 'text-white/50 hover:text-white'
                                        : isActive ? 'text-black' : 'text-black/50 hover:text-black',
                                )
                            }
                        >
                            {label}
                        </NavLink>
                    ))}
                </nav>

                {/* Desktop right side */}
                <div className="hidden sm:flex items-center gap-4">
                    {session && profile ? (
                        <>
              <span
                  className={cn(
                      'hidden text-xs font-medium tracking-wide lg:block',
                      barIsTransparent ? 'text-white/60' : 'text-black/60',
                  )}
              >
                {profile.email}
              </span>

                            <Link
                                to="/dashboard"
                                className={cn(
                                    'border px-4 py-2 text-xs font-bold tracking-[0.1em] uppercase transition-colors',
                                    barIsTransparent
                                        ? 'border-white text-white hover:bg-white hover:text-black'
                                        : 'border-black text-black hover:bg-black hover:text-white',
                                )}
                            >
                                DASHBOARD
                            </Link>

                            <button
                                onClick={() => void signOut()}
                                className={cn(
                                    'text-xs font-semibold tracking-wide uppercase transition-colors',
                                    barIsTransparent ? 'text-white/50 hover:text-white' : 'text-black/50 hover:text-black',
                                )}
                            >
                                LOGOUT
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className={cn(
                                    'text-xs font-semibold tracking-[0.1em] uppercase transition-colors',
                                    barIsTransparent ? 'text-white/70 hover:text-white' : 'text-black hover:text-black/60',
                                )}
                            >
                                LOGIN
                            </Link>

                            <Link
                                to="/signup"
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
                <nav className="flex flex-col px-4 py-2">
                    {navItems.map(({ to, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            onClick={() => setMenuOpen(false)}
                            className={({ isActive }) =>
                                cn(
                                    'py-3 text-sm font-bold tracking-[0.1em] uppercase border-b border-black/10',
                                    isActive ? 'text-black' : 'text-black/60',
                                )
                            }
                        >
                            {label}
                        </NavLink>
                    ))}

                    {session && profile ? (
                        <div className="flex flex-col gap-3 py-4">
                            <span className="text-xs font-medium tracking-wide text-black/50 truncate">
                                {profile.email}
                            </span>
                            <Link
                                to="/dashboard"
                                onClick={() => setMenuOpen(false)}
                                className="border border-black px-4 py-3 text-center text-xs font-bold tracking-[0.1em] uppercase text-black hover:bg-black hover:text-white"
                            >
                                DASHBOARD
                            </Link>
                            <button
                                onClick={() => {
                                    setMenuOpen(false)
                                    void signOut()
                                }}
                                className="text-xs font-semibold tracking-wide uppercase text-black/50 text-left"
                            >
                                LOGOUT
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3 py-4">
                            <Link
                                to="/login"
                                onClick={() => setMenuOpen(false)}
                                className="text-xs font-semibold tracking-[0.1em] uppercase text-black text-center py-2"
                            >
                                LOGIN
                            </Link>
                            <Link
                                to="/signup"
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