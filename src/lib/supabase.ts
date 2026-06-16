import { createClient } from '@supabase/supabase-js'
import type {
  ProviderProfile,
  User,
} from '@/types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Copy .env.example to .env and add your Supabase credentials.',
  )
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '')

export type UserInsert = Pick<User, 'id' | 'email' | 'role'> & { created_at?: string }

export type ProviderProfileInsert = Pick<
  ProviderProfile,
  'user_id' | 'business_name'
> & {
  description?: string | null
  location?: string | null
  phone?: string | null
  logo_url?: string | null
  cover_image_url?: string | null
}
