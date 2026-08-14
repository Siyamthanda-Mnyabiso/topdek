'use client'

import { useSyncExternalStore } from 'react'
import { GoogleAnalytics } from '@next/third-parties/google'
import {
  getStoredConsent,
  getConsentServerSnapshot,
  storeConsent,
  subscribeConsent,
  type ConsentChoice,
} from '@/lib/consent'

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

export function CookieConsent() {
  const consent = useSyncExternalStore(subscribeConsent, getStoredConsent, getConsentServerSnapshot)

  function choose(choice: ConsentChoice) {
    storeConsent(choice)
  }

  return (
    <>
      {consent === 'accepted' && GA_MEASUREMENT_ID && <GoogleAnalytics gaId={GA_MEASUREMENT_ID} />}

      {consent === null && (
        <div
          role="dialog"
          aria-label="Cookie consent"
          className="fixed inset-x-0 bottom-0 z-[100] border-t border-black bg-white px-6 py-4 sm:px-10"
        >
          <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <p className="text-sm text-black/70">
              We use cookies to understand site traffic and improve TopDek. You can accept or
              decline analytics cookies.
            </p>
            <div className="flex shrink-0 gap-3">
              <button
                onClick={() => choose('declined')}
                className="border border-black/20 px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] text-black/60 transition-colors hover:border-black hover:text-black"
              >
                Decline
              </button>
              <button
                onClick={() => choose('accepted')}
                className="border border-black bg-black px-4 py-2 text-xs font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-white hover:text-black"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
