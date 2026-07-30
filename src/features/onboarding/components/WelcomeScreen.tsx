import { useEffect, useRef } from 'react'
import { Compass } from 'lucide-react'

interface WelcomeScreenProps {
  onStart: () => void
  onSkip: () => void
}

export function WelcomeScreen({ onStart, onSkip }: WelcomeScreenProps) {
  const startButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    startButtonRef.current?.focus()
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onSkip()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onSkip])

  return (
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center bg-black/60 px-4 animate-tour-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
    >
      <div className="w-full max-w-sm border border-black bg-white p-8 text-center shadow-2xl animate-tour-scale-in">
        <Compass className="mx-auto h-10 w-10" strokeWidth={1.5} />
        <h2 id="welcome-title" className="mt-4 text-2xl font-black uppercase tracking-tight">
          Welcome to TopDek!
        </h2>
        <p className="mt-3 text-sm text-black/60">
          Let's take a quick tour so you know where everything is.
        </p>

        <button
          ref={startButtonRef}
          onClick={onStart}
          className="mt-8 w-full border border-black bg-black py-3 text-xs font-bold tracking-[0.15em] uppercase text-white transition-colors hover:bg-white hover:text-black"
        >
          Start Tour
        </button>
        <button
          onClick={onSkip}
          className="mt-3 w-full text-xs font-semibold uppercase tracking-wide text-black/40 hover:text-black"
        >
          Skip
        </button>
      </div>
    </div>
  )
}
