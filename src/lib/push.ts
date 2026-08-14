import { supabase } from '@/lib/supabase'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

export function isPushSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}

export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return null
  return navigator.serviceWorker.register('/sw.js')
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)))
}

/** Requests notification permission (must be called from a user gesture) and
 * subscribes to push, storing the subscription for the current user. */
export async function subscribeToPush(userId: string): Promise<{ error: string | null }> {
  if (!isPushSupported()) {
    return { error: 'Push notifications are not supported in this browser.' }
  }
  if (!VAPID_PUBLIC_KEY) {
    return { error: 'Push notifications are not configured for this environment.' }
  }

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') {
    return { error: 'Notification permission was not granted.' }
  }

  const registration = await registerServiceWorker()
  if (!registration) {
    return { error: 'Service worker registration failed.' }
  }

  const readyRegistration = await navigator.serviceWorker.ready

  let subscription = await readyRegistration.pushManager.getSubscription()
  if (!subscription) {
    subscription = await readyRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    })
  }

  const json = subscription.toJSON()
  if (!json.keys?.p256dh || !json.keys?.auth) {
    return { error: 'Push subscription is missing encryption keys.' }
  }

  const { error } = await supabase.from('push_subscriptions').upsert(
    {
      user_id: userId,
      endpoint: subscription.endpoint,
      p256dh: json.keys.p256dh,
      auth: json.keys.auth,
      user_agent: navigator.userAgent,
    },
    { onConflict: 'endpoint' },
  )

  if (error) return { error: error.message }
  return { error: null }
}

export async function getPushPermissionState(): Promise<NotificationPermission | 'unsupported'> {
  if (!isPushSupported()) return 'unsupported'
  return Notification.permission
}

export async function unsubscribeFromPush() {
  if (!('serviceWorker' in navigator)) return
  const registration = await navigator.serviceWorker.getRegistration('/sw.js')
  const subscription = await registration?.pushManager.getSubscription()
  if (!subscription) return

  await supabase.from('push_subscriptions').delete().eq('endpoint', subscription.endpoint)
  await subscription.unsubscribe()
}
