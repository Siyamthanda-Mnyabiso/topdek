// Called only by the `fanout_push` trigger on public.notifications (via
// pg_net), never by a logged-in user — hence no JWT verification, just a
// shared-secret header check. Loads the notification + the recipient's push
// subscriptions and sends a real Web Push (VAPID) to each one, pruning any
// subscription the push service reports as gone.
import { createClient } from 'npm:@supabase/supabase-js@2'
import webpush from 'npm:web-push@3'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const WEBHOOK_SECRET = Deno.env.get('WEBHOOK_SECRET')!
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT')!

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

interface RequestBody {
  notification_id: string
}

Deno.serve(async (req) => {
  if (req.headers.get('x-webhook-secret') !== WEBHOOK_SECRET) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    const { notification_id: notificationId } = (await req.json()) as RequestBody
    if (!notificationId) {
      return new Response('notification_id is required', { status: 400 })
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

    const { data: notification, error: notificationError } = await admin
      .from('notifications')
      .select('id, user_id, type, title, body, data')
      .eq('id', notificationId)
      .single()

    if (notificationError || !notification) {
      return new Response('Notification not found', { status: 404 })
    }

    const { data: subscriptions, error: subsError } = await admin
      .from('push_subscriptions')
      .select('id, endpoint, p256dh, auth')
      .eq('user_id', notification.user_id)

    if (subsError) {
      return new Response(subsError.message, { status: 500 })
    }
    if (!subscriptions || subscriptions.length === 0) {
      return new Response('No subscriptions for user', { status: 200 })
    }

    const payload = JSON.stringify({
      title: notification.title,
      body: notification.body,
      data: { ...notification.data, notificationId: notification.id, type: notification.type },
    })

    const staleSubscriptionIds: string[] = []

    await Promise.all(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            },
            payload,
          )
        } catch (err) {
          const statusCode = (err as { statusCode?: number }).statusCode
          if (statusCode === 404 || statusCode === 410) {
            staleSubscriptionIds.push(sub.id)
          } else {
            console.error('web-push send failed', sub.id, err)
          }
        }
      }),
    )

    if (staleSubscriptionIds.length > 0) {
      await admin.from('push_subscriptions').delete().in('id', staleSubscriptionIds)
    }

    return new Response('ok', { status: 200 })
  } catch (err) {
    console.error(err)
    return new Response(err instanceof Error ? err.message : 'Unknown error', { status: 500 })
  }
})
