-- Tracks storefront page views so providers can see traffic on their own
-- store ("142 views this month"). Rows are written exclusively by a
-- server-side route using the service-role key (never by anon/authenticated
-- clients directly), which hashes the visitor's IP + day server-side before
-- insert — no raw IP address is ever persisted. Only the owning provider
-- can read their own view rows; there is no public/anon read access.

CREATE TABLE public.storefront_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES public.provider_profiles(id) ON DELETE CASCADE,
  viewer_hash text NOT NULL,
  viewed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_storefront_views_provider_viewed_at
  ON public.storefront_views (provider_id, viewed_at);

-- Used to dedupe repeat views from the same visitor within a short window.
CREATE INDEX idx_storefront_views_dedupe
  ON public.storefront_views (provider_id, viewer_hash, viewed_at);

ALTER TABLE public.storefront_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Providers can read their own storefront views"
  ON public.storefront_views FOR SELECT
  USING (public.owns_provider_profile(provider_id));

-- No INSERT/UPDATE/DELETE policies for anon/authenticated: writes only
-- happen server-side via the service-role key, which bypasses RLS.
