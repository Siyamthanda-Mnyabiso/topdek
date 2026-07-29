import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { computePosition, flip, offset, shift, type Placement } from '@floating-ui/dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import type { TourStep } from '@/features/onboarding/tours.config'

interface TourPopoverProps {
  step: TourStep
  stepIndex: number
  totalSteps: number
  rect: DOMRect | null
  isFirst: boolean
  isLast: boolean
  onNext: () => void
  onPrev: () => void
  onSkip: () => void
  onFinish: () => void
}

const FLOATING_PLACEMENT: Record<NonNullable<TourStep['placement']>, Placement> = {
  top: 'top',
  bottom: 'bottom',
  left: 'left',
  right: 'right',
}

export function TourPopover({
  step,
  stepIndex,
  totalSteps,
  rect,
  isFirst,
  isLast,
  onNext,
  onPrev,
  onSkip,
  onFinish,
}: TourPopoverProps) {
  const isMobile = useMediaQuery('(max-width: 639px)')
  const popoverRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null)

  useLayoutEffect(() => {
    if (isMobile) return
    const floatingEl = popoverRef.current
    if (!floatingEl) return

    const referenceEl = {
      getBoundingClientRect: () =>
        rect ??
        DOMRect.fromRect({ x: window.innerWidth / 2, y: window.innerHeight / 2, width: 0, height: 0 }),
    }

    let cancelled = false
    void computePosition(referenceEl, floatingEl, {
      // Must match the `position: fixed` inline style below — computePosition
      // defaults to 'absolute' (document-relative) coordinates, which drift
      // from the viewport-relative fixed positioning as the page scrolls.
      strategy: 'fixed',
      placement: step.placement ? FLOATING_PLACEMENT[step.placement] : 'bottom',
      middleware: [offset(14), flip(), shift({ padding: 12 })],
    }).then(({ x, y }) => {
      if (!cancelled) setPosition({ x, y })
    })

    return () => {
      cancelled = true
    }
  }, [rect, step.placement, isMobile])

  // Move focus to the step heading whenever the step changes, and announce
  // it via the surrounding aria-live region.
  useEffect(() => {
    headingRef.current?.focus()
  }, [step.id])

  // Minimal focus trap: Tab/Shift+Tab wrap within the popover; Escape skips.
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onSkip()
        return
      }
      if (e.key !== 'Tab' || !popoverRef.current) return

      const focusable = popoverRef.current.querySelectorAll<HTMLElement>(
        'button:not(:disabled), a[href]',
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onSkip])

  const progress = ((stepIndex + 1) / totalSteps) * 100

  const content = (
    <div
      key={step.id}
      ref={popoverRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-step-title"
      className={cn(
        // Radix sets body{pointer-events:none} while a dropdown menu is
        // open (e.g. when ProfileMenu auto-opens itself for the
        // settings/help steps) — this popover is portaled to body too and
        // would otherwise inherit that and become unclickable.
        'pointer-events-auto z-[92] w-[90vw] max-w-sm border border-black bg-white shadow-2xl animate-tour-scale-in',
        isMobile ? 'rounded-t-xl' : 'rounded',
      )}
      style={
        isMobile
          ? undefined
          : {
              position: 'fixed',
              top: position?.y ?? 0,
              left: position?.x ?? 0,
              visibility: position ? 'visible' : 'hidden',
            }
      }
    >
      <div className="flex items-start justify-between gap-4 border-b border-black/10 p-5 pb-4">
        <div>
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-black/40">
            Step {stepIndex + 1} of {totalSteps}
          </p>
          <h2
            id="tour-step-title"
            ref={headingRef}
            tabIndex={-1}
            className="mt-1 text-lg font-black uppercase tracking-tight outline-none"
          >
            {step.title}
          </h2>
        </div>
        <button
          onClick={onSkip}
          aria-label="Skip tour"
          className="shrink-0 text-black/40 hover:text-black"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="h-1 w-full bg-black/10">
        <div
          className="h-full bg-black transition-[width] duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="p-5 text-sm text-black/70">{step.description}</p>

      <div className="flex items-center justify-between gap-3 border-t border-black/10 p-5 pt-4">
        <button
          onClick={onSkip}
          className="text-xs font-semibold uppercase tracking-wide text-black/40 hover:text-black"
        >
          Skip tour
        </button>
        <div className="flex gap-2">
          {!isFirst && (
            <button
              onClick={onPrev}
              className="border border-black px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] transition-colors hover:bg-black hover:text-white"
            >
              Back
            </button>
          )}
          <button
            onClick={isLast ? onFinish : onNext}
            className="border border-black bg-black px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-white hover:text-black"
          >
            {isLast ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )

  if (isMobile) {
    return <div className="fixed inset-x-0 bottom-0 z-[92] flex justify-center">{content}</div>
  }

  return content
}
