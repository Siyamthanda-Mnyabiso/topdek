import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import { useOnboarding } from '@/features/onboarding/hooks/useOnboarding'
import { TourOverlay } from '@/features/onboarding/components/TourOverlay'
import { TourPopover } from '@/features/onboarding/components/TourPopover'
import { WelcomeScreen } from '@/features/onboarding/components/WelcomeScreen'
import { CompletionScreen } from '@/features/onboarding/components/CompletionScreen'

function isVisible(el: Element) {
  const rect = el.getBoundingClientRect()
  return rect.width > 0 && rect.height > 0
}

function findVisibleTarget(targetId: string): HTMLElement | null {
  const candidates = document.querySelectorAll<HTMLElement>(`[data-tour="${targetId}"]`)
  for (const el of candidates) {
    if (isVisible(el)) return el
  }
  return null
}

function isInViewport(rect: DOMRect) {
  return rect.top >= 0 && rect.left >= 0 && rect.bottom <= window.innerHeight && rect.right <= window.innerWidth
}

/** Mounted once in AppLayout. Owns all cross-page tour orchestration:
 * navigating to a step's route, locating its `[data-tour]` target (with a
 * short retry window for elements that mount after navigation/data
 * fetching), scrolling it into view, and keeping the spotlight rect in
 * sync with the viewport. */
export function TourHost() {
  const { status, tour, stepIndex, activeStep, next, prev, skip, finish, begin, dismissCelebration } =
    useOnboarding()
  const location = useLocation()
  const navigate = useNavigate()
  const [rect, setRect] = useState<DOMRect | null>(null)
  const targetElRef = useRef<HTMLElement | null>(null)
  const [reduceMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)

  useEffect(() => {
    if (status !== 'running' || !activeStep) {
      queueMicrotask(() => setRect(null))
      targetElRef.current = null
      return
    }

    if (activeStep.route && location.pathname !== activeStep.route) {
      navigate(activeStep.route)
      return
    }

    let cancelled = false
    let frame: number
    const deadline = Date.now() + 3000

    function ensureVisible(el: HTMLElement) {
      const elRect = el.getBoundingClientRect()
      setRect(elRect)
      if (!isInViewport(elRect)) {
        el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' })
      }
    }

    function poll() {
      if (cancelled) return
      const el = findVisibleTarget(activeStep!.targetId)
      if (el) {
        targetElRef.current = el
        ensureVisible(el)
        return
      }
      if (Date.now() < deadline) {
        frame = requestAnimationFrame(poll)
      } else {
        console.warn(`Tour target "${activeStep!.targetId}" not found — skipping highlight for this step.`)
        setRect(null)
      }
    }
    poll()

    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
    }
  }, [status, activeStep, location.pathname, navigate, reduceMotion])

  // Keep the spotlight glued to its target across window resizes and any
  // scrolling the click-blocker doesn't manage to suppress (momentum
  // scroll, mobile address-bar collapse) — tracking only, never
  // re-triggering scrollIntoView here, or every intermediate 'scroll' event
  // fired *by* an in-progress scrollIntoView animation would restart it
  // before it ever finishes.
  useEffect(() => {
    if (status !== 'running') return
    let frame: number | null = null
    function trackRect() {
      if (frame !== null) return
      frame = requestAnimationFrame(() => {
        frame = null
        if (targetElRef.current) setRect(targetElRef.current.getBoundingClientRect())
      })
    }
    window.addEventListener('resize', trackRect)
    window.addEventListener('scroll', trackRect, { capture: true, passive: true })
    return () => {
      window.removeEventListener('resize', trackRect)
      window.removeEventListener('scroll', trackRect, { capture: true })
      if (frame !== null) cancelAnimationFrame(frame)
    }
  }, [status])

  // Separately: layout shifts from async page data resolving after the
  // target was first located (new content pushing it further down) won't
  // fire a resize/scroll event on their own, but do resize the body — this
  // one legitimately re-checks and re-scrolls if needed, since it fires
  // independently of any scroll animation already in flight.
  useEffect(() => {
    if (status !== 'running') return
    let frame: number | null = null
    const bodyObserver = new ResizeObserver(() => {
      if (frame !== null) return
      frame = requestAnimationFrame(() => {
        frame = null
        const el = targetElRef.current
        if (!el) return
        const elRect = el.getBoundingClientRect()
        if (!isInViewport(elRect)) {
          el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' })
        }
      })
    })
    bodyObserver.observe(document.body)
    return () => {
      bodyObserver.disconnect()
      if (frame !== null) cancelAnimationFrame(frame)
    }
  }, [status, reduceMotion])

  if (status === 'welcome' && tour) {
    return createPortal(<WelcomeScreen tour={tour} onStart={begin} onSkip={skip} />, document.body)
  }

  if (status === 'celebrating') {
    return createPortal(<CompletionScreen onDismiss={dismissCelebration} />, document.body)
  }

  if (status === 'running' && tour && activeStep) {
    return createPortal(
      <div aria-live="polite">
        <TourOverlay rect={rect} reduceMotion={reduceMotion} />
        <TourPopover
          step={activeStep}
          stepIndex={stepIndex}
          totalSteps={tour.steps.length}
          rect={rect}
          isFirst={stepIndex === 0}
          isLast={stepIndex === tour.steps.length - 1}
          onNext={next}
          onPrev={prev}
          onSkip={skip}
          onFinish={finish}
        />
      </div>,
      document.body,
    )
  }

  return null
}
