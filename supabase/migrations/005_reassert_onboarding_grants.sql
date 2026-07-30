-- The onboarding welcome screen has been reappearing on every login instead
-- of staying dismissed once a user starts/skips it. The client-side upsert
-- to onboarding_progress fails silently (logged to console only), which
-- points at the `authenticated` role missing write privileges on this
-- table live, even though 003_onboarding_tours.sql granted them — this
-- project has hit that exact class of drift before (see 003's own notes).
-- Re-asserting the grant is idempotent and harmless if it turns out the
-- grant was already in place.

GRANT SELECT, INSERT, UPDATE, DELETE ON public.onboarding_progress TO authenticated;
