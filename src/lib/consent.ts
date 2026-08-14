export type ConsentChoice = 'accepted' | 'declined'

const STORAGE_KEY = 'topdek-cookie-consent'
const CONSENT_EVENT = 'topdek-consent-change'

function parseConsent(value: string | null): ConsentChoice | null {
  return value === 'accepted' || value === 'declined' ? value : null
}

export function getStoredConsent(): ConsentChoice | null {
  return parseConsent(window.localStorage.getItem(STORAGE_KEY))
}

export function getConsentServerSnapshot(): ConsentChoice | null {
  return null
}

export function storeConsent(choice: ConsentChoice) {
  window.localStorage.setItem(STORAGE_KEY, choice)
  window.dispatchEvent(new Event(CONSENT_EVENT))
}

export function subscribeConsent(callback: () => void) {
  window.addEventListener(CONSENT_EVENT, callback)
  window.addEventListener('storage', callback)
  return () => {
    window.removeEventListener(CONSENT_EVENT, callback)
    window.removeEventListener('storage', callback)
  }
}
