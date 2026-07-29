import { useEffect, useRef, useState } from 'react'

interface CompletionScreenProps {
  onDismiss: () => void
}

interface ConfettiPiece {
  id: number
  left: number
  delay: number
  color: string
  rotate: number
}

const CONFETTI_COLORS = ['#000000', '#ef4444', '#16a34a', '#3b82f6', '#9333ea']

function generateConfetti(): ConfettiPiece[] {
  return Array.from({ length: 24 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.4,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    rotate: Math.random() * 360,
  }))
}

export function CompletionScreen({ onDismiss }: CompletionScreenProps) {
  const doneButtonRef = useRef<HTMLButtonElement>(null)
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([])

  // Random values must be generated as a side effect, not during render
  // (React Compiler purity rules) — the burst appears a tick after mount,
  // which is imperceptible.
  useEffect(() => {
    queueMicrotask(() => setConfetti(generateConfetti()))
  }, [])

  useEffect(() => {
    doneButtonRef.current?.focus()
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' || e.key === 'Enter') onDismiss()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onDismiss])

  return (
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center overflow-hidden bg-black/60 px-4 animate-tour-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="completion-title"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center" aria-hidden="true">
        {confetti.map((piece) => (
          <span
            key={piece.id}
            className="absolute top-0 h-2.5 w-2.5 animate-confetti"
            style={{
              left: `${piece.left}%`,
              backgroundColor: piece.color,
              animationDelay: `${piece.delay}s`,
              transform: `rotate(${piece.rotate}deg)`,
            }}
          />
        ))}
      </div>

      <div className="w-full max-w-sm border border-black bg-white p-8 text-center shadow-2xl animate-tour-scale-in">
        <p className="text-4xl">🎉</p>
        <h2 id="completion-title" className="mt-4 text-2xl font-black uppercase tracking-tight">
          You're all set!
        </h2>
        <p className="mt-3 text-sm text-black/60">
          You know your way around now. Jump back in whenever — you can replay this tour from Settings
          any time.
        </p>

        <button
          ref={doneButtonRef}
          onClick={onDismiss}
          className="mt-8 w-full border border-black bg-black py-3 text-xs font-bold tracking-[0.15em] uppercase text-white transition-colors hover:bg-white hover:text-black"
        >
          Done
        </button>
      </div>
    </div>
  )
}
