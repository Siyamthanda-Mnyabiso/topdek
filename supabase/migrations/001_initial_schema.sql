-- TopDeck initial schema with Row Level Security
-- Run this in the Supabase SQL Editor or via supabase db push

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE ticket_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- ---------------------------------------------------------------------------
-- Helper functions for RLS
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_support_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
      AND role LIKE 'support_%'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_provider_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
      AND role = 'provider'
  );
$$;

CREATE OR REPLACE FUNCTION public.owns_provider_profile(profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.provider_profiles
    WHERE id = profile_id
      AND user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.owns_provider_profile_by_user(profile_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT profile_user_id = auth.uid();
$$;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

CREATE TABLE public.users (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL CHECK (
    role IN (
      'client',
      'provider',
      'support_agent',
      'support_supervisor',
      'support_manager',
      'support_super_admin'
    )
  ),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.provider_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.users (id) ON DELETE CASCADE,
  business_name text NOT NULL,
  description text,
  location text,
  phone text,
  logo_url text,
  cover_image_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES public.provider_profiles (id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  price numeric(10, 2) NOT NULL CHECK (price >= 0),
  duration integer NOT NULL CHECK (duration > 0),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  provider_id uuid NOT NULL REFERENCES public.provider_profiles (id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES public.services (id) ON DELETE RESTRICT,
  status booking_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.saved_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  provider_id uuid NOT NULL REFERENCES public.provider_profiles (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_id, provider_id)
);

CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  provider_id uuid NOT NULL REFERENCES public.provider_profiles (id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_id, provider_id)
);

CREATE TABLE public.tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  subject text NOT NULL,
  status ticket_status NOT NULL DEFAULT 'open',
  priority ticket_priority NOT NULL DEFAULT 'medium',
  assigned_to uuid REFERENCES public.users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.ticket_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.tickets (id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

CREATE INDEX idx_provider_profiles_user_id ON public.provider_profiles (user_id);
CREATE INDEX idx_services_provider_id ON public.services (provider_id);
CREATE INDEX idx_services_active ON public.services (is_active) WHERE is_active = true;
CREATE INDEX idx_bookings_client_id ON public.bookings (client_id);
CREATE INDEX idx_bookings_provider_id ON public.bookings (provider_id);
CREATE INDEX idx_saved_providers_client_id ON public.saved_providers (client_id);
CREATE INDEX idx_reviews_provider_id ON public.reviews (provider_id);
CREATE INDEX idx_tickets_user_id ON public.tickets (user_id);
CREATE INDEX idx_tickets_assigned_to ON public.tickets (assigned_to);
CREATE INDEX idx_ticket_messages_ticket_id ON public.ticket_messages (ticket_id);

-- ---------------------------------------------------------------------------
-- Updated_at triggers
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER provider_profiles_updated_at
  BEFORE UPDATE ON public.provider_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER tickets_updated_at
  BEFORE UPDATE ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;

-- USERS policies
CREATE POLICY "Users can read own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- PROVIDER_PROFILES policies
CREATE POLICY "Anyone can read provider profiles"
  ON public.provider_profiles FOR SELECT
  USING (true);

CREATE POLICY "Providers can create own profile"
  ON public.provider_profiles FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND public.is_provider_user()
  );

CREATE POLICY "Providers can update own profile"
  ON public.provider_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- SERVICES policies
CREATE POLICY "Clients can read active services"
  ON public.services FOR SELECT
  USING (is_active = true OR public.owns_provider_profile(provider_id));

CREATE POLICY "Providers can insert own services"
  ON public.services FOR INSERT
  WITH CHECK (public.owns_provider_profile(provider_id));

CREATE POLICY "Providers can update own services"
  ON public.services FOR UPDATE
  USING (public.owns_provider_profile(provider_id))
  WITH CHECK (public.owns_provider_profile(provider_id));

CREATE POLICY "Providers can delete own services"
  ON public.services FOR DELETE
  USING (public.owns_provider_profile(provider_id));

-- BOOKINGS policies
CREATE POLICY "Clients can create bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients can read own bookings"
  ON public.bookings FOR SELECT
  USING (auth.uid() = client_id);

CREATE POLICY "Providers can view assigned bookings"
  ON public.bookings FOR SELECT
  USING (public.owns_provider_profile(provider_id));

CREATE POLICY "Providers can update assigned bookings"
  ON public.bookings FOR UPDATE
  USING (public.owns_provider_profile(provider_id))
  WITH CHECK (public.owns_provider_profile(provider_id));

-- SAVED_PROVIDERS policies
CREATE POLICY "Clients can manage saved providers"
  ON public.saved_providers FOR ALL
  USING (auth.uid() = client_id)
  WITH CHECK (auth.uid() = client_id);

-- REVIEWS policies
CREATE POLICY "Anyone can read reviews"
  ON public.reviews FOR SELECT
  USING (true);

CREATE POLICY "Clients can create reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients can update own reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = client_id)
  WITH CHECK (auth.uid() = client_id);

-- TICKETS policies
CREATE POLICY "Users can create own tickets"
  ON public.tickets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own tickets"
  ON public.tickets FOR SELECT
  USING (auth.uid() = user_id OR public.is_support_user());

CREATE POLICY "Support can update tickets"
  ON public.tickets FOR UPDATE
  USING (public.is_support_user())
  WITH CHECK (public.is_support_user());

-- TICKET_MESSAGES policies
CREATE POLICY "Ticket participants can read messages"
  ON public.ticket_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tickets t
      WHERE t.id = ticket_id
        AND (t.user_id = auth.uid() OR public.is_support_user())
    )
  );

CREATE POLICY "Ticket participants can send messages"
  ON public.ticket_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.tickets t
      WHERE t.id = ticket_id
        AND (t.user_id = auth.uid() OR public.is_support_user())
    )
  );

-- ---------------------------------------------------------------------------
-- Storage bucket (run separately if using Supabase Storage UI)
-- ---------------------------------------------------------------------------
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('provider-assets', 'provider-assets', true);
