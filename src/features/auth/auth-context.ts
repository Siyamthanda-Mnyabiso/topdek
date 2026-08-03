import { createContext } from 'react'
import type { User } from '@/types/database'
import type { Session, User as SupabaseUser } from '@supabase/supabase-js'

export interface AuthContextValue {
  session: Session | null
  authUser: SupabaseUser | null
  profile: User | null
  isLoading: boolean
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
