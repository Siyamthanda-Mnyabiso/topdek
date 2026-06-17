import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

export function ResetPasswordPage() {
    const navigate = useNavigate()
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault()
        setError(null)

        if (password !== confirm) {
            setError('Passwords do not match.')
            return
        }

        setIsSubmitting(true)

        const { error } = await supabase.auth.updateUser({ password })

        if (error) {
            setError(error.message)
            setIsSubmitting(false)
            return
        }

        navigate('/dashboard')
    }

    return (
        <div className="flex min-h-[80vh] items-center justify-center px-6">
            <div className="w-full max-w-md">
                <div className="mb-8">
                    <p className="text-xs font-semibold tracking-[0.3em] uppercase text-black/40">TOPDECK</p>
                    <h1 className="mt-2 text-4xl font-black uppercase tracking-tight">NEW PASSWORD</h1>
                    <p className="mt-2 text-sm text-black/50">Choose a new password for your account.</p>
                </div>

                <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
                    {error && (
                        <p className="border border-red-500 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-red-600">
                            {error}
                        </p>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-bold tracking-[0.15em] uppercase">NEW PASSWORD</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            className="w-full border border-black px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-black"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold tracking-[0.15em] uppercase">CONFIRM PASSWORD</label>
                        <input
                            type="password"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            required
                            minLength={6}
                            className="w-full border border-black px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-black"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full border border-black bg-black py-3 text-xs font-bold tracking-[0.15em] uppercase text-white transition-colors hover:bg-white hover:text-black disabled:opacity-50"
                    >
                        {isSubmitting ? 'UPDATING...' : 'UPDATE PASSWORD'}
                    </button>
                </form>
            </div>
        </div>
    )
}