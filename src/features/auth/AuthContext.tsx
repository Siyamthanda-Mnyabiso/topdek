import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { User } from '@/types/database'

interface AuthContextValue {
  session: Session | null
  authUser: SupabaseUser | null
  profile: User | null
  isLoading: boolean
  signUp: (email: string, password: string) => Promise<{ error: string | null }>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

async function fetchUserProfile(userId: string): Promise<User | null> {
  const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

  if (error) {
    console.error('Failed to fetch user profile:', error.message)
    return null
  }

  return data as User | null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [authUser, setAuthUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshProfile = useCallback(async () => {
    if (!authUser) {
      setProfile(null)
      return
    }
    const userProfile = await fetchUserProfile(authUser.id)
    setProfile(userProfile)
  }, [authUser])

  useEffect(() => {
    let mounted = true

    async function initAuth() {
      const { data } = await supabase.auth.getSession()

      if (!mounted) return

      setSession(data.session)
      setAuthUser(data.session?.user ?? null)

      if (data.session?.user) {
        const userProfile = await fetchUserProfile(data.session.user.id)
        if (mounted) setProfile(userProfile)
      }

      if (mounted) setIsLoading(false)
    }

    void initAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession)
      setAuthUser(nextSession?.user ?? null)

      if (nextSession?.user) {
        const userProfile = await fetchUserProfile(nextSession.user.id)
        setProfile(userProfile)
      } else {
        setProfile(null)
      }

      setIsLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signUp = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password })

    if (error) return { error: error.message }
    if (!data.user) return { error: 'Signup failed. Please try again.' }

    // Trigger handles the insert — wait briefly for it to complete
    await new Promise((resolve) => setTimeout(resolve, 500))

    const userProfile = await fetchUserProfile(data.user.id)
    setProfile(userProfile)

    return { error: null }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) return { error: error.message }

    if (data.user) {
      const userProfile = await fetchUserProfile(data.user.id)
      setProfile(userProfile)
    }

    return { error: null }
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setProfile(null)
  }, [])

  const value = useMemo(
      () => ({
        session,
        authUser,
        profile,
        isLoading,
        signUp,
        signIn,
        signOut,
        refreshProfile,
      }),
      [session, authUser, profile, isLoading, signUp, signIn, signOut, refreshProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}