import { Link, NavLink } from 'react-router-dom'
import { LogOut, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { cn } from '@/lib/utils'

export function Navbar() {
  const { session, profile, signOut } = useAuth()

  return (
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
              <Layers className="h-5 w-5" />
              TopDeck
            </Link>

            <nav className="hidden items-center gap-1 sm:flex">
              <NavLink
                  to="/"
                  className={({ isActive }) =>
                      cn(
                          'rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent',
                          isActive ? 'text-foreground' : 'text-muted-foreground',
                      )
                  }
              >
                Home
              </NavLink>

              {session && (
                  <NavLink
                      to="/dashboard"
                      className={({ isActive }) =>
                          cn(
                              'rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent',
                              isActive ? 'text-foreground' : 'text-muted-foreground',
                          )
                      }
                  >
                    Dashboard
                  </NavLink>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {session && profile ? (
                <>
                  <div className="hidden text-right sm:block">
                    <p className="text-sm font-medium">{profile.email}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => void signOut()}>
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </>
            ) : (
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/login">Login</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link to="/signup">Sign up</Link>
                  </Button>
                </>
            )}
          </div>
        </div>
      </header>
  )
}