import type {
  ProviderProfile,
  User,
} from '@/types/database'

export type UserInsert = Pick<User, 'id' | 'email' | 'role'> & { created_at?: string }

export type ProviderProfileInsert = Pick<
  ProviderProfile,
  'user_id' | 'business_name' | 'slug'
> & {
  description?: string | null
  location?: string | null
  phone?: string | null
  logo_url?: string | null
  cover_image_url?: string | null
  instagram_url?: string | null
  facebook_url?: string | null
  tiktok_url?: string | null
  twitter_url?: string | null
  whatsapp_number?: string | null
  website_url?: string | null
}
