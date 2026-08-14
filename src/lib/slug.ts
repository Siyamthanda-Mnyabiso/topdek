/** Mirrors the Postgres backfill transform in
 * supabase/migrations/010_provider_slugs.sql — keep the two in sync. */
export function slugify(businessName: string): string {
  const base = businessName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return base || 'store'
}

export function withSlugSuffix(baseSlug: string, attempt: number): string {
  return attempt <= 1 ? baseSlug : `${baseSlug}-${attempt}`
}
