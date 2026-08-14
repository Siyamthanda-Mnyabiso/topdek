-- Lets providers add a WhatsApp contact number to their public storefront,
-- shown as a click-to-chat wa.me link alongside their other social links.

ALTER TABLE public.provider_profiles
  ADD COLUMN IF NOT EXISTS whatsapp_number text;
