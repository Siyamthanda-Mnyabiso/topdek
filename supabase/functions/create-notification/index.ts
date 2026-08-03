// Called by the app right after a booking mutation succeeds. Verifies the
// caller is actually a party to the booking, then inserts a notifications
// row for the *other* party. The notifications table's own AFTER INSERT
// trigger takes care of fanning the row out to web push — this function
// only needs to worry about "what happened" and "who should hear about it".
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

type BookingEvent =
  | 'booking_created'
  | 'booking_accepted'
  | 'booking_declined'
  | 'booking_cancelled'
  | 'booking_completed'
  | 'booking_rescheduled'

interface RequestBody {
  bookingId: string
  event: BookingEvent
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return json({ error: 'Missing Authorization header' }, 401)
    }

    const anon = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    })
    const {
      data: { user },
      error: userError,
    } = await anon.auth.getUser()

    if (userError || !user) {
      return json({ error: 'Not authenticated' }, 401)
    }

    const { bookingId, event } = (await req.json()) as RequestBody
    if (!bookingId || !event) {
      return json({ error: 'bookingId and event are required' }, 400)
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

    const { data: booking, error: bookingError } = await admin
      .from('bookings')
      .select(
        `
        id,
        client_id,
        service_name,
        booking_date,
        start_time,
        provider:provider_id ( user_id, business_name ),
        client:client_id ( full_name, email )
      `,
      )
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      return json({ error: 'Booking not found' }, 404)
    }

    const provider = booking.provider as unknown as {
      user_id: string
      business_name: string
    }
    const client = booking.client as unknown as { full_name: string | null; email: string }
    const clientName = client.full_name || client.email

    const isClient = user.id === booking.client_id
    const isProvider = user.id === provider.user_id
    if (!isClient && !isProvider) {
      return json({ error: 'Not a party to this booking' }, 403)
    }

    const when = `${booking.booking_date} at ${booking.start_time}`
    const notifyProvider = event === 'booking_created'

    // Only the party who *didn't* cause the event should be able to trigger
    // it (e.g. only the client can fire booking_created, only the provider
    // can fire the status-change events).
    if (notifyProvider && !isClient) {
      return json({ error: 'Only the client can report booking_created' }, 403)
    }
    if (!notifyProvider && !isProvider) {
      return json({ error: 'Only the provider can report this event' }, 403)
    }

    const recipientUserId = notifyProvider ? provider.user_id : booking.client_id
    const url = notifyProvider ? '/provider/bookings' : '/my-bookings'

    const messages: Record<BookingEvent, { title: string; body: string }> = {
      booking_created: {
        title: 'New booking request',
        body: `${clientName} requested ${booking.service_name} on ${when}`,
      },
      booking_accepted: {
        title: 'Booking confirmed',
        body: `${provider.business_name} confirmed your ${booking.service_name} booking`,
      },
      booking_declined: {
        title: 'Booking declined',
        body: `${provider.business_name} declined your ${booking.service_name} booking`,
      },
      booking_cancelled: {
        title: 'Booking cancelled',
        body: `${provider.business_name} cancelled your ${booking.service_name} booking`,
      },
      booking_completed: {
        title: 'Service completed',
        body: `Your ${booking.service_name} with ${provider.business_name} is complete`,
      },
      booking_rescheduled: {
        title: 'Booking rescheduled',
        body: `${provider.business_name} rescheduled your ${booking.service_name} booking`,
      },
    }

    const { title, body } = messages[event]

    const { error: insertError } = await admin.from('notifications').insert({
      user_id: recipientUserId,
      type: event,
      title,
      body,
      data: { bookingId, url },
    })

    if (insertError) {
      return json({ error: insertError.message }, 500)
    }

    return json({ ok: true })
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'Unknown error' }, 500)
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
