-- Adds human-readable, SEO-friendly slugs to provider storefronts
-- (/professionals/<slug> instead of /professionals/<uuid>), generated from
-- business_name. Existing rows are backfilled deterministically (ties
-- broken by creation order, e.g. "cuts-by-siya", "cuts-by-siya-2"); new
-- rows get their slug set once at creation time in the app and it is never
-- regenerated afterwards, so published/shared links stay stable even if the
-- business name is edited later.
--
-- Also tracks `categories` (text[]), which the app has been reading/writing
-- against the live schema without a corresponding tracked migration.

ALTER TABLE public.provider_profiles
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS categories text[];

WITH base AS (
  SELECT
    id,
    NULLIF(trim(both '-' from regexp_replace(lower(business_name), '[^a-z0-9]+', '-', 'g')), '') AS base_slug,
    created_at
  FROM public.provider_profiles
  WHERE slug IS NULL
),
numbered AS (
  SELECT
    id,
    COALESCE(base_slug, 'store') AS base_slug,
    ROW_NUMBER() OVER (PARTITION BY COALESCE(base_slug, 'store') ORDER BY created_at, id) AS rn
  FROM base
)
UPDATE public.provider_profiles p
SET slug = CASE WHEN n.rn = 1 THEN n.base_slug ELSE n.base_slug || '-' || n.rn END
FROM numbered n
WHERE p.id = n.id;

ALTER TABLE public.provider_profiles
  ALTER COLUMN slug SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_provider_profiles_slug
  ON public.provider_profiles (slug);

-- No RLS change needed: provider_profiles already has a public "Anyone can
-- read provider profiles" USING (true) policy plus an anon GRANT (see
-- 008_grant_anon_public_reads.sql), so slug/categories are visible
-- wherever select('*') already is.
