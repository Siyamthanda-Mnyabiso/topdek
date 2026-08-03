-- Providers currently can't see anything about a client beyond their own
-- booking rows: public.users only grants "read your own row", so the
-- provider-side client join (BookingsPage.tsx) always comes back null and
-- the UI falls back to "Unknown Client" for every booking except a client
-- who happens to book their own store. Fixes that, and adds a full_name
-- column so bookings can show a real name instead of a raw email address.

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS full_name text;

-- Additional SELECT policy (RLS policies for the same command are OR'd
-- together, so this adds to "Users can read own profile" rather than
-- replacing it): a provider may read the profile of any client who has a
-- booking against a store they own.
CREATE POLICY "Providers can read their clients' profiles"
  ON public.users FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.bookings b
      JOIN public.provider_profiles pp ON pp.id = b.provider_id
      WHERE b.client_id = public.users.id
        AND pp.user_id = auth.uid()
    )
  );
