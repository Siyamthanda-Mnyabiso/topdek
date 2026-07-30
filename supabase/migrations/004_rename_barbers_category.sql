-- The "Barbers" service category read as a profession/industry label next
-- to a specific service name on the provider dashboard (e.g. "Consultation"
-- badged "BARBERS"), which testers found confusing. The option was renamed
-- to "Haircuts" in the app (src/features/provider/pages/ServicesPage.tsx)
-- to match the other category labels, which describe the service itself
-- rather than the trade. Backfill existing rows so already-created services
-- pick up the new label too.

UPDATE public.services
SET category = 'Haircuts'
WHERE category = 'Barbers';
