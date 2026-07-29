-- Web push notifications: in-app notification feed + push subscriptions,
-- fanned out to a Web Push (VAPID) Edge Function on every insert.
--
-- Note: this migration only adds new objects. It does not touch `bookings`
-- or its `status` values, which have drifted from migration 001 / the
-- generated types (see src/types/database.ts) via ad-hoc schema changes —
-- resolving that drift is out of scope here since nothing below depends on
-- the exact booking_status enum.

-- ---------------------------------------------------------------------------
-- service_role table grants
-- ---------------------------------------------------------------------------
-- This project was missing the standard Supabase bootstrap grants for
-- service_role on the public schema (service_role bypasses RLS but still
-- needs an ordinary GRANT to touch a table at all — confirmed missing on
-- every existing table, not just ones added here). The create-notification
-- and send-push Edge Functions both need service-role read/write access, so
-- this restores the normal Supabase default for the whole schema rather
-- than patching just the two new tables below.

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO service_role;

-- ---------------------------------------------------------------------------
-- notifications
-- ---------------------------------------------------------------------------

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  type text NOT NULL CHECK (
    type IN (
      'booking_created',
      'booking_accepted',
      'booking_declined',
      'booking_cancelled',
      'booking_completed',
      'booking_rescheduled',
      'ticket_message'
    )
  ),
  title text NOT NULL,
  body text NOT NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user_created
  ON public.notifications (user_id, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies alone don't grant access — Postgres still requires the
-- ordinary table GRANT below before a policy is even evaluated.
GRANT SELECT, UPDATE ON public.notifications TO authenticated;

-- No INSERT policy/grant for authenticated users on purpose: rows are only
-- ever created by the create-notification Edge Function (service role) or
-- the notify_ticket_message trigger below (SECURITY DEFINER).
CREATE POLICY "Users can read own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can mark own notifications read"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- ---------------------------------------------------------------------------
-- push_subscriptions
-- ---------------------------------------------------------------------------

CREATE TABLE public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  endpoint text NOT NULL UNIQUE,
  p256dh text NOT NULL,
  auth text NOT NULL,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_push_subscriptions_user_id ON public.push_subscriptions (user_id);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.push_subscriptions TO authenticated;

CREATE POLICY "Users can manage own push subscriptions"
  ON public.push_subscriptions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- ticket_messages -> notifications
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.notify_ticket_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ticket_owner uuid;
  ticket_assignee uuid;
  recipient uuid;
BEGIN
  SELECT user_id, assigned_to INTO ticket_owner, ticket_assignee
  FROM public.tickets
  WHERE id = NEW.ticket_id;

  IF NEW.sender_id = ticket_owner THEN
    recipient := ticket_assignee;
  ELSE
    recipient := ticket_owner;
  END IF;

  IF recipient IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, body, data)
    VALUES (
      recipient,
      'ticket_message',
      'New support message',
      left(NEW.message, 200),
      jsonb_build_object('ticketId', NEW.ticket_id, 'url', '/support/tickets/' || NEW.ticket_id)
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_ticket_message_insert
  AFTER INSERT ON public.ticket_messages
  FOR EACH ROW EXECUTE FUNCTION public.notify_ticket_message();

-- ---------------------------------------------------------------------------
-- notifications -> push fan-out
-- ---------------------------------------------------------------------------
-- Requires a Vault secret named 'webhook_secret' holding the same value
-- configured as the send-push Edge Function's WEBHOOK_SECRET env var:
--   select vault.create_secret('<random-value>', 'webhook_secret');
-- (run once, manually, via the SQL editor or `supabase db execute` — not
-- part of this migration so the secret never lands in git history)

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

CREATE OR REPLACE FUNCTION public.fanout_push()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, vault, net
AS $$
DECLARE
  secret text;
BEGIN
  SELECT decrypted_secret INTO secret
  FROM vault.decrypted_secrets
  WHERE name = 'webhook_secret';

  IF secret IS NOT NULL THEN
    PERFORM net.http_post(
      url := 'https://jjbuxitnqtwxfhbfvnjl.supabase.co/functions/v1/send-push',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-webhook-secret', secret
      ),
      body := jsonb_build_object('notification_id', NEW.id)
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_notification_insert
  AFTER INSERT ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.fanout_push();
