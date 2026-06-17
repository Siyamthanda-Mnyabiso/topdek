import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { supabase } from '@/lib/supabase'

export function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showForgot, setShowForgot] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSent, setForgotSent] = useState(false)
  const [forgotError, setForgotError] = useState<string | null>(null)
  const [forgotSubmitting, setForgotSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const result = await signIn(email, password)

    if (result.error) {
      setError(result.error)
      setIsSubmitting(false)
      return
    }

    navigate(from, { replace: true })
  }

  async function handleForgotPassword(event: React.FormEvent) {
    event.preventDefault()
    setForgotError(null)
    setForgotSubmitting(true)

    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      setForgotError(error.message)
      setForgotSubmitting(false)
      return
    }

    setForgotSent(true)
    setForgotSubmitting(false)
  }

  if (showForgot) {
    return (
        <div className="flex min-h-[80vh] items-center justify-center px-6">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <p className="text-xs font-semibold tracking-[0.3em] uppercase text-black/40">TOPDEK</p>
              <h1 className="mt-2 text-4xl font-black uppercase tracking-tight">RESET PASSWORD</h1>
              <p className="mt-2 text-sm text-black/50">
                Enter your email and we'll send you a reset link.
              </p>
            </div>

            {forgotSent ? (
                <div className="border border-black p-6">
                  <p className="text-sm font-semibold uppercase tracking-widest">CHECK YOUR EMAIL</p>
                  <p className="mt-2 text-sm text-black/60">
                    We sent a password reset link to <strong>{forgotEmail}</strong>.
                  </p>
                  <button
                      onClick={() => { setShowForgot(false); setForgotSent(false) }}
                      className="mt-6 text-xs font-bold tracking-[0.15em] uppercase underline-offset-4 hover:underline"
                  >
                    BACK TO LOGIN
                  </button>
                </div>
            ) : (
                <form onSubmit={(e) => void handleForgotPassword(e)} className="space-y-6">
                  {forgotError && (
                      <p className="border border-red-500 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-red-600">
                        {forgotError}
                      </p>
                  )}
                  <div className="space-y-2">
                    <label className="text-xs font-bold tracking-[0.15em] uppercase">EMAIL</label>
                    <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="w-full border border-black px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>
                  <button
                      type="submit"
                      disabled={forgotSubmitting}
                      className="w-full border border-black bg-black py-3 text-xs font-bold tracking-[0.15em] uppercase text-white transition-colors hover:bg-white hover:text-black disabled:opacity-50"
                  >
                    {forgotSubmitting ? 'SENDING...' : 'SEND RESET LINK'}
                  </button>
                  <button
                      type="button"
                      onClick={() => setShowForgot(false)}
                      className="w-full text-xs font-semibold tracking-[0.15em] uppercase text-black/50 hover:text-black transition-colors"
                  >
                    BACK TO LOGIN
                  </button>
                </form>
            )}
          </div>
        </div>
    )
  }

  return (
      <div className="flex min-h-[80vh] items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <p className="text-xs font-semibold tracking-[0.3em] uppercase text-black/40">TOPDEK</p>
            <h1 className="mt-2 text-4xl font-black uppercase tracking-tight">WELCOME BACK</h1>
            <p className="mt-2 text-sm text-black/50">Sign in to your TopDek account.</p>
          </div>

          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
            {error && (
                <p className="border border-red-500 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-red-600">
                  {error}
                </p>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold tracking-[0.15em] uppercase">EMAIL</label>
              <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  className="w-full border border-black px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold tracking-[0.15em] uppercase">PASSWORD</label>
                <button
                    type="button"
                    onClick={() => setShowForgot(true)}
                    className="text-xs font-semibold tracking-wide uppercase text-black/40 hover:text-black transition-colors"
                >
                  FORGOT PASSWORD?
                </button>
              </div>
              <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full border border-black px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full border border-black bg-black py-3 text-xs font-bold tracking-[0.15em] uppercase text-white transition-colors hover:bg-white hover:text-black disabled:opacity-50"
            >
              {isSubmitting ? 'SIGNING IN...' : 'SIGN IN'}
            </button>

            <p className="text-center text-xs tracking-wide text-black/50">
              Don't have an account?{' '}
              <Link to="/signup" className="font-bold text-black underline-offset-4 hover:underline">
                SIGN UP
              </Link>
            </p>
          </form>
        </div>
      </div>
  )
}