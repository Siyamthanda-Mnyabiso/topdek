import 'server-only'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { SUPABASE_URL } from '@/lib/supabase/env'

/** Bypasses RLS — only ever call from server-side code (Route Handlers,
 * Server Actions), never expose to the client. */
export function createServiceClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
  }

  return createSupabaseClient(SUPABASE_URL, serviceRoleKey, {
    auth: { persistSession: false },
  })
}
