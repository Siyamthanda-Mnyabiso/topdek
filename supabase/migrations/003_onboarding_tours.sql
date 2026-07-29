-- Onboarding tour progress. Keyed by (user_id, tour_id) rather than a
-- single global flag so the same table/engine can host multiple named
-- tours (e.g. 'client-main', 'provider-main', and future per-feature
-- mini-tours) without any schema changes.

CREATE TABLE public.onboarding_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  tour_id text NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  current_step integer NOT NULL DEFAULT 0,
  completed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, tour_id)
);

CREATE INDEX idx_onboarding_progress_user_id ON public.onboarding_progress (user_id);

ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own onboarding progress"
  ON public.onboarding_progress FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS policies alone don't grant access — Postgres still requires the
-- ordinary table GRANT before a policy is even evaluated (see migration
-- 002's notes; this project is missing the standard Supabase bootstrap
-- grants). Fixed for `authenticated` project-wide here, mirroring the
-- service_role fix from migration 002, so this stops recurring for every
-- future table. Safe because every public table already has RLS enabled
-- with real policies — this grant alone doesn't expose any row RLS blocks.
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;

CREATE TRIGGER onboarding_progress_updated_at
  BEFORE UPDATE ON public.onboarding_progress
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
