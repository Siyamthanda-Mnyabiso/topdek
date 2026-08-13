-- The `anon` Postgres role was never given the ordinary table GRANT that
-- Postgres requires before RLS policies are even evaluated (same class of
-- gap fixed for `authenticated`/`service_role` in 002/003/005 — see their
-- comments). This meant every "public" read policy in the app — provider
-- storefronts, active services, service images, reviews — was completely
-- unreachable for logged-out visitors: PostgREST returned 401 "permission
-- denied for table ..." instead of ever evaluating RLS.
--
-- Confirmed directly against the anon role, bypassing any client/browser
-- cache: GET .../rest/v1/provider_profiles as anon returned
-- {"code":"42501","message":"permission denied for table provider_profiles"}.
--
-- Only granting on the tables that have a genuinely public SELECT policy.
-- service_images has no tracked migration (schema drift, see
-- src/types/database.ts) but is read on the public storefront, so it's
-- included here too.

GRANT SELECT ON public.provider_profiles TO anon;
GRANT SELECT ON public.services TO anon;
GRANT SELECT ON public.service_images TO anon;
GRANT SELECT ON public.reviews TO anon;
