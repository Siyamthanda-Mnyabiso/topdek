import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { cn } from '@/lib/utils'

export function Navbar() {
    const { session, profile, signOut } = useAuth()
    const { pathname } = useLocation()
    const isHome = pathname === '/'

    const isLoggedIn = !!session

    const navItems = isLoggedIn
        ? [
            { to: '/', label: 'HOME' },
            { to: '/professionals', label: 'PROFESSIONALS' },
            { to: '/provider/services', label: 'SERVICES' },
        ]
        : [
            { to: '/', label: 'HOME' },
            { to: '/how-it-works', label: 'HOW IT WORKS' },
            { to: '/call-outs', label: 'CALL-OUTS' },
            { to: '/for-professionals', label: 'FOR PROFESSIONALS' },
        ]

    return (
        <header
            className={cn(
                'z-50 border-b border-white/10',
                isHome
                    ? 'absolute top-0 left-0 right-0 bg-transparent'
                    : 'sticky top-0 bg-white border-black',
            )}
        >
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

                <Link
                    to="/"
                    className={cn(
                        'text-sm font-black tracking-[0.2em] uppercase',
                        isHome ? 'text-white' : 'text-black',
                    )}
                >
                    TOPDEK
                </Link>

                <nav className="hidden items-center gap-8 sm:flex">
                    {navItems.map(({ to, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) =>
                                cn(
                                    'text-xs font-semibold tracking-[0.15em] uppercase transition-colors',
                                    isHome
                                        ? isActive ? 'text-white' : 'text-white/50 hover:text-white'
                                        : isActive ? 'text-black' : 'text-black/50 hover:text-black',
                                )
                            }
                        >
                            {label}
                        </NavLink>
                    ))}
                </nav>

                <div className="flex items-center gap-4">
                    {session && profile ? (
                        <>
              <span
                  className={cn(
                      'hidden text-xs font-medium tracking-wide sm:block',
                      isHome ? 'text-white/60' : 'text-black/60',
                  )}
              >
                {profile.email}
              </span>

                            <Link
                                to="/dashboard"
                                className={cn(
                                    'border px-4 py-2 text-xs font-bold tracking-[0.1em] uppercase transition-colors',
                                    isHome
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
                                    isHome ? 'text-white/50 hover:text-white' : 'text-black/50 hover:text-black',
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
                                    isHome ? 'text-white/70 hover:text-white' : 'text-black hover:text-black/60',
                                )}
                            >
                                LOGIN
                            </Link>

                            <Link
                                to="/signup"
                                className={cn(
                                    'border px-4 py-2 text-xs font-bold tracking-[0.1em] uppercase transition-colors',
                                    isHome
                                        ? 'border-white bg-transparent text-white hover:bg-white hover:text-black'
                                        : 'border-black bg-black text-white hover:bg-white hover:text-black',
                                )}
                            >
                                BOOK EXPERIENCE
                            </Link>
                        </>
                    )}
                </div>

            </div>
        </header>
    )
}