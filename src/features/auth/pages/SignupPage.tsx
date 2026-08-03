import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'

export function SignupPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const result = await signUp(email, password, fullName)

    if (result.error) {
      setError(result.error)
      setIsSubmitting(false)
      return
    }

    navigate('/')
  }

  return (
      <div className="flex min-h-[80vh] items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <p className="text-xs font-semibold tracking-[0.3em] uppercase text-black/40">TOPDEK</p>
            <h1 className="mt-2 text-4xl font-black uppercase tracking-tight">CREATE ACCOUNT</h1>
            <p className="mt-2 text-sm text-black/50">Join TopDek to find or offer services.</p>
          </div>

          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
            {error && (
                <p className="border border-red-500 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-red-600">
                  {error}
                </p>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold tracking-[0.15em] uppercase">FULL NAME</label>
              <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  autoComplete="name"
                  className="w-full border border-black px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold tracking-[0.15em] uppercase">EMAIL</label>
              <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  autoComplete="email"
                  className="w-full border border-black px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold tracking-[0.15em] uppercase">PASSWORD</label>
              <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className="w-full border border-black px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-black"
              />
              <p className="text-xs text-black/40 tracking-wide">Minimum 6 characters.</p>
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full border border-black bg-black py-3 text-xs font-bold tracking-[0.15em] uppercase text-white transition-colors hover:bg-white hover:text-black disabled:opacity-50"
            >
              {isSubmitting ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
            </button>

            <p className="text-center text-xs tracking-wide text-black/50">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-black underline-offset-4 hover:underline">
                SIGN IN
              </Link>
            </p>
          </form>
        </div>
      </div>
  )
}