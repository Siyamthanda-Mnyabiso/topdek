'use client'

export default function ProviderProfileError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh] px-6">
      <div className="text-center">
        <h1 className="text-3xl font-black uppercase tracking-tight">COULDN'T LOAD PROFILE</h1>
        <p className="mt-2 text-sm text-black/50">
          Something went wrong loading this page. Check your connection and try again — if you
          opened this from an app like WhatsApp or Instagram, try opening it in your regular
          browser instead.
        </p>
        <button
          onClick={reset}
          className="mt-6 border border-black bg-black px-6 py-3 text-xs font-bold tracking-[0.15em] uppercase text-white transition-colors hover:bg-white hover:text-black"
        >
          TRY AGAIN
        </button>
      </div>
    </div>
  )
}
